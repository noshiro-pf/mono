/** What the page has, and what each read makes of it. */

import { Result } from 'ts-data-forge';
import { type LoadedReport } from './load-report.mjs';

export type LoadState = Readonly<
  | { type: 'failed'; message: string }
  | { type: 'loading' }
  | {
      type: 'ready';
      report: LoadedReport;
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

/** One value, so that a re-render does not make a new one to compare. */
export const LOADING: LoadState = { type: 'loading' } as const;

export const asRefreshing = (state: LoadState): LoadState =>
  state.type === 'ready' ? ({ ...state, refreshing: true } as const) : state;

/**
 * What a read makes of the state it found.
 *
 * Pure, so that it can be the argument to `setState` and act on whatever is
 * current rather than on whatever was current when the request went out.
 *
 * Two rules. **A read may add to the page, and may say it failed, but may
 * not take the page away**: a read that fails leaves the last report on
 * screen with a note beside it, because a dashboard that blanks on a spent
 * rate limit is worse than one showing data from a minute ago. And **an
 * older read never replaces a newer one**: a poll and a Refresh can both be
 * out at once, and whichever answers last is not necessarily the one that
 * asked last.
 */
export const merge = (
  previous: LoadState,
  answer: Result<LoadedReport, string>,
  startedAtMs: number,
): LoadState => {
  const kept = previous.type === 'ready' ? previous : undefined;

  if (kept !== undefined && kept.report.readAtEpochMs > startedAtMs) {
    return kept;
  }

  if (Result.isErr(answer)) {
    return kept === undefined
      ? { type: 'failed', message: answer.value }
      : { ...kept, refreshing: false, pollError: answer.value };
  }

  return {
    type: 'ready',
    report: answer.value,
    pollError: undefined,
    refreshing: false,
  };
};
