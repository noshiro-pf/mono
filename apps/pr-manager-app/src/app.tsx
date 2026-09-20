import * as React from 'react';
import { Result, unknownToString } from 'ts-data-forge';
import { Notice, ReportView } from './components/index.mjs';
import {
  CLOCK_TICK_MS,
  POLL_INTERVAL_MS,
  REPORT_SOURCE,
  reportIssuesUrl,
  repositoryUrl,
} from './constants.mjs';
import {
  fetchReport,
  fetchRunLog,
  UNCHANGED,
  type LoadedReport,
  type LoadedRunLog,
  type Unchanged,
} from './fetch-report.mjs';

/**
 * GitHub Pull Requests Manager.
 *
 * The page the daily pull request report is for. It reads the issue
 * `pr-report.yml` writes and shows what that report says — the merge order
 * the `Merge-After:` trailers declare, the issues each pull request closes,
 * its labels, the verdict of the contexts the ruleset requires, and how far
 * each branch is from its base.
 *
 * It only reads. Nothing here labels, rebases, merges or comments: that is
 * `unblock-prs`, run by a person, and a page that cannot do any of it is a
 * page that is safe to leave open — which is what this is for, so it keeps
 * itself current rather than going stale behind a tab.
 */
export const App = (): React.ReactElement => {
  const [state, setState] = React.useState<LoadState>(LOADING);

  /**
   * The instant every "3 hours ago" on the page is measured against.
   *
   * Its own state, ticking on its own timer, because the alternative is what
   * this used to do: fix it at the moment of the load, and read "generated 5
   * minutes ago" for as long as the tab stays open.
   */
  const [nowMs, setNowMs] = React.useState(0);

  // Split from `refresh` below because this is what the effect and the timer
  // run, and neither may set state synchronously. The initial state is
  // already `loading`, so there is nothing for them to say up front.
  const read = React.useCallback((previous: LoadState): void => {
    const sent = etagsOf(previous);

    Promise.all([
      fetchReport(REPORT_SOURCE, sent.report),
      fetchRunLog(REPORT_SOURCE, sent.runLog),
    ])
      .then(([report, runLog]) => {
        setNowMs(Date.now());

        setState((current) => merge(current, report, runLog));
      })
      .catch((error: unknown) => {
        const failed = Result.err(unknownToString(error));

        setState((current) => merge(current, failed, failed));
      });
  }, []);

  const refresh = React.useCallback((): void => {
    setState(asRefreshing);

    read(state);
  }, [read, state]);

  React.useEffect(() => {
    read(state);
    // The first load only. Everything after it is the timer below, whose
    // dependency on `state` is what gives it the ETags to send.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [read]);

  React.useEffect(() => {
    const id = setInterval(() => {
      // A hidden tab is a tab nobody is reading, and a forgotten one would
      // otherwise go on asking for the rest of the day. Coming back to it
      // is handled below.
      if (document.visibilityState === 'visible') {
        read(state);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(id);
    };
  }, [read, state]);

  React.useEffect(() => {
    const onVisible = (): void => {
      if (document.visibilityState !== 'visible') {
        return;
      }

      setNowMs(Date.now());

      read(state);
    };

    document.addEventListener('visibilitychange', onVisible);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [read, state]);

  React.useEffect(() => {
    const id = setInterval(() => {
      setNowMs(Date.now());
    }, CLOCK_TICK_MS);

    return () => {
      clearInterval(id);
    };
  }, []);

  // Outside the JSX: `react/jsx-no-leaked-render` rewrites a `&&` in an
  // attribute into a ternary whose other arm is `null`, and `disabled` does
  // not accept `null`.
  const refreshing = state.type === 'ready' && state.refreshing;

  return (
    <main className={'page'}>
      <header className={'page-header'}>
        <div>
          <h1 className={'page-title'}>{'GitHub Pull Requests Manager'}</h1>
          <p className={'page-subtitle'}>
            <a href={repositoryUrl(REPORT_SOURCE)}>
              {`${REPORT_SOURCE.owner}/${REPORT_SOURCE.repo}`}
            </a>
          </p>
        </div>

        <div className={'header-actions'}>
          {state.type === 'ready' && state.pollError !== undefined ? (
            <span className={'poll-error'} title={state.pollError}>
              {'last refresh failed'}
            </span>
          ) : undefined}

          <button
            className={'refresh-button'}
            disabled={refreshing}
            type={'button'}
            onClick={refresh}
          >
            {refreshing ? 'Reading…' : 'Refresh'}
          </button>
        </div>
      </header>

      {state.type === 'loading' ? (
        <Notice tone={'neutral'}>{'Reading the report…'}</Notice>
      ) : undefined}

      {state.type === 'failed' ? (
        <Notice tone={'critical'}>
          {state.message}
          {'\n\n'}
          <a href={reportIssuesUrl(REPORT_SOURCE)}>{'Open the report issue'}</a>
        </Notice>
      ) : undefined}

      {state.type === 'ready' ? (
        <ReportView nowMs={nowMs} report={state.report} runLog={state.runLog} />
      ) : undefined}
    </main>
  );
};

type LoadState = Readonly<
  | { type: 'failed'; message: string }
  | { type: 'loading' }
  | {
      type: 'ready';
      report: LoadedReport;
      runLog: Result<LoadedRunLog, string>;
      /**
       * A background poll that failed, kept beside the data it did not
       * replace. Silence here would be a page that had quietly stopped being
       * told anything, which looks exactly like a page where nothing has
       * happened.
       */
      pollError: string | undefined;
      refreshing: boolean;
    }
>;

/** One value, so that a re-render does not make a new one to compare. */
const LOADING: LoadState = { type: 'loading' } as const;

/**
 * The ETags to send, and the reason a `304` can always be answered: one is
 * sent only for a value that is still on the page, so "unchanged" never means
 * "unchanged from something that is gone".
 */
const etagsOf = (
  state: LoadState,
): Readonly<{ report: string | undefined; runLog: string | undefined }> =>
  state.type === 'ready'
    ? ({
        report: state.report.etag,
        runLog: Result.isOk(state.runLog) ? state.runLog.value.etag : undefined,
      } as const)
    : ({ report: undefined, runLog: undefined } as const);

const asRefreshing = (state: LoadState): LoadState =>
  state.type === 'ready' ? ({ ...state, refreshing: true } as const) : state;

/**
 * What a load or a poll makes of the state it found.
 *
 * Pure, so that it can be the argument to `setState` and act on whatever is
 * current rather than on whatever was current when the request went out.
 *
 * The rule it encodes: **a poll may add to the page, and may say it failed,
 * but may not take the page away.** A refresh that fails leaves the last
 * thing the report said on screen with a note beside it, because a dashboard
 * that blanks on a spent rate limit is worse than a dashboard showing data
 * from four minutes ago.
 */
const merge = (
  previous: LoadState,
  report: Result<LoadedReport | Unchanged, string>,
  runLog: Result<LoadedRunLog | Unchanged, string>,
): LoadState => {
  const kept = previous.type === 'ready' ? previous : undefined;

  if (Result.isErr(report)) {
    return kept === undefined
      ? { type: 'failed', message: report.value }
      : { ...kept, refreshing: false, pollError: report.value };
  }

  const nextReport = report.value === UNCHANGED ? kept?.report : report.value;

  if (nextReport === undefined) {
    // Unreachable while `etagsOf` is what decides what is sent, and worth
    // saying rather than rendering an empty page if that ever stops holding.
    return {
      type: 'failed',
      message:
        'GitHub said the report was unchanged, but this page has no copy of it.',
    };
  }

  const nextRunLog = mergeRunLog(kept?.runLog, runLog);

  // The same objects back when nothing moved, so that a poll answered `304`
  // costs no render — and so the timer that depends on this state is not
  // restarted by an answer that said nothing.
  const nothingMoved =
    nextReport === kept?.report &&
    nextRunLog === kept.runLog &&
    kept.pollError === undefined &&
    !kept.refreshing;

  return nothingMoved
    ? kept
    : {
        type: 'ready',
        report: nextReport,
        runLog: nextRunLog,
        pollError: undefined,
        refreshing: false,
      };
};

/**
 * The log is allowed to be absent — there is no issue until someone runs the
 * script — so its failures are values rather than page-level errors. The
 * previous one is returned unchanged when the new one says the same thing, so
 * that "no log yet", repeated every minute, is not a re-render every minute.
 */
const mergeRunLog = (
  kept: Result<LoadedRunLog, string> | undefined,
  next: Result<LoadedRunLog | Unchanged, string>,
): Result<LoadedRunLog, string> => {
  if (Result.isErr(next)) {
    return kept !== undefined && Result.isErr(kept) && kept.value === next.value
      ? kept
      : next;
  }

  return next.value === UNCHANGED
    ? (kept ??
        Result.err('The log was unchanged, but this page has no copy of it.'))
    : Result.ok(next.value);
};
