/**
 * What each panel says of the parts it is drawn from that a read could not read
 * (`LoadedReport.failed`). A part fails on its own — GitHub times out one
 * query, not the read — so it is said where what it shows is, and the rest of
 * the page goes on as it was.
 */

import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { PartFailure, PartFailures, ReadPart } from './load-report.mjs';

/**
 * The parts the merge order and the queue are drawn from. The merge order needs
 * the pull requests, and the rest for what each card says; the queue needs
 * every one of them.
 */
export const OPEN_PARTS = [
  'pulls',
  'rules',
  'checks',
  'details',
  'comparisons',
] as const satisfies readonly ReadPart[];

/**
 * One sentence for each of `parts` that failed, in their order. The rules and
 * the comparisons are asked from the pull requests, and fail with their failure
 * where none were kept; that is said once, as the pull requests'.
 */
export const failureNotes = (
  failed: PartFailures,
  parts: readonly ReadPart[],
): readonly string[] => {
  // Asked from the pull requests, they were never asked when those failed with
  // none kept.
  const cascaded = failed.pulls?.kept === false;

  return Arr.generate(function* () {
    for (const part of parts) {
      const failure = failed[part];

      if (
        failure === undefined ||
        (cascaded && (part === 'rules' || part === 'comparisons'))
      ) {
        continue;
      }

      yield failure.kept
        ? `Could not read ${PART_NAMES[part]}, so this shows the last read of it. ${failure.message}`
        : `Could not read ${PART_NAMES[part]}. ${failure.message}`;
    }
  });
};

/**
 * What keeps a head's checks from being judged on this read: the rules that say
 * which of them count, failed with none kept, before the checks' own query.
 * Rules kept from the last read still say which count.
 */
export const checksFailureOf = (
  failed: PartFailures,
): PartFailure | undefined =>
  failed.rules?.kept === false ? failed.rules : failed.checks;

/**
 * Whether `part` failed with nothing kept of it: what the panel would draw of it
 * is not empty but unread, and only the failure is said.
 */
export const isUnread = (failed: PartFailures, part: ReadPart): boolean =>
  failed[part]?.kept === false;

/** What each part is, in a sentence that says it could not be read. */
const PART_NAMES = {
  pulls: 'the open pull requests',
  rules: 'what the default branch requires',
  checks: 'the check results',
  details: 'the reviews and set-aside records',
  comparisons: 'how far each branch is from its base',
  merged: 'what merged',
  issues: 'the open issues',
} as const satisfies ReadonlyRecord<ReadPart, string>;
