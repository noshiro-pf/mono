/**
 * Auto-fix (`spec/worker.md`, "Auto-fix"): a failure that is only a fixer's
 * diff, fixed by running the fixer, amending what it wrote onto the pull
 * request's one commit, and pushing it leased.
 *
 * Every check job runs through `z:ci-job`, whose clean-tree check fails a job
 * that changed files, so a `fix:` or `gen:` entry of the check matrices fails
 * by changing files rather than by reporting anything, and the fix is to run
 * the same command and commit what it wrote. A job whose build or command
 * itself failed says so in an annotation (`notFixableAnnotation`). Which jobs
 * are shaped like that, and what reproduces each, is the repository's to say.
 */

import { contextStates, winningRuns, type HeadChecks } from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import type { AutoFixConfig } from '../config/index.mjs';
import { codeOwnersAt, ownedOf } from './code-owners.mjs';
import { pushLeased, remoteHead, withWorktree, type GitPlace } from './git.mjs';
import { git } from './run.mjs';
import { lastLines, shell, withCaptures } from './shell.mjs';

/**
 * What to run for the jobs that failed on `checks`, or why nothing is to be
 * run: declined unless **every** failed context, past `ignore`, matches a
 * fixer, and none of their check runs carries `notFixableAnnotation`. One real
 * failure beside them would put the pull request through a matrix that fails
 * anyway.
 */
export const planAutoFix = (
  checks: HeadChecks,
  config: AutoFixConfig | undefined,
  nowEpochMs: number,
): Result<AutoFixPlan, string> => {
  if (config === undefined) {
    return Result.err('the repository has no autoFix in its configuration');
  }

  const failed = Array.from(contextStates(checks, nowEpochMs))
    .filter(
      ([name, state]) =>
        state === 'failed' &&
        config.ignore.every((pattern) => !pattern.test(name)),
    )
    .map(([name]) => name);

  if (!Arr.isNonEmpty(failed)) {
    return Result.err('no job failed apart from the ignored ones');
  }

  const entries = failed.map((name) => ({
    name,
    fixer: fixerFor(name, config),
  }));

  const others = entries
    .filter(({ fixer }) => fixer === undefined)
    .map(({ name }) => name);

  if (Arr.isNonEmpty(others)) {
    return Result.err(
      `${others.join(', ')} failed, which is not a fixer's diff`,
    );
  }

  const refused = notFixable(checks, failed, config.notFixableAnnotation);

  if (Arr.isNonEmpty(refused)) {
    return Result.err(
      `${refused.join(', ')}: more than a diff failed (a build or a command exited non-zero, or the setup changed the tree), and nothing a fixer writes fixes that`,
    );
  }

  return Result.ok({
    before: config.before,
    prepare: Arr.uniq(
      config.prepare
        .filter(({ context }) => failed.some((name) => context.test(name)))
        .map(({ run }) => run),
    ),
    commands: Arr.uniq(
      entries
        .map(({ fixer }) => fixer)
        .filter((fixer) => fixer !== undefined)
        .toSorted((a, b) =>
          a.stage === b.stage
            ? a.command.localeCompare(b.command)
            : a.stage - b.stage,
        )
        .map(({ command }) => command),
    ),
    after: config.after,
  });
};

/**
 * Runs `plan` on pull request `pr` at `head` in a throwaway worktree, amends
 * what it wrote onto the branch's one commit, and pushes it leased against
 * `head`. Declined, with why, when the branch is not one commit on the base, a
 * command fails, nothing changed, or the fix touches a path `CODEOWNERS` (the
 * base's, read before anything runs) gives owners: a fix pushed in the queue's
 * name is not anyone's review of it.
 */
export const autoFixInWorktree = async (
  place: GitPlace,
  pr: Readonly<{ number: number; branch: string; head: string; base: string }>,
  plan: AutoFixPlan,
  world: Readonly<{
    log: (line: string) => void;
    stopRequested: () => boolean;
  }>,
): Promise<AutoFixResult> => {
  // The base's remote-tracking ref is named, not left to `remote.origin.fetch`:
  // the commit count and `CODEOWNERS` are read from it.
  const fetched = await git(place.cwd, [
    'fetch',
    '--quiet',
    'origin',
    `+refs/heads/${pr.base}:refs/remotes/origin/${pr.base}`,
    `refs/heads/${pr.branch}`,
  ]);

  if (Result.isErr(fetched)) {
    return Result.err(fetched.value);
  }

  const at = await remoteHead(place.cwd, pr.branch);

  if (Result.isErr(at)) {
    return at;
  }

  if (at.value !== pr.head) {
    return Result.ok({ kind: 'moved' });
  }

  const done = await withWorktree<AutoFixOutcome>(
    place,
    'auto-fix',
    pr.number,
    pr.head,
    async (worktree) => fixIn(worktree, place.cwd, pr, plan, world),
  );

  return done;
};

export type AutoFixPlan = Readonly<{
  /** What runs first, always. */
  before: readonly string[];
  /** What the failed jobs were given before they ran, each once. */
  prepare: readonly string[];
  /** The fixers, by stage, then by command. */
  commands: readonly string[];
  /** What settles their output. */
  after: readonly string[];
}>;

/**
 * Pushed the fixed `head`; found the branch `moved`; or `declined`, with why.
 * An error is a fetch or push GitHub may have caused.
 */
export type AutoFixOutcome = Readonly<
  | { kind: 'pushed'; head: string }
  | { kind: 'moved' }
  | { kind: 'declined'; why: string }
>;

export type AutoFixResult = Result<AutoFixOutcome, string>;

/**
 * The first fixer `name` matches, with its command: `$1` to `$9` the capture
 * groups, quoted, since a context's name is whatever its job chose.
 */
const fixerFor = (
  name: string,
  config: AutoFixConfig,
): Readonly<{ command: string; stage: number }> | undefined => {
  const fixer = config.fixers.find(({ context }) => context.test(name));

  const groups = fixer?.context.exec(name) ?? undefined;

  return fixer === undefined || groups === undefined
    ? undefined
    : { command: withCaptures(fixer.run, groups), stage: fixer.stage };
};

/**
 * Of the failed contexts `names`, those whose winning check run carries the
 * annotation `title`; one whose annotations were not read is left out, and the
 * fixer finds out for itself.
 */
const notFixable = (
  checks: HeadChecks,
  names: readonly string[],
  title: string | undefined,
): readonly string[] => {
  if (title === undefined) {
    return [];
  }

  const winners = winningRuns(checks.runs);

  return names.filter((name) => {
    const titles = winners.get(name)?.annotationTitles;

    return (
      titles !== undefined &&
      Result.isOk(titles) &&
      titles.value.includes(title)
    );
  });
};

const declined = (why: string): Result<AutoFixOutcome, string> =>
  Result.ok({ kind: 'declined', why });

const fixIn = async (
  worktree: string,
  cwd: string,
  pr: Readonly<{ number: number; branch: string; head: string; base: string }>,
  plan: AutoFixPlan,
  world: Readonly<{
    log: (line: string) => void;
    stopRequested: () => boolean;
  }>,
): Promise<Result<AutoFixOutcome, string>> => {
  const commits = await git(worktree, [
    'rev-list',
    '--count',
    `refs/remotes/origin/${pr.base}..HEAD`,
  ]);

  if (Result.isErr(commits)) {
    return declined(`cannot count the commits: ${commits.value}`);
  }

  if (commits.value.trim() !== '1') {
    return declined(
      `the branch has ${commits.value.trim()} commits on ${pr.base}, and Auto-fix amends a branch of one`,
    );
  }

  const codeOwners = await codeOwnersAt(
    worktree,
    `refs/remotes/origin/${pr.base}`,
  );

  if (Result.isErr(codeOwners)) {
    return declined(codeOwners.value);
  }

  for (const step of [
    ...plan.before,
    ...plan.prepare,
    ...plan.commands,
    ...plan.after,
  ]) {
    if (world.stopRequested()) {
      return declined('stopped before it finished');
    }

    world.log(`#${pr.number}: ${step}`);

    // eslint-disable-next-line no-await-in-loop -- each step after the last
    const ran = await shell(worktree, step);

    if (Result.isErr(ran)) {
      return declined(`\`${step}\` failed:\n${lastLines(ran.value, 60)}`);
    }
  }

  const status = await git(worktree, ['status', '--porcelain']);

  if (Result.isErr(status)) {
    return declined(`cannot read what changed: ${status.value}`);
  }

  if (status.value.trim() === '') {
    return declined(
      `${plan.commands.join(', ')} changed nothing here, so the failure is not the diff`,
    );
  }

  const added = await git(worktree, ['add', '--all']);

  const amended = Result.isErr(added)
    ? added
    : await git(worktree, ['commit', '--quiet', '--amend', '--no-edit']);

  if (Result.isErr(amended)) {
    return declined(`cannot amend: ${lastLines(amended.value, 5)}`);
  }

  const head = await git(worktree, ['rev-parse', 'HEAD']);

  if (Result.isErr(head)) {
    return declined(`cannot read the amended head: ${head.value}`);
  }

  const sha = head.value.trim();

  const changed = await git(worktree, [
    'diff',
    '--name-only',
    '--no-renames',
    '-z',
    pr.head,
    sha,
  ]);

  if (Result.isErr(changed)) {
    return declined(`cannot list what the fix changed: ${changed.value}`);
  }

  const owned = ownedOf(
    changed.value.split('\0').filter((file) => file !== ''),
    codeOwners.value,
  );

  if (Arr.isNonEmpty(owned)) {
    return declined(
      `the fix changes ${owned.join(', ')}, which CODEOWNERS gives owners, and a fix pushed in someone's name is not their review of it`,
    );
  }

  if (world.stopRequested()) {
    return declined('stopped before pushing');
  }

  const pushed = await pushLeased(cwd, {
    branch: pr.branch,
    sha,
    lease: pr.head,
  });

  return Result.map(pushed, (outcome) =>
    outcome === 'moved'
      ? ({ kind: 'moved' } as const)
      : ({ kind: 'pushed', head: sha } as const),
  );
};
