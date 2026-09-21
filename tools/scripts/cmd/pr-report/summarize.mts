/** The counts the report leads with, in one place. */

import { type PayloadSummary } from 'pr-report-payload';
import { MERGE_QUEUED_LABEL } from '../unblock-prs/labels.mjs';
import { type PrReport, type ReportEntry } from './types.mjs';

/**
 * How much there is and how much of it wants attention.
 *
 * Computed here rather than by whoever displays it. Two of these are
 * questions this repository's conventions answer — `queued` is a label whose
 * string lives in the workflows and in `unblock-prs`, and `failing` is the
 * verdict reached over the contexts the ruleset requires — so a second
 * implementation, in the app that reads the report, would be a second place
 * to change the day either convention moves.
 */
export const summarize = (report: PrReport): PayloadSummary => {
  const count = (predicate: (entry: ReportEntry) => boolean): number =>
    report.entries.filter(predicate).length;

  return {
    open: report.entries.length,
    queued: count((entry) =>
      entry.labels.some((label) => label.name === MERGE_QUEUED_LABEL),
    ),
    draft: count((entry) => entry.isDraft),
    failing: count((entry) => entry.checks.verdict === 'failing'),
    behind: count((entry) => (entry.comparison?.behindBy ?? 0) > 0),
  };
};
