/** What the checks on a head commit add up to. */

import { Arr } from 'ts-data-forge';
import { epochMsOf } from './timestamp.mjs';
import type { ChecksSummary, ContextState } from './types.mjs';

/**
 * What every context reported, from a head commit's check runs.
 *
 * A name appears more than once whenever two check suites reported it, and on a
 * queued pull request that is the normal case rather than the odd one: the run
 * the `opened` event starts is cancelled by the `labeled` event's, and both
 * stay on the commit — the cancelled one leaving its `*-result` aggregate
 * concluded `failure`, because an `if: always()` job that asserts on cancelled
 * `needs` fails.
 *
 * **The newest check suite wins, and that is not the same as the newest run.**
 * GitHub resolves a required context to the run in the suite with the greatest
 * id, so where the cancelled suite happens to have been created after the one
 * that superseded it, the stale red is what holds the merge — however much
 * later the green one finished. Every suite of one push is created in the same
 * second, so which of them got the higher id is not something the repository
 * decides.
 *
 * This is why the rule is not "the newest `started_at`", which reads more
 * natural and would call such a pull request green while GitHub blocks it.
 * A report that says a blocked pull request will merge is worse than one that
 * says a green one will not: `CLAUDE.md`'s "Commits and pull requests" says to
 * ignore the red the cancelled run leaves, and this is the case where
 * GitHub does not.
 *
 * **A run whose workflow has a newer round still going is pending.** An
 * aggregate has no run in a round until the jobs it waits on are done, so until
 * then the only run of its name is the previous round's — on a pull request
 * whose label events started two rounds, the red the second left on the first
 * (#2191). That run is what GitHub shows, but not what it will answer with: the
 * newer round is in the suite with the greater id, and its aggregate will be
 * the newest run of the name. Where the newer round has finished without one,
 * the older run stands, as it does on GitHub.
 *
 * **So is a run of an earlier attempt of its own round, while a re-run of that
 * round goes on** ({@link isOfEarlierAttempt}). "Re-run failed jobs" keeps the
 * workflow run, and with it the check suite, and starts a new attempt: the
 * aggregate of the attempt before stays the newest run of its name, red, until
 * the jobs it needs are done and it runs again (#3474). Read at `nowMs`.
 *
 * `rounds` is every workflow run on the commit by check suite, where the reader
 * read them: a newer round a concurrency group holds behind the one it replaces
 * has no check run until that one ends, so the runs alone do not show it, and
 * the cancelled jobs of the round before read as failures (#3703).
 */
export const statesFromCheckRuns = (
  runs: readonly CheckRunReport[],
  nowMs: number = Date.now(),
  rounds: ReadonlyMap<number, WorkflowRound> = NO_ROUNDS,
): ReadonlyMap<string, ContextState> => {
  const mut_latestRound = new Map<
    number,
    Readonly<{ checkSuiteId: number; completed: boolean }>
  >();

  const suites = [
    ...Array.from(rounds),
    ...Arr.generate(function* () {
      for (const run of runs) {
        if (run.round !== undefined) {
          yield [run.checkSuiteId, run.round] as const;
        }
      }
    }),
  ] as const;

  for (const [checkSuiteId, round] of suites) {
    const latest = mut_latestRound.get(round.workflowId);

    if (latest === undefined || checkSuiteId > latest.checkSuiteId) {
      mut_latestRound.set(round.workflowId, {
        checkSuiteId,
        completed: round.completed,
      });
    }
  }

  const mut_states = new Map<string, ContextState>();

  for (const [name, run] of winningRuns(runs)) {
    const latest =
      run.round === undefined
        ? undefined
        : mut_latestRound.get(run.round.workflowId);

    const state = classifyCheckRun(run.status, run.conclusion);

    mut_states.set(
      name,
      (latest !== undefined &&
        latest.checkSuiteId !== run.checkSuiteId &&
        !latest.completed) ||
        // Only a red: "Re-run failed jobs" leaves a green of the attempt before
        // standing, and it stands for its context.
        (state === 'failed' &&
          run.completedAt !== undefined &&
          isOfEarlierAttempt(run.completedAt, run.round, nowMs))
        ? 'pending'
        : state,
    );
  }

  return mut_states;
};

/**
 * Of the runs of each name, the one GitHub answers with ({@link outranks}): what
 * {@link statesFromCheckRuns} judges, for a reader that goes on to ask more of
 * that run.
 */
export const winningRuns = (
  runs: readonly CheckRunReport[],
): ReadonlyMap<string, CheckRunReport> => {
  const mut_winner = new Map<string, CheckRunReport>();

  for (const run of runs) {
    const previous = mut_winner.get(run.name);

    if (previous === undefined || outranks(run, previous)) {
      mut_winner.set(run.name, run);
    }
  }

  return mut_winner;
};

/** One check run, in the terms the decision above is made in. */
export type CheckRunReport = Readonly<{
  name: string;
  status: string;
  conclusion: string | undefined;
  /** The suite it belongs to. Greatest wins, which is what GitHub does. */
  checkSuiteId: number;
  /** Ascending, so it orders two runs of one name inside one suite. */
  id: number;
  /** ISO 8601, once it has finished, where it was read. */
  completedAt?: string | undefined;
  /**
   * The workflow run its suite is, where it is one: the workflow, so that a
   * newer round of it can be told from an unrelated suite, and whether the
   * round has finished, which its runs alone do not say — an aggregate's run is
   * created only once every job before it has completed. `undefined` for a run
   * no workflow made, or where the workflow runs could not be read.
   */
  round: WorkflowRound | undefined;
}>;

/**
 * A workflow run, as {@link CheckRunReport}'s `round`. `attemptStartedAt` is
 * REST's `run_started_at`, which a re-run sets anew; GraphQL has no such field,
 * so a reader of GraphQL alone leaves it out.
 */
export type WorkflowRound = Readonly<{
  workflowId: number;
  completed: boolean;
  attemptStartedAt?: string | undefined;
}>;

/**
 * Whether a run that finished at `completedAt` is of an attempt of `round`
 * before the one still going: the round has not finished, and its latest
 * attempt began after the run finished. Read at `nowMs`, and only for
 * {@link RE_RUN_GRACE_MS} after the attempt began, so that a workflow run GitHub
 * never settles does not hold a red back for good.
 *
 * Not "a job in the suite has an earlier run of its name", which is what the
 * worker read until #3474: that rests on GraphQL listing every attempt of a job,
 * which nothing confirmed, and also fires on two jobs sharing a display name.
 */
export const isOfEarlierAttempt = (
  completedAt: string,
  round: WorkflowRound | undefined,
  nowMs: number,
): boolean => {
  if (
    round === undefined ||
    round.completed ||
    round.attemptStartedAt === undefined
  ) {
    return false;
  }

  const attemptMs = epochMsOf(round.attemptStartedAt);

  const completedMs = epochMsOf(completedAt);

  return (
    attemptMs !== undefined &&
    completedMs !== undefined &&
    completedMs < attemptMs &&
    nowMs - attemptMs <= RE_RUN_GRACE_MS
  );
};

/**
 * How long a re-run may hold back the red of the attempt before: as long as
 * `unblock-prs` waits on a re-run it asked for before calling it stuck
 * (`RUN_TIMEOUT_MS`, which a test holds this to). The longest job timeout in
 * the workflows is 20 minutes, and the jobs re-run plus the aggregate after
 * them, with a wait for a runner, fit inside it.
 */
export const RE_RUN_GRACE_MS = 40 * 60 * 1000;

/**
 * What one check run has reported.
 *
 * A run that has not completed is pending whatever it concluded last — the
 * conclusion of a re-run is the previous verdict until the new one finishes.
 * A `skipped` conclusion is reported as `skipped` and counted as met by
 * {@link summarizeChecks}, because GitHub counts it as met: the gated jobs skip
 * on `skip-ci` and on a diff the workflow does not read, and reading that as a
 * failure would call every gated pull request red.
 * Everything else that finished — `cancelled`, `stale`, `timed_out`,
 * `action_required` — is something a reader has to act on, so it is a failure
 * here even where GitHub is vaguer about it.
 */
export const classifyCheckRun = (
  status: string,
  conclusion: string | undefined,
): ContextState =>
  status !== 'completed'
    ? 'pending'
    : conclusion === 'skipped'
      ? 'skipped'
      : conclusion !== undefined && PASSING_CONCLUSIONS.has(conclusion)
        ? 'passed'
        : 'failed';

const PASSING_CONCLUSIONS: ReadonlySet<string> = new Set<string>([
  'neutral',
  'success',
]);

/**
 * Whether any run on the head commit has not finished, or any round has not.
 *
 * Every run, not only the required ones: the aggregates are `if: always()` and
 * have no run in the newest round until the jobs they wait on are done, so
 * "every required context has reported" is true of a commit halfway through a
 * round — with the reports coming from the round before. And the round, not
 * only its runs: between the last job finishing and the aggregate being
 * created, every run there is has completed. `rounds` is every workflow run on
 * the commit, where the reader read them: one held by a concurrency group has
 * no check run yet ({@link statesFromCheckRuns}).
 */
export const anyRunInProgress = (
  runs: readonly CheckRunReport[],
  rounds: ReadonlyMap<number, WorkflowRound> = NO_ROUNDS,
): boolean =>
  runs.some(
    (run) => run.status !== 'completed' || run.round?.completed === false,
  ) || rounds.values().some(({ completed }) => !completed);

/**
 * What every context has reported on one commit, from both places GitHub keeps
 * them. The aggregate jobs are check runs; `no-skip-ci-label` is a commit
 * status, so reading only the first would report the context that holds every
 * labelled pull request as missing.
 *
 * `state` is a commit status's as the REST API spells it, in lower case.
 */
export const reportedContexts = (
  runs: readonly CheckRunReport[],
  statuses: readonly Readonly<{ context: string; state: string }>[],
  nowMs: number = Date.now(),
  rounds: ReadonlyMap<number, WorkflowRound> = NO_ROUNDS,
): ReadonlyMap<string, ContextState> => {
  // A commit status and a check run of the same name are two requirements, not
  // one reported twice: GitHub asks both to pass. So the stricter of the two is
  // kept rather than whichever was read second.
  const mut_states = new Map<string, ContextState>(
    statesFromCheckRuns(runs, nowMs, rounds),
  );

  for (const { context, state } of statuses) {
    const fromStatus = classifyCommitStatus(state);

    const reported = mut_states.get(context);

    mut_states.set(
      context,
      reported === undefined
        ? fromStatus
        : combineContextStates(reported, fromStatus),
    );
  }

  return mut_states;
};

/**
 * What a context reported that is both a check run and a commit status.
 *
 * Not "the status wins", which is what this used to assume. GitHub's own answer
 * is that neither does: "If a check and a commit status have the same name,
 * both must pass when that name is required." So the stricter of the two is the
 * verdict, and a green status cannot cover a red check run of the same name. A
 * skip beside a pass is a skip: both are met, but only one of them ran.
 */
export const combineContextStates = (
  a: ContextState,
  b: ContextState,
): ContextState =>
  a === 'failed' || b === 'failed'
    ? 'failed'
    : a === 'pending' || b === 'pending'
      ? 'pending'
      : a === 'skipped' || b === 'skipped'
        ? 'skipped'
        : 'passed';

/**
 * What one commit status has reported. `no-skip-ci-label` is one of these
 * rather than a check run, so a report that read only check runs would call the
 * context that holds every labelled pull request "missing".
 */
export const classifyCommitStatus = (state: string): ContextState => {
  switch (state) {
    case 'success':
      return 'passed';

    case 'pending':
      return 'pending';

    default:
      return 'failed';
  }
};

/**
 * The verdict on one pull request, reached over the contexts the ruleset
 * requires and no others: a failing job nothing requires does not block a
 * merge, and listing it would bury the one that does.
 *
 * `paused` outranks the rest. While `skip-ci` is on, the checks a reader sees
 * are whatever survived from before the label went on — typically the red left
 * by the `opened` run that the `labeled` run cancelled. Calling that "failing"
 * would make every queued pull request look broken; the failures are still
 * listed, because they are what a reader asks about.
 *
 * `running` is the third thing that makes a verdict provisional, beside a
 * required context that is pending and one that has not reported. Without it a
 * commit mid-round reads as settled out of the round before — which is how a
 * failing pull request (#2031) came to show a tick.
 *
 * **Off the covered base, a context that never reported is not awaited.**
 * The contexts are the ones the ruleset asks of `main`, and a workflow that
 * runs only on pull requests into `main` never reports on a stacked one — which
 * kept #2103, every check of it green, "running" until it was moved onto
 * `main`. Such a context is {@link ChecksSummary.notRun} instead, but only once
 * some required context has reported: before the first check suite, nothing
 * having come is not a pass over zero contexts.
 */
export const summarizeChecks = ({
  required,
  reported,
  paused,
  running,
  baseCovered,
}: Readonly<{
  required: readonly string[];
  reported: ReadonlyMap<string, ContextState>;
  paused: boolean;
  /** Whether anything at all is still going on the head commit. */
  running: boolean;
  /** Whether the ruleset applies to the pull request's base branch. */
  baseCovered: boolean;
}>): ChecksSummary => {
  const passed = required.filter((c) => reported.get(c) === 'passed');

  const failed = required.filter((c) => reported.get(c) === 'failed');

  const pending = required.filter((c) => reported.get(c) === 'pending');

  const skipped = required.filter((c) => reported.get(c) === 'skipped');

  const unreported = required.filter((c) => !reported.has(c));

  const awaited = baseCovered || unreported.length === required.length;

  const missing = awaited ? unreported : ([] as const);

  const notRun = awaited ? ([] as const) : unreported;

  return {
    verdict: paused
      ? 'paused'
      : Arr.isNonEmpty(failed)
        ? 'failing'
        : running || Arr.isNonEmpty(pending) || Arr.isNonEmpty(missing)
          ? 'pending'
          : 'passed',
    passed,
    failed,
    pending,
    skipped,
    missing,
    notRun,
    required: required.length,
  };
};

/**
 * Whether `run` is the one of two runs of one name GitHub would answer with
 * rather than `previous`: the one in the later-created suite, and within one
 * suite the later run of it — a re-run keeps the suite and takes a new run id.
 * Not the one that started later: a run still queued has not started.
 */
export const outranks = (run: CheckRunRank, previous: CheckRunRank): boolean =>
  run.checkSuiteId === previous.checkSuiteId
    ? run.id > previous.id
    : run.checkSuiteId > previous.checkSuiteId;

/** What {@link outranks} orders two check runs by, as {@link CheckRunReport} has them. */
export type CheckRunRank = Readonly<{ checkSuiteId: number; id: number }>;

const NO_ROUNDS: ReadonlyMap<number, WorkflowRound> = new Map<
  number,
  WorkflowRound
>();
