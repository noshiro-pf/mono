/**
 * What the checks on a head commit add up to (`spec/decisions.md`, "Check
 * verdicts").
 */

import { Arr } from 'ts-data-forge';
import { epochMsOf } from '../conventions/index.mjs';
import type {
  CheckRunFacts,
  HeadChecks,
  WorkflowRoundFacts,
} from '../snapshot/index.mjs';

/**
 * The verdict on a head over the contexts the rules require and no others.
 * `paused` (`skip-ci` on) outranks the rest: what shows is from before the
 * label.
 */
export const judgeChecks = ({
  required,
  checks,
  paused,
  baseCovered,
  nowMs,
}: Readonly<{
  required: readonly string[];
  checks: HeadChecks;
  paused: boolean;
  /** Whether the rules apply to the pull request's base branch. */
  baseCovered: boolean;
  nowMs: number;
}>): ChecksSummary =>
  summarizeChecks({
    required,
    reported: contextStates(checks, nowMs),
    paused,
    running: isRunning(checks),
    baseCovered,
  });

/**
 * What every context reported on the head, from its check runs and its commit
 * statuses; a name that is both is held to the stricter (GitHub requires both).
 */
export const contextStates = (
  checks: HeadChecks,
  nowMs: number,
): ReadonlyMap<string, ContextState> => {
  const mut_states = new Map<string, ContextState>(
    checkRunStates(checks.runs, checks.rounds, nowMs),
  );

  for (const { context, state } of checks.statuses) {
    const fromStatus = classifyCommitStatus(state);

    const fromRun = mut_states.get(context);

    mut_states.set(
      context,
      fromRun === undefined
        ? fromStatus
        : combineContextStates(fromRun, fromStatus),
    );
  }

  return mut_states;
};

/**
 * What each name of check run reported: the run GitHub answers with
 * ({@link winningRuns}), `pending` while its workflow has a newer round going
 * (#2191, #3703), and a red `pending` while a re-run of its own round goes on
 * ({@link isOfEarlierAttempt}, #3474).
 */
export const checkRunStates = (
  runs: readonly CheckRunFacts[],
  rounds: readonly WorkflowRoundFacts[],
  nowMs: number,
): ReadonlyMap<string, ContextState> => {
  const roundOfSuite = new Map(
    rounds.map((round) => [round.checkSuiteId, round] as const),
  );

  const newestRoundOf = newestRounds(rounds);

  return new Map(
    Array.from(winningRuns(runs), ([name, run]) => {
      const round = roundOfSuite.get(run.checkSuiteId);

      const newest =
        round === undefined ? undefined : newestRoundOf.get(round.workflowId);

      const state = classifyCheckRun(run.status, run.conclusion);

      const superseded =
        newest !== undefined &&
        newest.checkSuiteId !== run.checkSuiteId &&
        !newest.completed;

      // Only a red: a green of the attempt before stands for its context.
      const reRunning =
        state === 'failed' &&
        run.completedAt !== undefined &&
        isOfEarlierAttempt(run.completedAt, round, nowMs);

      return [name, superseded || reRunning ? 'pending' : state] as const;
    }),
  );
};

/**
 * The workflow run whose failed jobs a re-run of the check `name` asks for: the
 * run of the suite its winning check run belongs to, or `undefined` when no
 * such check run or round was read.
 */
export const workflowRunOf = (
  checks: HeadChecks,
  name: string,
): number | undefined => {
  const run = winningRuns(checks.runs).get(name);

  return run === undefined
    ? undefined
    : checks.rounds.find(
        ({ checkSuiteId }) => checkSuiteId === run.checkSuiteId,
      )?.runId;
};

/** Of the runs of each name, the one GitHub answers with ({@link outranks}). */
export const winningRuns = <
  R extends CheckRunRank & Readonly<{ name: string }>,
>(
  runs: readonly R[],
): ReadonlyMap<string, R> => {
  const mut_winners = new Map<string, R>();

  for (const run of runs) {
    const previous = mut_winners.get(run.name);

    if (previous === undefined || outranks(run, previous)) {
      mut_winners.set(run.name, run);
    }
  }

  return mut_winners;
};

/**
 * Whether `run` is the one GitHub answers with rather than `previous`: the one
 * in the later-created suite, and within one suite the later run (a re-run
 * keeps the suite). Not the one that started later.
 */
export const outranks = (run: CheckRunRank, previous: CheckRunRank): boolean =>
  run.checkSuiteId === previous.checkSuiteId
    ? run.id > previous.id
    : run.checkSuiteId > previous.checkSuiteId;

/**
 * Whether a run that finished at `completedAt` is of an attempt of `round`
 * before the one still going: the round has not finished, its latest attempt
 * began after the run finished, and `nowMs` is within {@link RE_RUN_GRACE_MS}
 * of that start, so that a round GitHub never settles does not hold a red back
 * for good.
 */
export const isOfEarlierAttempt = (
  completedAt: string,
  round:
    | Readonly<{ completed: boolean; attemptStartedAt: string | undefined }>
    | undefined,
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
 * Whether anything on the head is still going: the counting run of any name
 * ({@link winningRuns}), required or not, or the newest round of any workflow
 * (by suite, as for runs). An aggregate has no run in a new round until the
 * jobs before it finish, so "every required context reported" is true halfway
 * through a round, from the round before (#2031). A superseded run or round
 * GitHub never closed holds nothing.
 */
export const isRunning = (checks: HeadChecks): boolean =>
  winningRuns(checks.runs)
    .values()
    .some((run) => run.status !== 'completed') ||
  newestRounds(checks.rounds)
    .values()
    .some((round) => !round.completed);

/**
 * `pending` unless completed; then `skipped`, `passed` for `success` and
 * `neutral`, and `failed` for anything else (`cancelled`, `stale`, `timed_out`,
 * `action_required`, `startup_failure`): something to act on.
 */
export const classifyCheckRun = (
  status: string,
  conclusion: string | undefined,
): ContextState =>
  status !== 'completed'
    ? 'pending'
    : conclusion === 'skipped'
      ? 'skipped'
      : conclusion === 'success' || conclusion === 'neutral'
        ? 'passed'
        : 'failed';

/**
 * `success` passed; `pending`, and GraphQL's `expected` for a required status
 * not reported yet, pending; anything else failed.
 */
export const classifyCommitStatus = (state: string): ContextState =>
  state === 'success'
    ? 'passed'
    : state === 'pending' || state === 'expected'
      ? 'pending'
      : 'failed';

/** The stricter of two: `failed` > `pending` > `skipped` > `passed`. */
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
 * The verdict over the required contexts. Off the covered base, a context
 * nothing reported is `notRun` rather than awaited, but only once some required
 * context has reported.
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
  running: boolean;
  baseCovered: boolean;
}>): ChecksSummary => {
  const withState = (state: ContextState): readonly string[] =>
    required.filter((context) => reported.get(context) === state);

  const failed = withState('failed');

  const pending = withState('pending');

  const unreported = required.filter((context) => !reported.has(context));

  const awaited = baseCovered || unreported.length === required.length;

  const missing = awaited ? unreported : ([] as const);

  return {
    verdict: paused
      ? 'paused'
      : Arr.isNonEmpty(failed)
        ? 'failing'
        : running || Arr.isNonEmpty(pending) || Arr.isNonEmpty(missing)
          ? 'pending'
          : 'passed',
    passed: withState('passed'),
    failed,
    pending,
    skipped: withState('skipped'),
    missing,
    notRun: awaited ? [] : unreported,
    required: required.length,
  };
};

/** What one context reported. */
export type ContextState = 'failed' | 'passed' | 'pending' | 'skipped';

/**
 * Each required context in exactly one list, and the verdict over them.
 * `notRun` is a context nothing reported on a base the rules do not cover.
 */
export type ChecksSummary = Readonly<{
  verdict: ChecksVerdict;
  passed: readonly string[];
  failed: readonly string[];
  pending: readonly string[];
  skipped: readonly string[];
  missing: readonly string[];
  notRun: readonly string[];
  /** How many contexts are required. */
  required: number;
}>;

export type ChecksVerdict = 'failing' | 'passed' | 'paused' | 'pending';

export type CheckRunRank = Readonly<{ checkSuiteId: number; id: number }>;

/**
 * How long a re-run may hold back the red of the attempt before: as long as the
 * worker waits on a re-run it asked for before calling it stuck.
 */
export const RE_RUN_GRACE_MS = 40 * 60 * 1000;

/** The newest round of each workflow, by check suite id. */
const newestRounds = (
  rounds: readonly WorkflowRoundFacts[],
): ReadonlyMap<number, WorkflowRoundFacts> => {
  const mut_newest = new Map<number, WorkflowRoundFacts>();

  for (const round of rounds) {
    const previous = mut_newest.get(round.workflowId);

    if (previous === undefined || round.checkSuiteId > previous.checkSuiteId) {
      mut_newest.set(round.workflowId, round);
    }
  }

  return mut_newest;
};
