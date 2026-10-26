// cspell:ignore tmpfs

/**
 * Fixing a failure that is only a fixer's diff: running the fixer, amending
 * what it wrote onto the pull request's one commit, and pushing it.
 *
 * Every check job ends with `z:assert-repo-is-clean`, so a `fix:` or `gen:`
 * entry of the check matrices fails by _changing_ files rather than by
 * reporting anything, and the fix is to run the same command and commit what
 * it wrote. That much is mechanical; everything else a failing check asks for
 * is the skill's, or a person's, and is left to them. Which jobs are shaped
 * like that, and what reproduces each, is the repository's to say
 * (`config.mts`).
 */

import * as os from 'node:os';
import * as path from 'node:path';
import { statesFromCheckRuns, type ContextState } from 'pr-report-core';
import { Arr, Num, Result } from 'ts-data-forge';
import type { ApiContext } from '../../lib/github-api.mjs';
import { log } from '../../lib/log.mjs';
import { git, sh } from '../../lib/shell.mjs';
import { CONFIG_PATH, type AutoFixConfig } from './config.mjs';
import { listCheckRuns, remoteSha, removeWorktree } from './github.mjs';
import type { AutoFixed, PullRequest } from './types.mjs';
import { lastLines, stopRequested } from './util.mjs';

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
  api: ApiContext,
  pr: PullRequest,
  head: string,
  defaultBranch: string,
  config: AutoFixConfig | undefined,
): Promise<AutoFixed> => {
  const runs = await listCheckRuns(api, head);

  if (Result.isErr(runs)) {
    return declined(`cannot read the check runs: ${runs.value}`);
  }

  const plan = planAutoFix(statesFromCheckRuns(runs.value), config);

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
 * `states` is every context on the head commit. A failed context the
 * configuration ignores (an aggregate, only the echo of a job that failed
 * under it) is not read; every other failure has to match one of its fixers,
 * whose command is the whole of what reproduces the job — a job that runs a
 * command and then asserts a clean tree. `config` is the repository's
 * (`config.mts`); without one nothing is fixed.
 */
export const planAutoFix = (
  states: ReadonlyMap<string, ContextState>,
  config: AutoFixConfig | undefined,
): Result<AutoFixPlan, string> => {
  if (config === undefined) {
    return Result.err(`the repository has no autoFix in ${CONFIG_PATH}`);
  }

  const failed = Array.from(states)
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

  const fixers = entries
    .map(({ fixer }) => fixer)
    .filter((fixer) => fixer !== undefined);

  return Result.ok({
    before: config.before,
    prepare: Arr.uniq(
      config.prepare
        .filter(({ context }) => failed.some((name) => context.test(name)))
        .map(({ run }) => run),
    ),
    commands: Arr.uniq(
      fixers
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

export type AutoFixPlan = Readonly<{
  /** What runs first, always. */
  before: readonly string[];
  /** What the failed jobs were given before they ran, each once. */
  prepare: readonly string[];
  /** The fixers, by stage. */
  commands: readonly string[];
  /** What settles their output. */
  after: readonly string[];
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

/**
 * The first fixer `name` matches, with its command: `$1` to `$9` replaced by
 * the capture groups, shell-quoted, since a context's name is whatever the
 * job that reported it chose.
 */
const fixerFor = (
  name: string,
  config: AutoFixConfig,
): Readonly<{ command: string; stage: number }> | undefined => {
  const matched = config.fixers
    .map((candidate) => ({ candidate, groups: candidate.context.exec(name) }))
    .find((entry) => entry.groups !== null);

  const fixer = matched?.candidate;

  const groups = matched?.groups ?? undefined;

  if (fixer === undefined || groups === undefined) {
    return undefined;
  }

  return {
    command: fixer.run.replaceAll(/\$([1-9])/gu, (_, index: string) =>
      sh(
        groups[Result.unwrapOkOr(Num.safeParseFloat(index), Number.NaN)] ?? '',
      ),
    ),
    stage: fixer.stage,
  };
};

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
    ...plan.before,
    ...plan.prepare,
    ...plan.commands,
    ...plan.after,
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
