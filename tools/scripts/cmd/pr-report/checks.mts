/** What the checks on a head commit add up to. */

import { Arr } from 'ts-data-forge';
import { type ChecksSummary, type ContextState } from './types.mjs';

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
): ContextState => {
  if (status !== 'completed') return 'pending';

  return conclusion !== undefined && PASSING_CONCLUSIONS.has(conclusion)
    ? 'passed'
    : 'failed';
};

const PASSING_CONCLUSIONS: ReadonlySet<string> = new Set([
  'neutral',
  'skipped',
  'success',
]);

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
