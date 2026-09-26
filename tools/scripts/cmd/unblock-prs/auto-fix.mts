// cspell:ignore tmpfs

/**
 * Fixing a failure that is only a fixer's diff: running the fixer, amending
 * what it wrote onto the pull request's one commit, and pushing it.
 *
 * Every check job ends with `z:assert-repo-is-clean`, so a `fix:` or `gen:`
 * entry of the check matrices fails by _changing_ files rather than by
 * reporting anything, and the fix is to run the same command and commit what
 * it wrote. That much is mechanical; everything else a failing check asks for
 * is the skill's, or a person's, and is left to them.
 */

import * as os from 'node:os';
import * as path from 'node:path';
import { statesFromCheckRuns, type ContextState } from 'pr-report-core';
import { Arr, Result } from 'ts-data-forge';
import { git, listCheckRuns, remoteSha, removeWorktree } from './github.mjs';
import { pauseAllBut } from './release.mjs';
import { type AutoFixed, type PullRequest } from './types.mjs';
import { lastLines, log, sh, stopRequested } from './util.mjs';

/**
 * Tries once to fix the checks that failed on `head` by running the fixers
 * their matrix entries name, and pushes the result when there is one.
 *
 * Only when **every** failed job is such an entry: one real failure beside
 * them means the push would put the pull request through a matrix that fails
 * anyway, so the whole of it is left to whoever fixes the real one.
 *
 * The fixers run in a throwaway worktree, installed and built as CI installs
 * and builds, so the checkout this runs from is never touched. Where it goes
 * is {@link WORKTREE_ROOT}'s to say.
 *
 * The branch has to be exactly one commit on top of the base, and the fix is
 * amended onto it — a pull request is one commit (`Validate commit count`), and
 * squashing several means writing the message that lands on `main`, which is
 * not a mechanical act.
 */
export const autoFix = async (
  pr: PullRequest,
  head: string,
  defaultBranch: string,
): Promise<AutoFixed> => {
  const runs = await listCheckRuns(head);

  if (Result.isErr(runs)) {
    return declined(`cannot read the check runs: ${runs.value}`);
  }

  const plan = planAutoFix(statesFromCheckRuns(runs.value));

  if (Result.isErr(plan)) {
    return declined(plan.value);
  }

  const worktreeDir = path.join(WORKTREE_ROOT, `auto-fix-pr-${pr.number}`);

  // A previous run may have been interrupted with this worktree in place.
  await removeWorktree(worktreeDir);

  const branch = pr.headRefName;

  const fetched = await git(
    `git fetch --quiet origin ${sh(defaultBranch)} ${sh(branch)}`,
  );

  if (Result.isErr(fetched)) {
    return declined(`fetch failed: ${fetched.value}`);
  }

  const remoteHead = await git(`git rev-parse ${sh(`origin/${branch}`)}`);

  if (Result.isErr(remoteHead)) {
    return declined(`cannot resolve origin/${branch}: ${remoteHead.value}`);
  }

  if (remoteHead.value.trim() !== head) {
    return { kind: 'moved' };
  }

  const added = await git(
    `git worktree add --detach ${sh(worktreeDir)} ${sh(head)}`,
  );

  if (Result.isErr(added)) {
    return declined(`checkout failed: ${added.value}`);
  }

  log(
    `#${pr.number}: every failed job is a fixer's diff; running ${plan.value.commands.join(', ')} in ${worktreeDir}.`,
  );

  const result = await fixInWorktree(
    pr,
    head,
    defaultBranch,
    plan.value,
    worktreeDir,
  );

  await removeWorktree(worktreeDir);

  return result;
};

/**
 * What to run for the jobs that failed, or why nothing is to be run.
 *
 * `states` is every context on the head commit. A failed aggregate
 * (`*-result / result`) is only the echo of a job that failed under it, so it
 * is not read; every other failure has to be a `code-check (X)` or
 * `style-check (X)` entry whose `X` is a fixer. Those two matrices run
 * `pnpm run X` at the root and then assert a clean tree, so running `X` is
 * the whole of what reproduces them — the other workflows' jobs are not
 * shaped like that.
 *
 * A fixer is what the script prefixes say writes the tree: `fix:` and `gen:`
 * (`CLAUDE.md`, "Commands"), under `ws:` or `strict-lib:` as well. `ws:doc`
 * writes too, but what it writes is untracked; a tree it leaves dirty is a
 * generator it calls, and running it to find out takes ten minutes.
 */
export const planAutoFix = (
  states: ReadonlyMap<string, ContextState>,
): Result<AutoFixPlan, string> => {
  const failed = Array.from(states)
    .filter(([name, state]) => state === 'failed' && !AGGREGATE.test(name))
    .map(([name]) => name);

  if (!Arr.isNonEmpty(failed)) {
    return Result.err('no job failed apart from the aggregates');
  }

  const entries = failed.map((name) => ({ name, entry: fixerEntry(name) }));

  const others = entries
    .filter(({ entry }) => entry === undefined)
    .map(({ name }) => name);

  if (Arr.isNonEmpty(others)) {
    return Result.err(
      `${others.join(', ')} failed, which is not a fixer's diff`,
    );
  }

  const fixers = entries
    .map(({ entry }) => entry)
    .filter((entry) => entry !== undefined);

  return Result.ok({
    commands: fixers
      .map(({ command }) => command)
      .toSorted((a, b) =>
        stageOf(a) === stageOf(b)
          ? a.localeCompare(b)
          : stageOf(a) - stageOf(b),
      ),
    // CI builds before every `code-check` entry (the matrix unpacks the
    // `build` job's `dist/`) and before `style-check`'s `ws:gen`, whose
    // generators import workspace siblings through their `exports`.
    build: fixers.some(
      ({ workflow, command }) =>
        workflow === 'code-check' || command === 'ws:gen',
    ),
  });
};

export type AutoFixPlan = Readonly<{
  /** Generators first, formatters last. */
  commands: readonly string[];
  /** Whether `ws:build` has to run before them. */
  build: boolean;
}>;

/**
 * Not the OS temp directory the rebase uses: an install is a `node_modules`
 * tree, which the pnpm store hard-links only within one filesystem, and the
 * temp directory is often a tmpfs. Not the git directory or `~/.cache`
 * either: `fix:fmt:diff` skips every file with a `.git`, `.cache`, `dist`,
 * `build` or `out` segment anywhere in its absolute path, so a worktree under
 * one is formatted by nothing.
 */
const WORKTREE_ROOT = path.join(os.homedir(), '.local', 'state', 'unblock-prs');

const AGGREGATE = /^[\w-]+-result \/ result$/u;

const MATRIX_ENTRY = /^(code-check|style-check) \((.+)\)$/u;

const FIXER = /^(?:(?:ws|strict-lib):)?(?:fix|gen)(?::|$)/u;

const fixerEntry = (
  name: string,
): Readonly<{ workflow: string; command: string }> | undefined => {
  const matched = MATRIX_ENTRY.exec(name);

  if (matched === null) {
    return undefined;
  }

  const [, workflow, command] = matched;

  return workflow !== undefined && command !== undefined && FIXER.test(command)
    ? { workflow, command }
    : undefined;
};

/**
 * Generators write sources the others read, and formatters settle what the
 * others wrote; everything else runs between them.
 */
const stageOf = (command: string): number =>
  /(?:^|:)gen(?::|$)/u.test(command)
    ? 0
    : /(?:^|:)fix:fmt(?::|$)/u.test(command)
      ? 2
      : 1;

const declined = (detail: string): AutoFixed =>
  ({ kind: 'declined', detail }) as const;

/**
 * The part that happens inside the worktree, so that removing it afterwards
 * is one statement in the caller. Every command here resolves to a `Result`,
 * so the caller's next line always runs.
 */
const fixInWorktree = async (
  pr: PullRequest,
  head: string,
  defaultBranch: string,
  plan: AutoFixPlan,
  worktreeDir: string,
): Promise<AutoFixed> => {
  const commits = await git(
    `git rev-list --count ${sh(`origin/${defaultBranch}..HEAD`)}`,
    worktreeDir,
  );

  if (Result.isErr(commits)) {
    return declined(`cannot count the commits: ${commits.value}`);
  }

  if (commits.value.trim() !== '1') {
    return declined(
      `the branch is ${commits.value.trim()} commits on ${defaultBranch}, and only one is amended`,
    );
  }

  const steps = [
    'pnpm install --frozen-lockfile',
    ...(plan.build ? ['pnpm run ws:build'] : []),
    ...plan.commands.map((command) => `pnpm run ${sh(command)}`),
    // What the fixers wrote, formatted as `fmt` would format it on a
    // person's machine. Prettier only: `strict-lib/` is oxfmt's, and none of
    // the fixers but `strict-lib:fix:fmt` itself writes there.
    'pnpm run fix:fmt:diff',
  ] as const;

  for (const step of steps) {
    if (stopRequested()) {
      return declined('stopped before it finished');
    }

    log(`#${pr.number}: ${step}`);

    const ran = await git(step, worktreeDir);

    if (Result.isErr(ran)) {
      return declined(`\`${step}\` failed: ${lastLines(ran.value, 5)}`);
    }
  }

  const status = await git('git status --porcelain', worktreeDir);

  if (Result.isErr(status)) {
    return declined(`cannot read what changed: ${status.value}`);
  }

  if (status.value.trim() === '') {
    return declined(
      `${plan.commands.join(', ')} changed nothing here, so the failure is not the diff`,
    );
  }

  const committed = await git(
    'git add --all && git commit --quiet --amend --no-edit',
    worktreeDir,
  );

  if (Result.isErr(committed)) {
    return declined(`cannot amend: ${lastLines(committed.value, 5)}`);
  }

  const newHead = await git('git rev-parse HEAD', worktreeDir);

  if (Result.isErr(newHead)) {
    return declined(`cannot read the amended head: ${newHead.value}`);
  }

  if (stopRequested()) {
    return declined('stopped before pushing');
  }

  const sha = newHead.value.trim();

  // The push is a release like any other: another queued pull request may
  // have been released while the fixers ran.
  await pauseAllBut(pr.number);

  const branch = pr.headRefName;

  const pushed = await git(
    `git push --force-with-lease=${sh(`${branch}:${head}`)} origin ${sh(`${sha}:refs/heads/${branch}`)}`,
    worktreeDir,
  );

  if (Result.isErr(pushed)) {
    const remoteHeadNow = await remoteSha(branch);

    return Result.isOk(remoteHeadNow) && remoteHeadNow.value !== head
      ? { kind: 'moved' }
      : declined(`push refused: ${lastLines(pushed.value, 5)}`);
  }

  return { kind: 'pushed', head: sha, commands: plan.commands };
};
