// cspell:ignore tmpfs

/**
 * Fixing a failure that is only a fixer's diff: running the fixer, amending
 * what it wrote onto the pull request's one commit, and pushing it.
 *
 * Every check job runs through `z:ci-job`, whose clean-tree check fails a job
 * that changed files, so a `fix:` or `gen:` entry of the check matrices fails
 * by _changing_ files rather than by reporting anything, and the fix is to run
 * the same command and commit what it wrote. A job whose build or command
 * itself failed says so in an annotation ({@link contextsNotFixable}). That
 * much is mechanical; everything else a failing check asks for is the skill's,
 * or a person's, and is left to them. Which jobs are shaped like that, and what
 * reproduces each, is the repository's to say (`config.mts`).
 */

import * as os from 'node:os';
import * as path from 'node:path';
import {
  ownersOf,
  parseCodeOwners,
  statesFromCheckRuns,
  winningRuns,
  type CheckRunReport,
  type ContextState,
} from 'pr-report-core';
import { Arr, Num, Result } from 'ts-data-forge';
import { git, log, sh, type ApiContext } from '../lib/index.mjs';
import { CONFIG_PATH, type AutoFixConfig } from './config.mjs';
import {
  CODE_OWNERS_PATH,
  listCheckRuns,
  readAnnotationTitles,
  remoteSha,
  removeWorktree,
} from './github.mjs';
import type { AutoFixed, PullRequest } from './types.mjs';
import { lastLines, stopRequested } from './util.mjs';

/**
 * Tries once to fix the checks that failed on `head` by running the fixers
 * their matrix entries name, and pushes the result when there is one.
 *
 * Only when **every** failed job is such an entry: one real failure beside them
 * means the push would put the pull request through a matrix that fails anyway,
 * so the whole of it is left to whoever fixes the real one.
 *
 * The fixers run in a throwaway worktree, installed and built as CI installs
 * and builds, so the checkout this runs from is never touched. Where it goes is
 * {@link WORKTREE_ROOT}'s to say.
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
  /**
   * The commit whose check runs say what failed: `head`, or the tip of its
   * layer when it is fixed ahead of its turn (`repair-ahead.mts`).
   */
  checksAt: string = head,
): Promise<AutoFixed> => {
  const runs = await listCheckRuns(api, checksAt);

  if (Result.isErr(runs)) {
    return declined(`cannot read the check runs: ${runs.value}`);
  }

  const plan = await planAutoFixFromRuns(runs.value, config, async (id) =>
    readAnnotationTitles(api, id),
  );

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
 * {@link planAutoFix} on the check runs of one commit, then
 * {@link contextsNotFixable} on the jobs it accepted: what to run, or why
 * nothing is to be run. `autoFix` reads a pull request's head with it, and
 * speculation a layer's tip (`speculate.mts`) before releasing a pull request
 * for its own run to fix, so that both reach one verdict on the same jobs.
 */
export const planAutoFixFromRuns = async (
  runs: readonly CheckRunReport[],
  config: AutoFixConfig | undefined,
  readTitles: (id: number) => Promise<Result<readonly string[], string>>,
): Promise<Result<AutoFixPlan, string>> => {
  const states = statesFromCheckRuns(runs);

  const plan = planAutoFix(states, config);

  if (config === undefined || Result.isErr(plan)) {
    return plan;
  }

  const refused = await contextsNotFixable(
    runs,
    failedContexts(states, config),
    config.notFixableAnnotation,
    readTitles,
  );

  return Arr.isNonEmpty(refused) ? Result.err(notFixableReason(refused)) : plan;
};

/**
 * What to run for the jobs that failed, or why nothing is to be run.
 *
 * `states` is every context on the head commit. A failed context the
 * configuration ignores (an aggregate, only the echo of a job that failed under
 * it) is not read; every other failure has to match one of its fixers, whose
 * command is the whole of what reproduces the job — a job that runs a command
 * and whose clean-tree check fails the job. `config` is the repository's
 * (`config.mts`); without one nothing is fixed.
 */
export const planAutoFix = (
  states: ReadonlyMap<string, ContextState>,
  config: AutoFixConfig | undefined,
): Result<AutoFixPlan, string> => {
  if (config === undefined) {
    return Result.err(`the repository has no autoFix in ${CONFIG_PATH}`);
  }

  const failed = failedContexts(states, config);

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

/**
 * `run` with `$1` to `$9` replaced by `groups`, each shell-quoted: a fixer's
 * command from the failed context's name, a regenerator's from the conflicted
 * path, both whatever a job or a pull request chose.
 */
export const withCaptures = (
  run: string,
  groups: readonly (string | undefined)[],
): string =>
  run.replaceAll(/\$([1-9])/gu, (_, index) =>
    sh(
      groups[Result.unwrapOkOr(Num.safeParseInt(index ?? ''), Number.NaN)] ??
        '',
    ),
  );

/**
 * Which of `files` a `CODEOWNERS` text gives owners. A fixer runs the
 * dependency tree, and what it writes is amended onto the pull request and
 * pushed in the queue's name: where a required check counts the author as
 * approving what they own, such a change would merge on the author's standing
 * without anyone having read it. So a fix that touches an owned path is left to
 * a person whatever enforces the file.
 */
export const ownedPaths = (
  files: readonly string[],
  codeOwnersText: string,
): readonly string[] => {
  const rules = parseCodeOwners(codeOwnersText);

  return files.filter((file) => Arr.isNonEmpty(ownersOf(file, rules)));
};

/**
 * `CODEOWNERS` at `ref`, resolved to a commit first so that nothing a later
 * step does to the ref changes what is read: `''` when there is no such file,
 * an error when it cannot be read, which a caller declines on rather than
 * reading as empty.
 */
export const readCodeOwnersAt = async (
  ref: string,
  worktreeDir: string,
): Promise<Result<string, string>> => {
  const base = await git(`git rev-parse --verify ${sh(ref)}`, worktreeDir);

  if (Result.isErr(base)) {
    return Result.err(`cannot resolve ${ref}: ${base.value}`);
  }

  const at = base.value.trim();

  const listed = await git(
    `git ls-tree --name-only ${sh(at)} -- ${sh(CODE_OWNERS_PATH)}`,
    worktreeDir,
  );

  if (Result.isErr(listed)) {
    return Result.err(`cannot list ${CODE_OWNERS_PATH}: ${listed.value}`);
  }

  if (listed.value.trim() === '') {
    return Result.ok('');
  }

  const read = await git(
    `git show ${sh(`${at}:${CODE_OWNERS_PATH}`)}`,
    worktreeDir,
  );

  return Result.isErr(read)
    ? Result.err(
        `cannot read ${CODE_OWNERS_PATH} at ${ref}: ${lastLines(read.value, 2)}`,
      )
    : read;
};

/** The failed contexts the configuration does not ignore. */
export const failedContexts = (
  states: ReadonlyMap<string, ContextState>,
  config: AutoFixConfig,
): readonly string[] =>
  Array.from(states)
    .filter(
      ([name, state]) =>
        state === 'failed' &&
        config.ignore.every((pattern) => !pattern.test(name)),
    )
    .map(([name]) => name);

/** The fixer that takes the failed context `name`: the first it matches. */
export const firstFixerOf = (
  name: string,
  config: AutoFixConfig,
): AutoFixConfig['fixers'][number] | undefined =>
  config.fixers.find((fixer) => fixer.context.test(name));

/**
 * Of the failed contexts `names`, those whose check run carries the annotation
 * `title`, read on the run GitHub answers for each name. Nothing a fixer writes
 * can fix a command that exited non-zero, so `autoFix` declines those before
 * anything is installed. One whose annotations cannot be read is left out, and
 * the fixer finds out for itself.
 */
export const contextsNotFixable = async (
  runs: readonly CheckRunReport[],
  names: readonly string[],
  title: string | undefined,
  readTitles: (id: number) => Promise<Result<readonly string[], string>>,
): Promise<readonly string[]> => {
  if (title === undefined) {
    return [];
  }

  const winners = winningRuns(runs);

  const mut_found: string[] = [];

  for (const name of names) {
    const run = winners.get(name);

    if (run === undefined) {
      continue;
    }

    const titles = await readTitles(run.id);

    if (Result.isErr(titles)) {
      log(`Cannot read the annotations on ${name}: ${titles.value}`);
    } else if (titles.value.includes(title)) {
      mut_found.push(name);
    }
  }

  return mut_found;
};

/** What a decline by {@link contextsNotFixable} says, naming the jobs. */
export const notFixableReason = (names: readonly string[]): string =>
  `${names.join(', ')}: more than a diff failed (a build or a command exited non-zero, or the setup changed the tree), and nothing a fixer writes fixes that` as const;

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
 * Not the OS temp directory: an install is a `node_modules` tree, which the
 * pnpm store hard-links only within one filesystem, and the temp directory is
 * often a tmpfs. Not the git directory or `~/.cache` either:
 * `fix:fmt:diff` skips every file with a `.git`, `.cache`, `dist`, `build` or
 * `out` segment anywhere in its absolute path, so a worktree under one is
 * formatted by nothing. `run-unblock-prs-skill` puts its sessions' worktrees
 * here too, for the same reasons, and the rebase puts its own here, where the
 * generators that resolve a conflict in generated files can be installed.
 */
export const WORKTREE_ROOT = path.join(
  os.homedir(),
  '.local',
  'state',
  'unblock-prs',
);

/**
 * The first fixer `name` matches, with its command: `$1` to `$9` replaced by
 * the capture groups, shell-quoted, since a context's name is whatever the job
 * that reported it chose.
 */
const fixerFor = (
  name: string,
  config: AutoFixConfig,
): Readonly<{ command: string; stage: number }> | undefined => {
  const fixer = firstFixerOf(name, config);

  const groups = fixer?.context.exec(name) ?? undefined;

  return fixer === undefined || groups === undefined
    ? undefined
    : { command: withCaptures(fixer.run, groups), stage: fixer.stage };
};

const declined = (detail: string): AutoFixed =>
  ({ kind: 'declined', detail }) as const;

/**
 * The part that happens inside the worktree, so that removing it afterwards is
 * one statement in the caller. Every command here resolves to a `Result`, so
 * the caller's next line always runs.
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

  // `CODEOWNERS` as the default branch has it — the one a merge is judged by —
  // read before any step runs, at a commit rather than a ref a step could move.
  // A file that is not there owns nothing; one that cannot be read declines,
  // since reading it as empty would let through what it is here to stop.
  const codeOwners = await readCodeOwnersAt(
    `origin/${defaultBranch}`,
    worktreeDir,
  );

  if (Result.isErr(codeOwners)) {
    return declined(codeOwners.value);
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

  // What the amend changed, from the commits themselves rather than the index,
  // judged by the `CODEOWNERS` read before any step ran.
  const changed = await git(
    `git diff --name-only --no-renames -z ${sh(head)} ${sh(sha)}`,
    worktreeDir,
  );

  if (Result.isErr(changed)) {
    return declined(`cannot list what the fix changed: ${changed.value}`);
  }

  const owned = ownedPaths(
    changed.value.split('\0').filter((file) => file !== ''),
    codeOwners.value,
  );

  if (Arr.isNonEmpty(owned)) {
    return declined(
      `the fix changes ${owned.join(', ')}, which ${CODE_OWNERS_PATH} gives owners, and a fix pushed in someone's name is not their review of it`,
    );
  }

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
