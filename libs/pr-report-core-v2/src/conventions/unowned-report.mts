/** The issue `report-unowned-prs` files for a queued pull request nobody owns. */

import { Num, Result } from 'ts-data-forge';

/** The marker `report-unowned-prs` puts in the body of its issue. */
export const unownedReportMarker = (pullRequest: number): string =>
  `<!-- unblock-prs:unowned pr=${pullRequest} -->` as const;

/** The title of that issue. */
export const unownedReportTitle = (pullRequest: number): string =>
  `unblock-prs: #${pullRequest} is in the queue with no owner` as const;

/** The pull request an issue body reports as unowned, if it is such a report. */
export const unownedReportOf = (body: string): number | undefined => {
  const digits = UNOWNED_MARKER.exec(body)?.groups?.['number'];

  if (digits === undefined) {
    return undefined;
  }

  const parsed = Num.safeParseInt(digits);

  return Result.isOk(parsed) ? parsed.value : undefined;
};

const UNOWNED_MARKER = /<!-- unblock-prs:unowned pr=(?<number>[1-9]\d*) -->/u;
