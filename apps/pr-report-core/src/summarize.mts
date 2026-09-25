/** The counts the report leads with, in one place. */

import { MERGE_QUEUED_LABEL } from './labels.mjs';
import { type ReportEntry, type Summary } from './types.mjs';

/**
 * How much there is and how much of it wants attention.
 *
 * Here rather than in whoever displays it. Two of these are questions this
 * repository's conventions answer — `queued` is a label, and `failing` is the
 * verdict reached over the contexts the ruleset requires — and both
 * `pr-report` and the Pull Requests Manager page lead with them.
 */
export const summarize = (entries: readonly ReportEntry[]): Summary => {
  const count = (predicate: (entry: ReportEntry) => boolean): number =>
    entries.filter(predicate).length;

  return {
    open: entries.length,
    queued: count((entry) =>
      entry.labels.some((label) => label.name === MERGE_QUEUED_LABEL),
    ),
    draft: count((entry) => entry.isDraft),
    failing: count((entry) => entry.checks.verdict === 'failing'),
    behind: count((entry) => (entry.comparison?.behindBy ?? 0) > 0),
  };
};
