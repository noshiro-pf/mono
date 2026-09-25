/** What the checks on a head commit add up to. */

import { Arr } from 'ts-data-forge';
import { type ChecksSummary, type ContextState } from './types.mjs';

/**
 * What every context reported, from a head commit's check runs.
 *
 * A name appears more than once whenever two check suites reported it, and on
 * a queued pull request that is the normal case rather than the odd one: the
 * run the `opened` event starts is cancelled by the `labeled` event's, and
 * both stay on the commit — the cancelled one leaving its `*-result`
 * aggregate concluded `failure`, because an `if: always()` job that asserts
 * on cancelled `needs` fails.
 *
 * **The newest check suite wins, and that is not the same as the newest
 * run.** GitHub resolves a required context to the run in the suite with the
 * greatest id, so where the cancelled suite happens to have been created
 * after the one that superseded it, the stale red is what holds the merge —
 * however much later the green one finished. Every suite of one push is
 * created in the same second, so which of them got the higher id is not
 * something the repository decides.
 *
 * This is why the rule is not "the newest `started_at`", which reads more
 * natural and would call such a pull request green while GitHub blocks it.
 * A report that says a blocked pull request will merge is worse than one
 * that says a green one will not: `CLAUDE.md`'s "Commits and pull requests"
 * says to ignore the red the cancelled run leaves, and this is the case where
 * GitHub does not.
 */
export const statesFromCheckRuns = (
  runs: readonly CheckRunReport[],
): ReadonlyMap<string, ContextState> => {
  const mut_winner = new Map<string, CheckRunReport>();

  for (const run of runs) {
    const previous = mut_winner.get(run.name);

    if (previous === undefined || outranks(run, previous)) {
      mut_winner.set(run.name, run);
    }
  }

  const mut_states = new Map<string, ContextState>();

  for (const [name, run] of mut_winner) {
    mut_states.set(name, classifyCheckRun(run.status, run.conclusion));
  }

  return mut_states;
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
}>;

/**
 * What one check run has reported.
 *
 * A run that has not completed is pending whatever it concluded last — the
 * conclusion of a re-run is the previous verdict until the new one finishes.
 * A `skipped` conclusion is a pass, because GitHub counts it as one: the
 * gated jobs skip on `skip-ci` and on a diff the workflow does not read, and
 * reading that as a failure would call every gated pull request red.
 * Everything else that finished — `cancelled`, `stale`, `timed_out`,
 * `action_required` — is something a reader has to act on, so it is a
 * failure here even where GitHub is vaguer about it.
 */
export const classifyCheckRun = (
  status: string,
  conclusion: string | undefined,
): ContextState =>
  status !== 'completed'
    ? 'pending'
    : conclusion !== undefined && PASSING_CONCLUSIONS.has(conclusion)
      ? 'passed'
      : 'failed';

const PASSING_CONCLUSIONS: ReadonlySet<string> = new Set([
  'neutral',
  'skipped',
  'success',
]);

/**
 * Which of two runs of one name GitHub would answer with: the one in the
 * later-created suite, and within one suite the later run of it — a re-run
 * keeps the suite and takes a new run id.
 */
const outranks = (run: CheckRunReport, previous: CheckRunReport): boolean =>
  run.checkSuiteId === previous.checkSuiteId
    ? run.id > previous.id
    : run.checkSuiteId > previous.checkSuiteId;

/**
 * What every context has reported on one commit, from both places GitHub
 * keeps them. The aggregate jobs are check runs; `no-skip-ci-label` is a
 * commit status, so reading only the first would report the context that
 * holds every labelled pull request as missing.
 *
 * `state` is a commit status's as the REST API spells it, in lower case.
 */
export const reportedContexts = (
  runs: readonly CheckRunReport[],
  statuses: readonly Readonly<{ context: string; state: string }>[],
): ReadonlyMap<string, ContextState> => {
  // A commit status and a check run of the same name are two requirements,
  // not one reported twice: GitHub asks both to pass. So the stricter of
  // the two is kept rather than whichever was read second.
  const mut_states = new Map<string, ContextState>(statesFromCheckRuns(runs));

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
 * Not "the status wins", which is what this used to assume. GitHub's own
 * answer is that neither does: "If a check and a commit status have the same
 * name, both must pass when that name is required." So the stricter of the
 * two is the verdict, and a green status cannot cover a red check run of the
 * same name.
 */
export const combineContextStates = (
  a: ContextState,
  b: ContextState,
): ContextState =>
  a === 'failed' || b === 'failed'
    ? 'failed'
    : a === 'pending' || b === 'pending'
      ? 'pending'
      : 'passed';

/**
 * What one commit status has reported. `no-skip-ci-label` is one of these
 * rather than a check run, so a report that read only check runs would call
 * the context that holds every labelled pull request "missing".
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
 * `paused` outranks the rest. While `skip-ci` is on, the checks a reader
 * sees are whatever survived from before the label went on — typically the
 * red left by the `opened` run that the `labeled` run cancelled. Calling
 * that "failing" would make every queued pull request look broken; the
 * failures are still listed, because they are what a reader asks about.
 */
export const summarizeChecks = ({
  required,
  reported,
  paused,
}: Readonly<{
  required: readonly string[];
  reported: ReadonlyMap<string, ContextState>;
  paused: boolean;
}>): ChecksSummary => {
  const failed = required.filter((c) => reported.get(c) === 'failed');

  const pending = required.filter((c) => reported.get(c) === 'pending');

  const missing = required.filter((c) => !reported.has(c));

  return {
    verdict: paused
      ? 'paused'
      : Arr.isNonEmpty(failed)
        ? 'failing'
        : Arr.isNonEmpty(pending) || Arr.isNonEmpty(missing)
          ? 'pending'
          : 'passed',
    failed,
    pending,
    missing,
    required: required.length,
  };
};
