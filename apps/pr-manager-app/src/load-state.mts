/** How the reading is going, and what each read makes of it. */

import { Result } from 'ts-data-forge';
import { type LoadedReport } from './load-report.mjs';

/**
 * How the reading went: what the page says around the report rather than
 * in it. The report itself is kept apart, part by part
 * (`store/reader.mts`), so that a read that only brought a new report does
 * not change this.
 */
export type LoadStatus = Readonly<
  | { type: 'failed'; message: string }
  | { type: 'loading' }
  | {
      type: 'ready';
      /**
       * A background read that failed, kept beside the data it did not
       * replace. Silence here would be a page that had quietly stopped being
       * told anything, which looks exactly like a page where nothing has
       * happened.
       */
      pollError: string | undefined;
      refreshing: boolean;
    }
>;

/** One value each, so that a read that changes nothing hands back the same. */
export const LOADING: LoadStatus = { type: 'loading' } as const;

export const READY: LoadStatus = {
  type: 'ready',
  pollError: undefined,
  refreshing: false,
} as const;

export const asRefreshing = (current: LoadStatus): LoadStatus =>
  current.type === 'ready'
    ? ({ ...current, refreshing: true } as const)
    : current;

export type Settled = Readonly<{
  status: LoadStatus;
  /** The report to show, or `undefined` to leave what is shown alone. */
  report: LoadedReport | undefined;
}>;

/**
 * What a read makes of the page: the status to show, and the report if it
 * is to replace the one on screen.
 *
 * Pure, so that the reader can hand it whatever is current rather than
 * whatever was current when the request went out.
 *
 * Two rules. **A read may add to the page, and may say it failed, but may
 * not take the page away**: a read that fails leaves the last report on
 * screen with a note beside it, because a dashboard that blanks on a spent
 * rate limit is worse than one showing data from a minute ago. And **an
 * older read never replaces a newer one**: a poll and a Refresh can both be
 * out at once, and whichever answers last is not necessarily the one that
 * asked last.
 */
export const settle = (
  current: LoadStatus,
  shownReadAtMs: number,
  answer: Result<LoadedReport, string>,
  startedAtMs: number,
): Settled => {
  if (current.type === 'ready' && shownReadAtMs > startedAtMs) {
    return { status: current, report: undefined };
  }

  if (Result.isErr(answer)) {
    return {
      status:
        current.type === 'ready'
          ? { ...current, refreshing: false, pollError: answer.value }
          : { type: 'failed', message: answer.value },
      report: undefined,
    };
  }

  return { status: READY, report: answer.value };
};
