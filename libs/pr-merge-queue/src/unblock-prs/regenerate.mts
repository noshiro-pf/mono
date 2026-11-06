/**
 * Resolving a rebase conflict that is only in generated files by generating
 * them again, instead of setting the pull request aside for a session to do
 * what the generator would.
 *
 * A replay of the pull requests merged from #3023 to #3575 found 42 rebases
 * that conflicted; 8 of them only in `docs/package-dependencies.md` and
 * `export *` barrels, which this repository declares, and taking the base's
 * side of each and running its generator reproduced the resolution that was
 * pushed in all 14 such files checked. Which files a repository generates, and
 * how, is its own to say (`config.mts`, `regenerate`).
 */

import { Arr, Result } from 'ts-data-forge';
import { git, sh } from '../lib/index.mjs';
import { withCaptures } from './auto-fix.mjs';
import type { RegenerateConfig } from './config.mjs';
import { describeConflict } from './set-aside-detail.mjs';
import { lastLines, stopRequested } from './util.mjs';

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
            .toSorted(
              (a, b) => (a.command?.index ?? 0) - (b.command?.index ?? 0),
            )
            .map(({ command }) => command?.run ?? ''),
        ),
      );
};

/**
 * Finishes a rebase in `worktreeDir` that stopped on a conflict, when `config`
 * regenerates every file it conflicted in, at every commit it stops at: takes
 * `onto`'s side of each, continues, then installs (`before`), runs the
 * generators and amends what they wrote onto the pull request's one commit.
 *
 * Resolves to the files it wrote again, or, having aborted the rebase, to the
 * sentence a set-aside says: the conflict as before, naming the files that
 * could have been regenerated when some could not; or what stopped it. A
 * generator that leaves a file as `onto` has it stops it too, since the pull
 * request changed that file and the generator did not reproduce its side (a
 * hand-written barrel a generator preserves, say). Every refusal is the pull
 * request's own (`ofPullRequest`) but a failed `before`, an install the network
 * may have failed: that one ends the cycle rather than going on to the next
 * candidate (`release-failure.mts`).
 */
export const resolveByRegenerating = async (
  worktreeDir: string,
  config: RegenerateConfig | undefined,
  onto: string,
  output: string,
  carried: readonly number[] = [],
): Promise<Result<readonly string[], RegenerationRefused>> => {
  const refused = (
    detail: string,
    ofPullRequest = true,
  ): Result<readonly string[], RegenerationRefused> =>
    Result.err({ detail, ofPullRequest });

  const resolved = await takeBaseSides(
    worktreeDir,
    config,
    { onto, carried },
    output,
    [],
    [],
  );

  if (Result.isErr(resolved)) {
    await git('git rebase --abort', worktreeDir);

    return refused(resolved.value);
  }

  const { files, commands } = resolved.value;

  const commits = await git(
    `git rev-list --count ${sh(`${onto}..HEAD`)}`,
    worktreeDir,
  );

  const count = Result.isOk(commits) ? commits.value.trim() : undefined;

  if (count === '0') {
    // git drops a commit the resolution emptied: the pull request's commit
    // changed nothing but the files generated again.
    return refused(emptied(onto, files, ''));
  }

  if (count !== '1') {
    return refused(
      `conflicts with ${onto} only in generated files (${files.join(', ')}), but the branch is not one commit on it, and only one is amended`,
    );
  }

  const before = config?.before ?? [];

  for (const step of [...before, ...commands]) {
    if (stopRequested()) {
      return refused('stopped before the generated files were written', false);
    }

    const ran = await git(step, worktreeDir);

    if (Result.isErr(ran)) {
      return refused(
        `conflicts with ${onto} only in generated files (${files.join(', ')}), and \`${step}\` failed: ${lastLines(ran.value, 5)}`,
        !before.includes(step),
      );
    }
  }

  const unchanged = await filterAsync(files, async (file) =>
    Result.isOk(
      await git(`git diff --quiet ${sh(onto)} -- ${sh(file)}`, worktreeDir),
    ),
  );

  if (Arr.isNonEmpty(unchanged)) {
    return refused(
      `conflicts with ${onto} in ${files.join(', ')}; generating ${unchanged.join(', ')} again gave back ${onto}'s version, so the pull request's side of it is lost`,
    );
  }

  const amended = await git(
    'git add --all && git commit --quiet --amend --no-edit',
    worktreeDir,
  );

  return Result.isErr(amended)
    ? refused(
        `cannot amend the generated files onto the commit: ${lastLines(amended.value, 5)}`,
      )
    : Result.ok(files);
};

/** Why {@link resolveByRegenerating} left the conflict as it was. */
export type RegenerationRefused = Readonly<{
  /** What a set-aside says. */
  detail: string;
  /** Whether it is the pull request's own, rather than the environment's. */
  ofPullRequest: boolean;
}>;

/** What a set-aside says of a commit that changed only generated files. */
const emptied = (
  onto: string,
  files: readonly string[],
  output: string,
): string =>
  `conflicts with ${onto} only in generated files (${files.join(', ')}), and its commit changes nothing else, so taking ${onto}'s side of them leaves it empty${output === '' ? '' : `: ${output}`}` as const;

/**
 * The merged pull requests that changed `files` on `onto` since the base the
 * branch was rebased from, by the `(#N)` a squash merge ends its subject with:
 * the other side of the conflict, but `carried`: a merged lower layer the
 * branch was stacked on, whose changes it contains. Read mid-rebase, where
 * `ORIG_HEAD` is the head being rebased; empty when that cannot be read.
 */
const changedOnBase = async (
  worktreeDir: string,
  onto: string,
  files: readonly string[],
  carried: readonly number[],
): Promise<readonly number[]> => {
  const base = await git(`git merge-base ORIG_HEAD ${sh(onto)}`, worktreeDir);

  if (Result.isErr(base) || !Arr.isNonEmpty(files)) {
    return [];
  }

  const subjects = await git(
    `git log --format=%s ${sh(`${base.value.trim()}..${onto}`)} -- ${files.map(sh).join(' ')}`,
    worktreeDir,
  );

  return Result.isErr(subjects)
    ? []
    : Arr.uniq(
        subjects.value
          .split('\n')
          .map((subject) => SQUASH_SUBJECT.exec(subject)?.groups?.['number'])
          .filter((number) => number !== undefined)
          .map(Number)
          .filter((number) => !carried.includes(number)),
      );
};

/**
 * Takes `onto`'s side of every conflicted file and continues, for as long as
 * the rebase stops on files `config` regenerates. Resolves to every file taken
 * so and the commands that write them again, once the rebase has finished.
 */
const takeBaseSides = async (
  worktreeDir: string,
  config: RegenerateConfig | undefined,
  target: Readonly<{ onto: string; carried: readonly number[] }>,
  output: string,
  files: readonly string[],
  commands: readonly string[],
): Promise<
  Result<
    Readonly<{ files: readonly string[]; commands: readonly string[] }>,
    string
  >
> => {
  const { onto, carried } = target;

  const unmerged = await git(
    'git diff --name-only --diff-filter=U',
    worktreeDir,
  );

  const conflicted = Result.isOk(unmerged)
    ? unmerged.value.split('\n').filter((line) => line !== '')
    : ([] as const);

  if (Arr.isNonEmpty(files) && !Arr.isNonEmpty(conflicted)) {
    // Taking the base's side of every file the commit changed leaves nothing to
    // commit, which `rebase --continue` refuses.
    return Result.err(emptied(onto, files, lastLines(output, 2)));
  }

  if (config === undefined || !Arr.isNonEmpty(conflicted)) {
    return Result.err(
      describeConflict(
        conflicted,
        lastLines(output, 5),
        onto,
        [],
        await changedOnBase(worktreeDir, onto, conflicted, carried),
      ),
    );
  }

  const plan = planRegeneration(conflicted, config);

  if (Result.isErr(plan)) {
    return Result.err(
      describeConflict(
        conflicted,
        lastLines(output, 5),
        onto,
        conflicted.filter((file) => !plan.value.includes(file)),
        await changedOnBase(worktreeDir, onto, conflicted, carried),
      ),
    );
  }

  const quoted = conflicted.map(sh).join(' ');

  const taken = await git(
    `git checkout --ours -- ${quoted} && git add -- ${quoted}`,
    worktreeDir,
  );

  if (Result.isErr(taken)) {
    return Result.err(
      `conflicts with ${onto} in ${conflicted.join(', ')}, generated files whose ${onto} side cannot be taken: ${lastLines(taken.value, 5)}`,
    );
  }

  const continued = await git(
    'GIT_EDITOR=true git rebase --continue',
    worktreeDir,
  );

  const sofar = {
    files: Arr.uniq([...files, ...conflicted]),
    commands: Arr.uniq([...commands, ...plan.value]),
  } as const;

  return Result.isOk(continued)
    ? Result.ok(sofar)
    : takeBaseSides(
        worktreeDir,
        config,
        target,
        continued.value,
        sofar.files,
        sofar.commands,
      );
};

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

const filterAsync = async <A,>(
  items: readonly A[],
  keep: (item: A) => Promise<boolean>,
): Promise<readonly A[]> => {
  const kept = await Promise.all(items.map(keep));

  return items.filter((_, i) => kept[i] === true);
};
