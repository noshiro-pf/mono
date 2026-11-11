/**
 * Regenerate (`spec/worker.md`, "Regenerate"): a rebase conflict only in files
 * a generator writes, resolved by taking the base's side of each and running
 * the generator, instead of setting the pull request aside for a session to do
 * what the generator would. Which files a repository generates, and how, is its
 * own to say (`regenerate` in `.github/unblock-prs.json`).
 */

import { Arr, Result } from 'ts-data-forge';
import type { RegenerateConfig } from '../config/index.mjs';
import { codeOwnersAt, ownedOf } from './code-owners.mjs';
import { git } from './run.mjs';
import { lastLines, shell, withCaptures } from './shell.mjs';

/**
 * The commands that write `conflicted` again, each once, in the order the
 * generators are declared: the first generator whose `path` matches a file
 * decides it. Every file has to match one; otherwise the files none matches,
 * which only a hand resolves.
 */
export const planRegeneration = (
  conflicted: readonly string[],
  config: RegenerateConfig,
): Result<readonly string[], readonly string[]> => {
  const matched = conflicted.map((file) => ({
    file,
    command: commandFor(file, config),
  }));

  const unmatched = matched
    .filter(({ command }) => command === undefined)
    .map(({ file }) => file);

  return Arr.isNonEmpty(unmatched)
    ? Result.err(unmatched)
    : Result.ok(
        Arr.uniq(
          matched
            .map(({ command }) => command)
            .filter((command) => command !== undefined)
            .toSorted((a, b) => a.index - b.index)
            .map(({ run }) => run),
        ),
      );
};

/**
 * What a set-aside says of a rebase that conflicted: the files, the merged pull
 * requests that changed them on the base (`changedBy`), and those of them a
 * generator could have written again (`wouldRegenerate`); or what git printed,
 * when it named no file.
 */
export const describeConflict = (
  conflicted: readonly string[],
  output: string,
  onto: string,
  wouldRegenerate: readonly string[],
  changedBy: readonly number[],
): string =>
  Arr.isNonEmpty(conflicted)
    ? [
        `conflicts with ${onto} in ${conflicted.map((file) => `\`${file}\``).join(', ')}`,
        Arr.isNonEmpty(changedBy)
          ? ` (changed there by ${changedBy.map((n) => `#${n}`).join(', ')})`
          : '',
        Arr.isNonEmpty(wouldRegenerate)
          ? `; only ${wouldRegenerate.map((file) => `\`${file}\``).join(', ')} could be generated again`
          : '',
      ].join('')
    : (`the rebase onto ${onto} failed: ${output.replaceAll(/\s+/gu, ' ').trim()}` as const);

/** How a conflict only in generated files is resolved. */
export type Regeneration = Readonly<{
  config: RegenerateConfig;
  log: (line: string) => void;
  stopRequested: () => boolean;
}>;

/**
 * Finishes a rebase in `worktree` that stopped on a conflict, when
 * `regeneration` writes again every file it conflicts in, at every commit it
 * stops at: takes `onto`'s side of each, continues, runs `before` and the
 * generators, and amends what they wrote onto the pull request's one commit.
 * The files written again, or why not: `ofPullRequest` for the pull request's
 * own (a set-aside), or not for what is retried, the environment's or the
 * tool's: say a stop asked for, a rebase stopped on no file, a failed `before`
 * (an install the network may have failed), or a count of commits unread or
 * misjudged. A rebase refused while stopped is aborted. A generator that leaves
 * a file as `onto` has it is refused too: the pull request changed that file
 * and the generator did not reproduce its side. What the generators write is
 * judged by the `CODEOWNERS` at `codeOwnersRef`, a commit of the default branch
 * read just now, whatever the rebase is onto: never a
 * remote-tracking ref, which only a fetch of the branch moves. `replayed` is
 * the range the rebase replays, from `upstream` to the pull request's `head`.
 */
export const resolveByRegenerating = async (
  worktree: string,
  regeneration: Regeneration | undefined,
  onto: Onto,
  output: string,
  codeOwnersRef: string,
  replayed: Readonly<{ upstream: string; head: string }>,
): Promise<Result<readonly string[], RegenerationRefused>> => {
  const refused = (
    detail: string,
    ofPullRequest: boolean,
  ): Result<readonly string[], RegenerationRefused> =>
    Result.err({ detail, ofPullRequest });

  const resolved = await takeBaseSides(worktree, regeneration, onto, output, {
    files: [],
    commands: [],
  });

  if (Result.isErr(resolved)) {
    await git(worktree, ['rebase', '--abort']);

    return resolved;
  }

  const { files, commands, regeneration: by } = resolved.value;

  // Counted both before and after: the rebase drops a commit that taking the
  // base's sides emptied, so after it a branch of two can be one. Counted once
  // the stops are resolved rather than first, since a refusal names the
  // generated files, which only the stops tell.
  const [picked, after] = await Promise.all([
    commitsPicked(worktree, replayed),
    git(worktree, ['rev-list', '--count', `${onto.sha}..HEAD`]),
  ]);

  if (Result.isErr(picked) || Result.isErr(after)) {
    return refused(
      `cannot count the commits: ${Result.isErr(picked) ? picked.value : after.value}`,
      false,
    );
  }

  const left = after.value.trim();

  const conflictsOnly =
    `conflicts with ${onto.name} only in generated files (${files.join(', ')})` as const;

  if (picked.value !== '1') {
    return refused(
      `${conflictsOnly}, but the branch has ${picked.value} commits on ${onto.name}, and Regenerate amends a branch of one${left === '0' ? `; taking ${onto.name}'s side of them empties every one` : ''}`,
      true,
    );
  }

  // One commit picked leaves one, or none when the resolution emptied it; any
  // other count means the picking was misjudged, and nothing is amended on it.
  if (left !== '1') {
    return refused(
      left === '0'
        ? emptied(conflictsOnly, onto.name)
        : `${conflictsOnly}, but the rebase left ${left} commits on ${onto.name} where one was counted, and Regenerate amends one`,
      // Emptied is the pull request's; a count that misjudged the picking is
      // the tool's, retried rather than set aside.
      left === '0',
    );
  }

  const owners = await codeOwnersAt(worktree, codeOwnersRef);

  if (Result.isErr(owners)) {
    return refused(owners.value, false);
  }

  const headBefore = await git(worktree, ['rev-parse', 'HEAD']);

  if (Result.isErr(headBefore)) {
    return refused(`cannot read the head: ${headBefore.value}`, false);
  }

  const { before } = by.config;

  for (const [index, step] of [...before, ...commands].entries()) {
    if (by.stopRequested()) {
      return refused('stopped before the generated files were written', false);
    }

    by.log(step);

    // eslint-disable-next-line no-await-in-loop -- each step after the last
    const ran = await shell(worktree, step);

    if (Result.isErr(ran)) {
      return refused(
        `${conflictsOnly}, and \`${step}\` failed:\n${lastLines(ran.value, 60)}`,
        index >= before.length,
      );
    }
  }

  const sameAsBase = await Promise.all(
    files.map(async (file) =>
      Result.isOk(
        await git(worktree, [
          '--literal-pathspecs',
          'diff',
          '--quiet',
          onto.sha,
          '--',
          file,
        ]),
      )
        ? file
        : undefined,
    ),
  );

  const unchanged = sameAsBase.filter((file) => file !== undefined);

  if (Arr.isNonEmpty(unchanged)) {
    return refused(
      `conflicts with ${onto.name} in ${files.join(', ')}; generating ${unchanged.join(', ')} again gave back ${onto.name}'s version, so the pull request's side of it is lost`,
      true,
    );
  }

  const added = await git(worktree, ['add', '--all']);

  const staged = Result.isErr(added)
    ? added
    : await git(worktree, [
        'diff',
        '--cached',
        '--name-only',
        '--no-renames',
        '-z',
        headBefore.value.trim(),
      ]);

  if (Result.isErr(staged)) {
    return refused(`cannot list what was generated: ${staged.value}`, false);
  }

  const owned = ownedOf(
    staged.value.split('\0').filter((file) => file !== ''),
    owners.value,
  );

  if (Arr.isNonEmpty(owned)) {
    return refused(
      `${conflictsOnly}, but generating them again changes ${owned.join(', ')}, which CODEOWNERS gives owners: a person takes it`,
      true,
    );
  }

  const amended = await git(worktree, [
    'commit',
    '--quiet',
    '--amend',
    '--no-edit',
  ]);

  return Result.isErr(amended)
    ? refused(
        `cannot amend the generated files onto the commit: ${lastLines(amended.value, 5)}`,
        true,
      )
    : Result.ok(files);
};

/**
 * How many commits a rebase of `replayed` picks, as a decimal string: merges and
 * commits `upstream` already has by their patch left out, as the rebase leaves
 * them (its configuration is pinned, `gitEnv` in `run.mts`). The patch-ids are
 * computed only when the plain count is not one already, the usual case.
 * Counted from the commits, not from the rebase's own todo files, whose layout
 * depends on its backend.
 */
const commitsPicked = async (
  worktree: string,
  { upstream, head }: Readonly<{ upstream: string; head: string }>,
): Promise<Result<string, string>> => {
  const plain = await git(worktree, [
    'rev-list',
    '--count',
    '--no-merges',
    `${upstream}..${head}`,
  ]);

  if (Result.isErr(plain) || plain.value.trim() === '1') {
    return Result.map(plain, (count) => count.trim());
  }

  const picked = await git(worktree, [
    'rev-list',
    '--count',
    '--no-merges',
    '--cherry-pick',
    '--right-only',
    `${upstream}...${head}`,
  ]);

  return Result.map(picked, (count) => count.trim());
};

/** The commit a rebase is onto, and what a set-aside calls it. */
export type Onto = Readonly<{ sha: string; name: string }>;

/** Why {@link resolveByRegenerating} left the conflict as it was. */
export type RegenerationRefused = Readonly<{
  /** What a set-aside says. */
  detail: string;
  /** Whether it is the pull request's own, rather than the environment's. */
  ofPullRequest: boolean;
}>;

/** A squash merge's subject ends with its pull request: `… (#123)`. */
const SQUASH_SUBJECT = /\(#(?<number>\d+)\)$/u;

/** The first generator `file` matches, by its place in the list. */
const commandFor = (
  file: string,
  config: RegenerateConfig,
): Readonly<{ index: number; run: string }> | undefined => {
  const index = config.generators.findIndex(({ path }) => path.test(file));

  const generator = config.generators[index];

  const groups = generator?.path.exec(file) ?? undefined;

  return generator === undefined || groups === undefined
    ? undefined
    : { index, run: withCaptures(generator.run, groups) };
};

/** What a set-aside says of a commit that changed only generated files. */
const emptied = (conflictsOnly: string, onto: string): string =>
  `${conflictsOnly}, and its commit changes nothing else, so taking ${onto}'s side of them leaves it empty` as const;

/**
 * The merged pull requests that changed `files` on `onto` since the base the
 * branch was rebased from, by the `(#N)` a squash merge ends its subject with:
 * the other side of the conflict. Read mid-rebase, where `ORIG_HEAD` is the
 * head being rebased; empty when that cannot be read.
 */
const changedOnBase = async (
  worktree: string,
  onto: string,
  files: readonly string[],
): Promise<readonly number[]> => {
  const base = await git(worktree, ['merge-base', 'ORIG_HEAD', onto]);

  if (Result.isErr(base) || !Arr.isNonEmpty(files)) {
    return [];
  }

  // Literal: a generated path may hold `[`, `*` or `?`, which a pathspec reads
  // as a pattern matching other files.
  const subjects = await git(worktree, [
    '--literal-pathspecs',
    'log',
    '--format=%s',
    `${base.value.trim()}..${onto}`,
    '--',
    ...files,
  ]);

  return Result.isErr(subjects)
    ? []
    : Arr.uniq(
        subjects.value
          .split('\n')
          .map((subject) => SQUASH_SUBJECT.exec(subject)?.groups?.['number'])
          .filter((number) => number !== undefined)
          .map(Number),
      );
};

/**
 * Takes `onto`'s side of every conflicted file and continues, for as long as
 * the rebase stops on files `regeneration` regenerates: every file taken so and
 * the commands that write them again, with the `regeneration` they are by, once
 * the rebase has finished; or why not. With no `regeneration`, every stop is
 * refused, with what a set-aside says of it.
 */
const takeBaseSides = async (
  worktree: string,
  regeneration: Regeneration | undefined,
  onto: Onto,
  output: string,
  sofar: Readonly<{ files: readonly string[]; commands: readonly string[] }>,
): Promise<
  Result<
    Readonly<{
      files: readonly string[];
      commands: readonly string[];
      regeneration: Regeneration;
    }>,
    RegenerationRefused
  >
> => {
  // `-z`: without it a path outside ASCII comes back quoted, which neither a
  // generator's pattern nor `git checkout` reads as the path.
  const unmerged = await git(worktree, [
    'diff',
    '--name-only',
    '--diff-filter=U',
    '-z',
  ]);

  const conflicted = Result.isOk(unmerged)
    ? unmerged.value.split('\0').filter((file) => file !== '')
    : ([] as const);

  // A rebase that stopped, at first or on continuing, with no file unmerged did
  // not stop on the pull request's changes: an upstream it does not have, a
  // lock, a commit that could not be written. That is the environment's,
  // retried, never a set-aside. (A commit that taking the base's sides empties
  // is dropped by the rebase, not stopped at; the counts before and after it
  // find that.)
  if (!Arr.isNonEmpty(conflicted)) {
    return Result.err({
      detail: describeConflict([], lastLines(output, 5), onto.name, [], []),
      ofPullRequest: false,
    });
  }

  const conflictOf = async (
    wouldRegenerate: readonly string[],
  ): Promise<RegenerationRefused> =>
    ({
      detail: describeConflict(
        conflicted,
        lastLines(output, 5),
        onto.name,
        wouldRegenerate,
        await changedOnBase(worktree, onto.sha, conflicted),
      ),
      ofPullRequest: true,
    }) as const;

  if (regeneration === undefined) {
    return Result.err(await conflictOf([]));
  }

  const plan = planRegeneration(conflicted, regeneration.config);

  if (Result.isErr(plan)) {
    return Result.err(
      await conflictOf(conflicted.filter((file) => !plan.value.includes(file))),
    );
  }

  const checkedOut = await git(worktree, [
    '--literal-pathspecs',
    'checkout',
    '--ours',
    '--',
    ...conflicted,
  ]);

  const taken = Result.isErr(checkedOut)
    ? checkedOut
    : await git(worktree, ['--literal-pathspecs', 'add', '--', ...conflicted]);

  if (Result.isErr(taken)) {
    return Result.err({
      detail: `conflicts with ${onto.name} in ${conflicted.join(', ')}, generated files whose ${onto.name} side cannot be taken: ${lastLines(taken.value, 5)}`,
      ofPullRequest: true,
    });
  }

  const continued = await git(worktree, ['rebase', '--continue']);

  const next = {
    files: Arr.uniq([...sofar.files, ...conflicted]),
    commands: Arr.uniq([...sofar.commands, ...plan.value]),
  } as const;

  return Result.isOk(continued)
    ? Result.ok({ ...next, regeneration })
    : takeBaseSides(worktree, regeneration, onto, continued.value, next);
};
