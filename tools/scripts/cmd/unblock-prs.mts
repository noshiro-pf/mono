import * as os from 'node:os';
import * as path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import * as util from 'node:util';
import { Arr, isRecord, Json, Num, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { $, isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Keeps the pull requests that already have auto-merge enabled moving, one at
 * a time, by rebasing the one that is out-of-date with the default branch and
 * waiting for GitHub to merge it.
 *
 * This is the mechanical half of the `/unblock-prs` skill. The skill also
 * reads failing checks and fixes what they complain about; this script does
 * not, and it never merges anything — auto-merge does that once the checks
 * are green.
 *
 * One cycle:
 *
 * 1. List the open pull requests with auto-merge enabled (`autoMergeRequest`
 *    is not null) whose base is the default branch. Drafts, `[WIP]`-labelled
 *    pull requests and anything a previous cycle gave up on are set aside.
 * 2. If one of them is already up to date and its checks are running, or it
 *    is clean and about to merge, watch that one instead of rebasing another:
 *    the merge will move `main` and put every other branch back to `BEHIND`,
 *    so a second rebase now would only run a CI matrix to throw it away.
 * 3. Otherwise take the lowest-numbered pull request that is `BEHIND`, rebase
 *    it onto `origin/<default branch>` in a throwaway worktree, and push with
 *    `--force-with-lease` against the head the survey saw. A rebase that
 *    conflicts, or a push that is refused, drops that pull request for as
 *    long as its head and the base stay where they are, and the next
 *    candidate is tried in the same cycle.
 * 4. Poll the rebased pull request until it merges, or until something says
 *    it will not: a required check failed, auto-merge was switched off, the
 *    branch was pushed by someone else, or every required context reported
 *    green and it still did not merge. "Green" means the whole list the
 *    ruleset requires, not the part of it that has reported — a required
 *    context with no check run on the head commit is absent from
 *    `gh pr checks` rather than pending in it, so reading its absence as
 *    success is what used to write a pull request off three minutes into a
 *    twenty-five minute matrix.
 * 5. Remember the verdict against the head *and* the base it was reached on,
 *    so the pull request is left alone until someone pushes to it or the
 *    base moves. The base moving is exactly what a pull request that sat
 *    green without merging was waiting for: it is `BEHIND` now, and a rebase
 *    is this script's job.
 * 6. Survey again, saying what became of the pull requests this run has
 *    touched. One that merges after the watch gave up simply stops appearing
 *    in the list, and this is the only place that gets recorded. When there
 *    is nothing to do the script sleeps for `--idle-interval` seconds before
 *    looking again, and keeps going until it is interrupted or `--once` was
 *    given.
 *
 * The rebase happens in a `git worktree` under the OS temp directory, so the
 * checkout this runs from is never touched — its working tree may be dirty,
 * and the pull request's branch may even be checked out somewhere else.
 */
export const unblockPrs = async (
  options: Options,
): Promise<Result<undefined, string>> => {
  const preflight = await checkPreflight();

  if (Result.isErr(preflight)) return preflight;

  const { defaultBranch } = preflight.value;

  log(
    `Watching pull requests into ${defaultBranch}${options.dryRun ? ' (dry run)' : ''}.`,
  );

  installStopHandlers();

  let mut_state: LoopState = {
    skipped: new Map(),
    tracked: new Set(),
    baseSha: undefined,
  };

  while (!stopRequested()) {
    const cycle = await runCycle(defaultBranch, mut_state, options);

    mut_state = cycle.state;

    if (cycle.next === 'stop' || options.once || options.dryRun) break;

    if (cycle.next === 'idle') {
      log(`Nothing to do. Checking again in ${options.idleIntervalSec}s.`);

      await pause(options.idleIntervalSec * 1000);
    }
  }

  return Result.ok(undefined);
};

export type Options = Readonly<{
  /** Run one cycle — survey, act on one pull request, report — and exit. */
  once: boolean;
  /** Survey and say what would be done, without rebasing or pushing. */
  dryRun: boolean;
  /** How long to wait between surveys when nothing is out of date. */
  idleIntervalSec: number;
  /** How often to poll the pull request being watched. */
  pollIntervalSec: number;
  /** How long to watch one pull request before giving up on it. */
  watchTimeoutMin: number;
}>;

export const defaultOptions: Options = {
  once: false,
  dryRun: false,
  idleIntervalSec: 300,
  pollIntervalSec: 60,
  watchTimeoutMin: 90,
};

/** The fields read from `gh pr list` / `gh pr view`. */
const PullRequestSchema = t.record({
  number: t.number(),
  title: t.string(),
  state: t.string(),
  headRefName: t.string(),
  headRefOid: t.string(),
  baseRefName: t.string(),
  isDraft: t.boolean(),
  mergeStateStatus: t.string(),
  autoMergeRequest: t.unknown(),
  labels: t.array(t.record({ name: t.string() })),
});

type PullRequest = t.TypeOf<typeof PullRequestSchema>;

const PullRequestListSchema = t.array(PullRequestSchema);

/** The fields read from `gh pr checks --json`. */
const CheckListSchema = t.array(
  t.record({
    name: t.string(),
    /** `pass` | `fail` | `pending` | `skipping` | `cancel` */
    bucket: t.string(),
    link: t.string(),
  }),
);

type Check = t.TypeOf<typeof CheckListSchema>[number];

type SkipReason =
  | 'checks-failed'
  | 'not-merging'
  | 'push-failed'
  | 'rebase-failed'
  | 'watch-timeout';

/**
 * Why a pull request is being left alone, and the state it was in at the
 * time. A record stops applying as soon as that state changes: a push to the
 * branch clears every reason, and every reason but `checks-failed` also
 * clears when the base moves. See `skipStillApplies`.
 */
type SkipRecord = Readonly<{
  number: number;
  headSha: string;
  baseSha: string;
  reason: SkipReason;
  detail: string;
}>;

type SkipRecords = ReadonlyMap<number, SkipRecord>;

type Survey = Readonly<{
  pullRequests: readonly PullRequest[];
  /** The tip of the default branch at the time of the survey. */
  baseSha: string;
  /** The contexts the ruleset requires, empty when they cannot be read. */
  requiredContexts: readonly string[];
}>;

type ChecksSummary = Readonly<{
  status: 'failed' | 'passed' | 'pending';
  failed: readonly string[];
  pending: readonly string[];
  /**
   * Required contexts with no check run on the head commit at all. GitHub
   * shows these as "Expected — waiting for status to be reported" and
   * `gh pr checks` does not list them, so they are found by subtracting what
   * has reported from what the ruleset requires.
   */
  missing: readonly string[];
  /** How many checks the verdict was reached over. */
  total: number;
}>;

type TriageContext = Readonly<{
  defaultBranch: string;
  baseSha: string;
  skipped: SkipRecords;
  requiredContexts: readonly string[];
}>;

/** What one survey says about one pull request. */
type Classification =
  | Readonly<{ kind: 'candidate' }>
  | Readonly<{ kind: 'failing'; summary: ChecksSummary }>
  | Readonly<{ kind: 'ignore' }>
  | Readonly<{ kind: 'in-flight' }>
  | Readonly<{ kind: 'note'; note: string }>;

type Failing = Readonly<{ pr: PullRequest; summary: ChecksSummary }>;

type Triage = Readonly<{
  /** How many of the surveyed pull requests this script has anything to say about. */
  inScope: number;
  /** `BEHIND`, in scope, not skipped — lowest number first. */
  candidates: readonly PullRequest[];
  /** Up to date with checks still running, or clean and about to merge. */
  inFlight: readonly PullRequest[];
  /** Up to date, but a required check has failed. */
  failing: readonly Failing[];
  /** Everything else, with the reason it was set aside. */
  notes: readonly string[];
}>;

type WatchOutcome =
  | 'auto-merge-disabled'
  | 'behind-again'
  | 'checks-failed'
  | 'closed'
  | 'error'
  | 'head-moved'
  | 'merged'
  | 'not-merging'
  | 'stopped'
  | 'timeout';

/**
 * What one run carries from cycle to cycle: the pull requests it has given up
 * on, the ones it has acted on and last saw open, and where the base was when
 * it last looked.
 */
type LoopState = Readonly<{
  skipped: SkipRecords;
  tracked: ReadonlySet<number>;
  baseSha: string | undefined;
}>;

type CycleResult = Readonly<{
  state: LoopState;
  next: 'idle' | 'stop' | 'survey';
}>;

type RebaseFailure = Readonly<{
  reason: 'push-failed' | 'rebase-failed';
  detail: string;
}>;

const PR_JSON_FIELDS =
  'number,title,state,headRefName,headRefOid,baseRefName,isDraft,mergeStateStatus,autoMergeRequest,labels';

const WIP_LABEL = '[WIP]';

/** How many times to re-list while GitHub still reports `UNKNOWN`. */
const UNKNOWN_STATE_RETRIES = 6;

const UNKNOWN_STATE_RETRY_MS = 10_000;

/**
 * How many consecutive polls a pull request may sit with every required
 * context green, and GitHub saying nothing holds the merge, before it is
 * written off as held by something a rebase cannot fix — a missing review, an
 * unresolved conversation, auto-merge armed by someone who may not merge.
 */
const GREEN_POLLS_BEFORE_GIVING_UP = 3;

/**
 * The same, for a pull request GitHub still calls `BLOCKED` while every
 * required context reads green. That usually means the ruleset wants
 * something the checks do not cover, but it is also what a check run that has
 * just been superseded looks like for a moment, so it is given longer.
 */
const BLOCKED_GREEN_POLLS_BEFORE_GIVING_UP = 8;

/** How many consecutive polling errors end a watch. */
const MAX_CONSECUTIVE_POLL_ERRORS = 5;

/**
 * Passed to every git and gh invocation. `GIT_TERMINAL_PROMPT=0` turns a
 * missing credential into a failure instead of a hang; `GIT_EDITOR=true`
 * keeps any editor git might want out of the way.
 */
const childEnv: NodeJS.ProcessEnv = {
  ...process.env,
  GIT_TERMINAL_PROMPT: '0',
  GIT_EDITOR: 'true',
};

/** Aborted by SIGINT / SIGTERM; every sleep listens to it. */
const stopController = new AbortController();

/**
 * Read through a call rather than directly, because the flag flips inside a
 * signal handler and TypeScript would otherwise narrow it to `false` for the
 * rest of any block that has already tested it.
 */
const stopRequested = (): boolean => stopController.signal.aborted;

// --- one cycle ---------------------------------------------------------------

const runCycle = async (
  defaultBranch: string,
  before: LoopState,
  options: Options,
): Promise<CycleResult> => {
  const surveyed = await survey(defaultBranch);

  if (Result.isErr(surveyed)) {
    log(`Survey failed: ${surveyed.value}`);

    return { state: before, next: 'idle' };
  }

  const { pullRequests, baseSha, requiredContexts } = surveyed.value;

  if (before.baseSha !== undefined && before.baseSha !== baseSha) {
    log(`${defaultBranch} moved to ${baseSha.slice(0, 10)}.`);
  }

  // A pull request this run acted on and can no longer see is one that ended
  // while nothing was watching it — including one the watch had given up on,
  // whose merge would otherwise go unrecorded.
  const tracked = await reportDeparted(before.tracked, pullRequests);

  const state = (
    nextSkipped: SkipRecords,
    nextTracked: ReadonlySet<number> = tracked,
  ): LoopState => ({
    skipped: nextSkipped,
    tracked: nextTracked,
    baseSha,
  });

  const skipped = pruneSkips(before.skipped, pullRequests, baseSha);

  const triaged = await triage(pullRequests, {
    defaultBranch,
    baseSha,
    skipped,
    requiredContexts,
  });

  reportTriage(triaged, pullRequests.length);

  // A pull request that is up to date and already failing gets remembered
  // now, so that it is not rebased the moment `main` moves and put through
  // the same failing matrix again.
  let mut_skipped: SkipRecords = triaged.failing.reduce(
    (acc, { pr, summary }) =>
      withSkip(acc, {
        number: pr.number,
        headSha: pr.headRefOid,
        baseSha,
        reason: 'checks-failed',
        detail: summary.failed.join(', '),
      }),
    skipped,
  );

  if (stopRequested()) {
    return { state: state(mut_skipped), next: 'stop' };
  }

  if (Arr.isNonEmpty(triaged.inFlight)) {
    const target = triaged.inFlight[0];

    log(
      `#${target.number} is up to date (${target.mergeStateStatus}); watching it rather than rebasing another.`,
    );

    if (options.dryRun) return { state: state(mut_skipped), next: 'stop' };

    const outcome = await watch(
      target,
      target.headRefOid,
      requiredContexts,
      options,
    );

    return {
      state: state(
        applyWatchOutcome(mut_skipped, target, baseSha, outcome),
        trackAfterWatch(tracked, target.number, outcome),
      ),
      next: outcome === 'stopped' ? 'stop' : 'survey',
    };
  }

  if (!Arr.isNonEmpty(triaged.candidates)) {
    return { state: state(mut_skipped), next: 'idle' };
  }

  if (options.dryRun) {
    log(`Would rebase #${triaged.candidates[0].number} onto ${defaultBranch}.`);

    return { state: state(mut_skipped), next: 'stop' };
  }

  for (const target of triaged.candidates) {
    if (stopRequested()) {
      return { state: state(mut_skipped), next: 'stop' };
    }

    log(
      `Rebasing #${target.number} (${target.headRefName}) onto ${defaultBranch}.`,
    );

    const rebased = await rebaseAndPush(target, defaultBranch);

    if (Result.isErr(rebased)) {
      log(`#${target.number}: ${rebased.value.detail}`);

      mut_skipped = withSkip(mut_skipped, {
        number: target.number,
        headSha: target.headRefOid,
        baseSha,
        reason: rebased.value.reason,
        detail: rebased.value.detail,
      });

      continue;
    }

    if (rebased.value === target.headRefOid) {
      // GitHub said BEHIND but the rebase changed nothing — the survey was
      // stale. The next one will say what is actually there.
      log(`#${target.number} was already on top of ${defaultBranch}.`);

      return { state: state(mut_skipped), next: 'survey' };
    }

    log(
      `#${target.number} pushed as ${rebased.value.slice(0, 10)}; waiting for it to merge.`,
    );

    const outcome = await watch(
      target,
      rebased.value,
      requiredContexts,
      options,
    );

    return {
      state: state(
        applyWatchOutcome(
          mut_skipped,
          { ...target, headRefOid: rebased.value },
          baseSha,
          outcome,
        ),
        trackAfterWatch(tracked, target.number, outcome),
      ),
      next: outcome === 'stopped' ? 'stop' : 'survey',
    };
  }

  // Every candidate failed to rebase or push.
  return { state: state(mut_skipped), next: 'idle' };
};

/**
 * A pull request the run has acted on is worth remembering while it might
 * still end without anything watching it; once it has ended there is nothing
 * left to report.
 */
const trackAfterWatch = (
  tracked: ReadonlySet<number>,
  prNumber: number,
  outcome: WatchOutcome,
): ReadonlySet<number> =>
  outcome === 'merged' || outcome === 'closed'
    ? new Set(Array.from(tracked).filter((number) => number !== prNumber))
    : new Set([...tracked, prNumber]);

/**
 * Says what became of the pull requests this run acted on that have left the
 * open list, and returns the ones that are still on it.
 *
 * Nothing else notices: a pull request the watch gave up on merges minutes
 * later, and the only trace is that it stops being listed. Without this the
 * run that pushed the merge commit never mentions it.
 */
const reportDeparted = async (
  tracked: ReadonlySet<number>,
  pullRequests: readonly PullRequest[],
): Promise<ReadonlySet<number>> => {
  const isOpen = (prNumber: number): boolean =>
    pullRequests.some((pr) => pr.number === prNumber);

  const departed = Array.from(tracked).filter((prNumber) => !isOpen(prNumber));

  const viewed = await Promise.all(
    departed.map(async (prNumber) => ({
      prNumber,
      result: await viewPullRequest(prNumber),
    })),
  );

  for (const { prNumber, result } of viewed) {
    if (Result.isErr(result)) {
      log(
        `#${prNumber} has left the open list; cannot read it: ${result.value}`,
      );
    } else if (result.value.state === 'MERGED') {
      log(`#${prNumber} merged — ${result.value.title}`);
    } else {
      log(
        `#${prNumber} is no longer open (${result.value.state}) — ${result.value.title}`,
      );
    }
  }

  return new Set(Array.from(tracked).filter(isOpen));
};

const applyWatchOutcome = (
  skipped: SkipRecords,
  pr: PullRequest,
  baseSha: string,
  outcome: WatchOutcome,
): SkipRecords => {
  switch (outcome) {
    case 'merged':
      log(`#${pr.number} merged.`);

      return skipped;

    case 'closed':
      log(`#${pr.number} was closed without merging.`);

      return skipped;

    case 'auto-merge-disabled':
      log(`#${pr.number}: auto-merge was switched off; leaving it alone.`);

      return skipped;

    case 'head-moved':
      log(`#${pr.number}: someone else pushed to the branch; surveying again.`);

      return skipped;

    case 'behind-again':
      log(`#${pr.number}: the base moved while waiting; surveying again.`);

      return skipped;

    case 'checks-failed':
      return withSkip(skipped, {
        number: pr.number,
        headSha: pr.headRefOid,
        baseSha,
        reason: 'checks-failed',
        detail: 'a required check failed',
      });

    case 'not-merging':
      log(
        `#${pr.number}: every required check reported green and it is still open; something other than the checks holds it — a review, an unresolved conversation, or auto-merge armed by someone who may not merge.`,
      );

      return withSkip(skipped, {
        number: pr.number,
        headSha: pr.headRefOid,
        baseSha,
        reason: 'not-merging',
        detail: 'green but not merged',
      });

    case 'timeout':
      log(`#${pr.number}: gave up waiting.`);

      return withSkip(skipped, {
        number: pr.number,
        headSha: pr.headRefOid,
        baseSha,
        reason: 'watch-timeout',
        detail: 'checks did not finish in time',
      });

    case 'error':
      log(`#${pr.number}: polling kept failing; surveying again later.`);

      return skipped;

    case 'stopped':
      return skipped;
  }
};

// --- watch -------------------------------------------------------------------

/**
 * Polls one pull request until it merges or until something says it will not.
 * `expectedHead` is the commit the checks are expected on; a different head
 * means someone else pushed, and the survey has to start over.
 */
const watch = async (
  pr: PullRequest,
  expectedHead: string,
  requiredContexts: readonly string[],
  options: Options,
): Promise<WatchOutcome> => {
  const deadline = Date.now() + options.watchTimeoutMin * 60_000;

  let mut_greenPolls = 0;

  let mut_errors = 0;

  while (!stopRequested()) {
    await pause(options.pollIntervalSec * 1000);

    if (stopRequested()) break;

    const viewed = await viewPullRequest(pr.number);

    if (Result.isErr(viewed)) {
      mut_errors += 1;

      log(`#${pr.number}: poll failed (${mut_errors}): ${viewed.value}`);

      if (mut_errors >= MAX_CONSECUTIVE_POLL_ERRORS) return 'error';

      continue;
    }

    const current = viewed.value;

    if (current.state === 'MERGED') return 'merged';

    if (current.state !== 'OPEN') return 'closed';

    if (!isRecord(current.autoMergeRequest)) return 'auto-merge-disabled';

    if (current.headRefOid !== expectedHead) return 'head-moved';

    if (
      current.mergeStateStatus === 'BEHIND' ||
      current.mergeStateStatus === 'DIRTY'
    ) {
      return 'behind-again';
    }

    const checks = await listRequiredChecks(pr.number);

    if (Result.isErr(checks)) {
      mut_errors += 1;

      log(`#${pr.number}: poll failed (${mut_errors}): ${checks.value}`);

      if (mut_errors >= MAX_CONSECUTIVE_POLL_ERRORS) return 'error';

      continue;
    }

    mut_errors = 0;

    const summary = summarizeChecks(checks.value, requiredContexts);

    if (summary.status === 'failed') {
      log(`#${pr.number}: failed: ${summary.failed.join(', ')}`);

      return 'checks-failed';
    }

    if (summary.status === 'pending') {
      mut_greenPolls = 0;

      log(
        `#${pr.number}: ${current.mergeStateStatus}, waiting on ${describeWaitingOn(summary)}`,
      );
    } else {
      mut_greenPolls += 1;

      // GitHub calling it BLOCKED while every required context reads green is
      // the one combination that is usually transient, so it is given longer
      // than a pull request GitHub already considers mergeable.
      const budget = isMergeableState(current.mergeStateStatus)
        ? GREEN_POLLS_BEFORE_GIVING_UP
        : BLOCKED_GREEN_POLLS_BEFORE_GIVING_UP;

      log(
        `#${pr.number}: ${current.mergeStateStatus}, all ${summary.total} required checks green (${mut_greenPolls}/${budget}), waiting for auto-merge`,
      );

      if (mut_greenPolls >= budget) return 'not-merging';
    }

    if (Date.now() > deadline) {
      log(
        `#${pr.number}: still waiting on ${describeWaitingOn(summary)} after ${options.watchTimeoutMin} minutes.`,
      );

      return 'timeout';
    }
  }

  return 'stopped';
};

// --- rebase ------------------------------------------------------------------

/**
 * Rebases the pull request's branch onto `origin/<defaultBranch>` in a
 * throwaway worktree and force-pushes the result, expecting the remote branch
 * to still be at the head the survey saw. Resolves to the new head.
 *
 * The worktree is detached and removed afterwards whatever happens, so the
 * checkout this runs from is never touched and a half-finished rebase is
 * never left behind.
 */
const rebaseAndPush = async (
  pr: PullRequest,
  defaultBranch: string,
): Promise<Result<string, RebaseFailure>> => {
  const branch = pr.headRefName;

  const worktreeDir = path.join(os.tmpdir(), 'unblock-prs', `pr-${pr.number}`);

  const rebaseFailed = (detail: string): Result<string, RebaseFailure> =>
    Result.err({ reason: 'rebase-failed', detail });

  // A previous run may have been interrupted with this worktree in place.
  await removeWorktree(worktreeDir);

  const fetched = await git(
    `git fetch --quiet origin ${sh(defaultBranch)} ${sh(branch)}`,
  );

  if (Result.isErr(fetched)) {
    return rebaseFailed(`fetch failed: ${fetched.value}`);
  }

  const remoteHead = await git(`git rev-parse ${sh(`origin/${branch}`)}`);

  if (Result.isErr(remoteHead)) {
    return rebaseFailed(`cannot resolve origin/${branch}: ${remoteHead.value}`);
  }

  if (remoteHead.value.trim() !== pr.headRefOid) {
    return rebaseFailed(
      `origin/${branch} moved since the survey (${remoteHead.value.trim().slice(0, 10)} != ${pr.headRefOid.slice(0, 10)}).`,
    );
  }

  const added = await git(
    `git worktree add --detach ${sh(worktreeDir)} ${sh(pr.headRefOid)}`,
  );

  if (Result.isErr(added)) {
    return rebaseFailed(`checkout failed: ${added.value}`);
  }

  try {
    const rebased = await git(
      `git rebase ${sh(`origin/${defaultBranch}`)}`,
      worktreeDir,
    );

    if (Result.isErr(rebased)) {
      await git('git rebase --abort', worktreeDir);

      return rebaseFailed(`rebase conflicts: ${lastLines(rebased.value, 5)}`);
    }

    const newHead = await git('git rev-parse HEAD', worktreeDir);

    if (Result.isErr(newHead)) {
      return rebaseFailed(`cannot read the rebased head: ${newHead.value}`);
    }

    const sha = newHead.value.trim();

    if (sha === pr.headRefOid) return Result.ok(sha);

    // The lease names the SHA the survey saw, not the remote-tracking ref: a
    // bare `--force-with-lease` compares against whatever the last fetch
    // left, which is exactly the race this is meant to lose safely.
    const pushed = await git(
      `git push --force-with-lease=${sh(`${branch}:${pr.headRefOid}`)} origin ${sh(`${sha}:refs/heads/${branch}`)}`,
      worktreeDir,
    );

    if (Result.isErr(pushed)) {
      return Result.err({
        reason: 'push-failed',
        detail: `push refused: ${lastLines(pushed.value, 5)}`,
      });
    }

    return Result.ok(sha);
  } finally {
    await removeWorktree(worktreeDir);
  }
};

const removeWorktree = async (worktreeDir: string): Promise<void> => {
  // Both fail harmlessly when there is nothing to remove.
  await git(`git worktree remove --force ${sh(worktreeDir)}`);

  await git('git worktree prune');
};

// --- survey and triage -------------------------------------------------------

/**
 * Lists the open pull requests, re-listing a few times while GitHub is still
 * computing a merge state (`UNKNOWN`) for one that matters.
 */
const survey = async (
  defaultBranch: string,
): Promise<Result<Survey, string>> => {
  let mut_attempt = 0;

  let mut_listed = await listPullRequests();

  while (
    Result.isOk(mut_listed) &&
    mut_attempt < UNKNOWN_STATE_RETRIES &&
    mut_listed.value.some(
      (pr) =>
        pr.mergeStateStatus === 'UNKNOWN' && isRecord(pr.autoMergeRequest),
    ) &&
    !stopRequested()
  ) {
    mut_attempt += 1;

    log(
      `GitHub is still computing a merge state; re-listing (${mut_attempt}/${UNKNOWN_STATE_RETRIES}).`,
    );

    await pause(UNKNOWN_STATE_RETRY_MS);

    mut_listed = await listPullRequests();
  }

  if (Result.isErr(mut_listed)) return mut_listed;

  const baseSha = await remoteSha(defaultBranch);

  if (Result.isErr(baseSha)) return baseSha;

  return Result.ok({
    pullRequests: mut_listed.value,
    baseSha: baseSha.value,
    requiredContexts: await listRequiredContexts(defaultBranch),
  });
};

/**
 * The contexts the ruleset requires on the default branch, as GitHub reports
 * them, deduplicated across rulesets.
 *
 * This is what lets "green" mean the whole list rather than the part of it
 * that has reported. A required context with no check run on the head commit
 * is not pending in `gh pr checks` — it is absent from it — so a pull request
 * three minutes into a twenty-five minute matrix looks finished without this.
 *
 * A repository whose rules cannot be read gives an empty list, and the watch
 * falls back to judging by what has reported, on a longer leash.
 */
const listRequiredContexts = async (
  branch: string,
): Promise<readonly string[]> => {
  const listed = await git(
    [
      'gh api',
      // Joined rather than interpolated: `gh` fills the `{owner}` and
      // `{repo}` placeholders in, and a template literal holding them is
      // indistinguishable from a mistyped one to `unicorn`.
      sh(['repos', '{owner}', '{repo}', 'rules', 'branches', branch].join('/')),
      '--jq',
      sh(
        '.[] | select(.type == "required_status_checks") | .parameters.required_status_checks[].context',
      ),
    ].join(' '),
  );

  if (Result.isErr(listed)) {
    log(
      `Cannot read the required checks for ${branch}; judging by what has reported. (${lastLines(listed.value, 2)})`,
    );

    return [];
  }

  return Array.from(
    new Set(
      listed.value
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== ''),
    ),
  );
};

const triage = async (
  pullRequests: readonly PullRequest[],
  context: TriageContext,
): Promise<Triage> => {
  const sorted = pullRequests.toSorted((a, b) => a.number - b.number);

  const classified = await Promise.all(
    sorted.map(async (pr) => ({ pr, result: await classify(pr, context) })),
  );

  return {
    inScope: classified.filter(({ result }) => result.kind !== 'ignore').length,
    candidates: classified
      .filter(({ result }) => result.kind === 'candidate')
      .map(({ pr }) => pr),
    inFlight: classified
      .filter(({ result }) => result.kind === 'in-flight')
      .map(({ pr }) => pr),
    failing: classified.flatMap(({ pr, result }) =>
      result.kind === 'failing' ? [{ pr, summary: result.summary }] : [],
    ),
    notes: classified.flatMap(({ result }) =>
      result.kind === 'note' ? [result.note] : [],
    ),
  };
};

const classify = async (
  pr: PullRequest,
  context: TriageContext,
): Promise<Classification> => {
  const outOfScope = outOfScopeReason(pr, context.defaultBranch);

  if (outOfScope !== undefined) {
    // Nothing to say about pull requests that never asked to be merged.
    return isRecord(pr.autoMergeRequest)
      ? { kind: 'note', note: `#${pr.number}: ${outOfScope}` }
      : { kind: 'ignore' };
  }

  const skip = context.skipped.get(pr.number);

  if (skip !== undefined && skipStillApplies(skip, pr, context.baseSha)) {
    return {
      kind: 'note',
      note: `#${pr.number}: skipped (${skip.reason}: ${skip.detail}) until ${
        skip.reason === 'checks-failed'
          ? 'the branch is pushed again'
          : `the branch is pushed again or ${context.defaultBranch} moves`
      }`,
    };
  }

  switch (pr.mergeStateStatus) {
    case 'BEHIND':
      return { kind: 'candidate' };

    case 'CLEAN':
    case 'HAS_HOOKS':
    case 'UNSTABLE':
      return { kind: 'in-flight' };

    case 'BLOCKED': {
      const checks = await listRequiredChecks(pr.number);

      if (Result.isErr(checks)) {
        return {
          kind: 'note',
          note: `#${pr.number}: could not read checks: ${checks.value}`,
        };
      }

      const summary = summarizeChecks(checks.value, context.requiredContexts);

      // Pending — including a required context that has not reported at all —
      // or green and about to merge. A green one that stays open is caught by
      // the watch.
      return summary.status === 'failed'
        ? { kind: 'failing', summary }
        : { kind: 'in-flight' };
    }

    case 'DIRTY':
      return {
        kind: 'note',
        note: `#${pr.number}: conflicts with ${context.defaultBranch}; needs a hand`,
      };

    default:
      return {
        kind: 'note',
        note: `#${pr.number}: merge state ${pr.mergeStateStatus}`,
      };
  }
};

const reportTriage = (triaged: Triage, total: number): void => {
  log(
    `${total} open pull request(s), ${triaged.inScope} with auto-merge: ${triaged.candidates.length} behind, ${triaged.inFlight.length} in flight, ${triaged.failing.length} failing.`,
  );

  for (const note of triaged.notes) {
    log(`  ${note}`);
  }

  for (const { pr, summary } of triaged.failing) {
    log(
      `  #${pr.number}: up to date but failing: ${summary.failed.join(', ')}`,
    );
  }

  for (const pr of triaged.candidates) {
    log(`  #${pr.number}: behind — ${pr.title}`);
  }
};

/** Why a pull request is none of this script's business, if it is not. */
const outOfScopeReason = (
  pr: PullRequest,
  defaultBranch: string,
): string | undefined => {
  if (pr.state !== 'OPEN') return `state is ${pr.state}`;

  if (!isRecord(pr.autoMergeRequest)) return 'auto-merge is not enabled';

  if (pr.isDraft) return 'draft';

  if (pr.baseRefName !== defaultBranch) return `base is ${pr.baseRefName}`;

  if (pr.labels.some((label) => label.name === WIP_LABEL)) {
    return `labelled ${WIP_LABEL}`;
  }

  if (!isSafeRefName(pr.headRefName)) {
    return `branch name ${JSON.stringify(pr.headRefName)} will not be passed to a shell`;
  }

  return undefined;
};

/**
 * `checks` is what `gh pr checks --required` reported for the head commit;
 * `requiredContexts` is what the ruleset asks for. The difference between the
 * two is the point: a context in the second and not the first has not
 * reported yet, and GitHub will not merge until it does.
 */
const summarizeChecks = (
  checks: readonly Check[],
  requiredContexts: readonly string[],
): ChecksSummary => {
  const failed = checks
    .filter((check) => check.bucket === 'fail' || check.bucket === 'cancel')
    .map((check) => check.name);

  const pending = checks
    .filter((check) => check.bucket === 'pending')
    .map((check) => check.name);

  const reported = new Set(checks.map((check) => check.name));

  const missing = requiredContexts.filter((context) => !reported.has(context));

  const status = Arr.isNonEmpty(failed)
    ? 'failed'
    : // No checks at all means they have not been reported yet — which is
      // also all that can be said when the ruleset could not be read.
      Arr.isNonEmpty(pending) ||
        Arr.isNonEmpty(missing) ||
        !Arr.isNonEmpty(checks)
      ? 'pending'
      : 'passed';

  return {
    status,
    failed,
    pending,
    missing,
    total: Math.max(checks.length, requiredContexts.length),
  };
};

/** Everything the merge is still waiting for, reported and unreported. */
const describeWaitingOn = (summary: ChecksSummary): string => {
  const waiting = [
    ...summary.pending,
    ...summary.missing.map((context) => `${context} (not reported yet)`),
  ];

  return Arr.isNonEmpty(waiting) ? waiting.join(', ') : 'checks to be reported';
};

/** Merge states in which GitHub itself says nothing holds the merge. */
const isMergeableState = (mergeStateStatus: string): boolean =>
  mergeStateStatus === 'CLEAN' ||
  mergeStateStatus === 'HAS_HOOKS' ||
  mergeStateStatus === 'UNSTABLE';

/**
 * A verdict lasts as long as the state it was reached in. Every reason is
 * tied to the head, so a push to the branch clears it; all but
 * `checks-failed` are tied to the base as well.
 *
 * The base is what makes the difference to a pull request that sat green
 * without merging or ran out of watch time: once the base moves that pull
 * request is `BEHIND`, which is the one thing this script knows how to fix,
 * and a verdict that outlived its state is what left a ready pull request
 * sitting still through cycle after cycle of "Nothing to do". A rebase or
 * push failure is tied to the base for the older reason: the commit it
 * conflicted with may have gone with it.
 *
 * `checks-failed` is deliberately not tied to the base. Rebasing it would put
 * the same failing matrix through again, and fixing the failure is the
 * skill's job, not this script's — the push that carries the fix is what
 * clears it.
 */
const skipStillApplies = (
  skip: SkipRecord,
  pr: PullRequest,
  baseSha: string,
): boolean =>
  skip.headSha === pr.headRefOid &&
  (skip.reason === 'checks-failed' || skip.baseSha === baseSha);

/** Drops records for pull requests that are gone or have moved on. */
const pruneSkips = (
  skipped: SkipRecords,
  pullRequests: readonly PullRequest[],
  baseSha: string,
): SkipRecords =>
  new Map(
    Array.from(skipped.values())
      .filter((skip) => {
        const pr = pullRequests.find((p) => p.number === skip.number);

        return pr !== undefined && skipStillApplies(skip, pr, baseSha);
      })
      .map((skip) => [skip.number, skip] as const),
  );

const withSkip = (skipped: SkipRecords, skip: SkipRecord): SkipRecords =>
  new Map([...skipped, [skip.number, skip]]);

// --- gh and git --------------------------------------------------------------

const checkPreflight = async (): Promise<
  Result<Readonly<{ defaultBranch: string }>, string>
> => {
  const auth = await git('gh auth status');

  if (Result.isErr(auth)) {
    return Result.err(`gh is not authenticated:\n${auth.value}`);
  }

  const defaultBranch = await git(
    'gh repo view --json defaultBranchRef --jq .defaultBranchRef.name',
  );

  if (Result.isErr(defaultBranch)) {
    return Result.err(`cannot read the default branch: ${defaultBranch.value}`);
  }

  const name = defaultBranch.value.trim();

  if (!isSafeRefName(name)) {
    return Result.err(
      `unexpected default branch name: ${JSON.stringify(name)}`,
    );
  }

  return Result.ok({ defaultBranch: name });
};

const listPullRequests = async (): Promise<
  Result<readonly PullRequest[], string>
> => {
  const listed = await git(
    `gh pr list --state open --limit 100 --json ${PR_JSON_FIELDS}`,
  );

  if (Result.isErr(listed)) return listed;

  return parseJson(listed.value, PullRequestListSchema);
};

const viewPullRequest = async (
  prNumber: number,
): Promise<Result<PullRequest, string>> => {
  const viewed = await git(`gh pr view ${prNumber} --json ${PR_JSON_FIELDS}`);

  if (Result.isErr(viewed)) return viewed;

  return parseJson(viewed.value, PullRequestSchema);
};

/**
 * The checks that gate the merge, as GitHub reports them for the head commit.
 * `--required` reads `isRequired` from the API, so the list follows the
 * ruleset without this script having to know it.
 */
const listRequiredChecks = async (
  prNumber: number,
): Promise<Result<readonly Check[], string>> => {
  const listed = await git(
    `gh pr checks ${prNumber} --required --json name,bucket,link`,
  );

  if (Result.isErr(listed)) {
    // Right after a push there is nothing to report yet, and gh treats that
    // as an error rather than an empty list.
    return listed.value.includes('no checks reported') ? Result.ok([]) : listed;
  }

  return parseJson(listed.value, CheckListSchema);
};

const remoteSha = async (branch: string): Promise<Result<string, string>> => {
  const listed = await git(`git ls-remote --heads origin ${sh(branch)}`);

  if (Result.isErr(listed)) return listed;

  const sha = listed.value.trim().split(/\s+/u, 1)[0];

  return sha === undefined || sha === ''
    ? Result.err(`origin has no branch named ${branch}`)
    : Result.ok(sha);
};

/**
 * Runs a git or gh command silently and resolves to its stdout, or to a
 * message that includes what it printed to stderr.
 */
const git = async (
  command: string,
  cwd: string = projectRootPath,
): Promise<Result<string, string>> => {
  const result = await $(command, {
    cwd,
    silent: true,
    env: childEnv,
    maxBuffer: 64 * 1024 * 1024,
  });

  return Result.isOk(result)
    ? Result.ok(result.value.stdout)
    : Result.err(result.value.message.trim());
};

// --- utilities ---------------------------------------------------------------

const parseJson = <A,>(text: string, schema: t.Type<A>): Result<A, string> => {
  const parsed = Json.parse(text);

  if (Result.isErr(parsed)) return Result.err(`invalid JSON: ${parsed.value}`);

  const validated = schema.validate(parsed.value);

  return Result.isErr(validated)
    ? Result.err(t.validationErrorsToMessages(validated.value).join('\n'))
    : Result.ok(validated.value);
};

/**
 * A ref name this script is willing to put on a command line. Everything is
 * single-quoted anyway; this is a second guard, and it also keeps a name
 * starting with `-` from being read as an option.
 */
const isSafeRefName = (name: string): boolean =>
  /^[\w./+-]+$/u.test(name) && !name.startsWith('-');

/** Single-quotes a string for a POSIX shell. */
const sh = (value: string): string =>
  `'${value.replaceAll("'", String.raw`'\''`)}'`;

const lastLines = (text: string, count: number): string =>
  text.trim().split('\n').slice(-count).join('\n');

/** Sleeps, returning early when a stop has been requested. */
const pause = async (ms: number): Promise<void> => {
  if (stopRequested()) return;

  await sleep(ms, undefined, { signal: stopController.signal }).catch(
    () => undefined,
  );
};

const log = (message: string): void => {
  console.info(
    `[${Temporal.Now.instant().round({ smallestUnit: 'millisecond' }).toString()}] ${message}`,
  );
};

const installStopHandlers = (): void => {
  const onSignal = (signal: NodeJS.Signals): void => {
    log(`${signal}: finishing the current step, then stopping.`);

    stopController.abort();

    // A second signal is not a request to be tidy.
    process.once(signal, () => {
      process.exit(130);
    });
  };

  process.once('SIGINT', onSignal);

  process.once('SIGTERM', onSignal);
};

// --- command line ------------------------------------------------------------

const HELP = [
  'Usage: pnpm run unblock-prs [-- options]',
  '',
  'Rebases the auto-merge pull request that is out of date with the default',
  'branch and waits for GitHub to merge it, one pull request at a time.',
  '',
  'Options:',
  '  --once                 run one cycle and exit',
  '  --dry-run              survey and report what would be done, then exit',
  `  --idle-interval <sec>  wait between surveys when nothing is behind (default ${defaultOptions.idleIntervalSec})`,
  `  --poll-interval <sec>  wait between polls of the watched pull request (default ${defaultOptions.pollIntervalSec})`,
  `  --watch-timeout <min>  give up on a pull request after this long (default ${defaultOptions.watchTimeoutMin})`,
  '  -h, --help             show this help',
].join('\n');

const parseOptions = (
  args: readonly string[],
): Result<Options | 'help', string> => {
  // `pnpm run unblock-prs -- --once` forwards the `--` as well, and
  // `parseArgs` would read everything after it as positionals.
  const [first, ...rest] = args;

  const argv: readonly string[] = first === '--' ? rest : args;

  const parsed = Result.fromThrowable(() =>
    util.parseArgs({
      args: Array.from(argv),
      options: {
        once: { type: 'boolean', default: false },
        'dry-run': { type: 'boolean', default: false },
        'idle-interval': { type: 'string' },
        'poll-interval': { type: 'string' },
        'watch-timeout': { type: 'string' },
        help: { type: 'boolean', short: 'h', default: false },
      },
    }),
  );

  if (Result.isErr(parsed)) return Result.err(parsed.value.message);

  const { values } = parsed.value;

  if (values.help) return Result.ok('help');

  const positive = (
    name: string,
    raw: string | undefined,
    fallback: number,
  ): Result<number, string> => {
    if (raw === undefined) return Result.ok(fallback);

    const n = Num.safeParseInt(raw);

    return Result.isOk(n) && n.value > 0
      ? Result.ok(n.value)
      : Result.err(
          `--${name} must be a positive integer, got ${JSON.stringify(raw)}`,
        );
  };

  const idleIntervalSec = positive(
    'idle-interval',
    values['idle-interval'],
    defaultOptions.idleIntervalSec,
  );

  if (Result.isErr(idleIntervalSec)) return idleIntervalSec;

  const pollIntervalSec = positive(
    'poll-interval',
    values['poll-interval'],
    defaultOptions.pollIntervalSec,
  );

  if (Result.isErr(pollIntervalSec)) return pollIntervalSec;

  const watchTimeoutMin = positive(
    'watch-timeout',
    values['watch-timeout'],
    defaultOptions.watchTimeoutMin,
  );

  if (Result.isErr(watchTimeoutMin)) return watchTimeoutMin;

  return Result.ok({
    once: values.once,
    dryRun: values['dry-run'],
    idleIntervalSec: idleIntervalSec.value,
    pollIntervalSec: pollIntervalSec.value,
    watchTimeoutMin: watchTimeoutMin.value,
  });
};

if (isDirectlyExecuted(import.meta.url)) {
  const options = parseOptions(Arr.skip(process.argv, 2));

  if (Result.isErr(options)) {
    console.error(`${options.value}\n\n${HELP}`);

    process.exit(2);
  }

  if (options.value === 'help') {
    console.info(HELP);
  } else {
    const result = await unblockPrs(options.value);

    if (Result.isErr(result)) {
      console.error(result.value);

      process.exit(1);
    }
  }
}
