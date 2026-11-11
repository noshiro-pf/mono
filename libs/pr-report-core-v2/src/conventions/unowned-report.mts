/** The issue `report-unowned-prs` files for a queued pull request nobody owns. */

import { Arr, Num, Result } from 'ts-data-forge';

/** The marker `report-unowned-prs` puts in the body of its issue. */
export const unownedReportMarker = (pullRequest: number): string =>
  `<!-- unblock-prs:unowned pr=${pullRequest} -->` as const;

/** The title of that issue. */
export const unownedReportTitle = (pullRequest: number): string =>
  `unblock-prs: #${pullRequest} is in the queue with no owner` as const;

/**
 * The pull requests an issue body reports as unowned: each marker in it, as v1
 * found a pull request's marker anywhere in a body (one merged by hand from two
 * reports carries both).
 */
export const unownedReportsOf = (body: string): readonly number[] =>
  Arr.generate(function* () {
    for (const match of body.matchAll(UNOWNED_MARKER)) {
      const parsed = Num.safeParseInt(match.groups?.['number'] ?? '');

      if (Result.isOk(parsed)) {
        yield parsed.value;
      }
    }
  });

const UNOWNED_MARKER = /<!-- unblock-prs:unowned pr=(?<number>[1-9]\d*) -->/gu;
