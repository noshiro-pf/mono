import * as React from 'react';
import { Result, unknownToString } from 'ts-data-forge';
import { Notice, ReportView } from './components/index.mjs';
import { REPORT_SOURCE, reportIssuesUrl, repositoryUrl } from './constants.mjs';
import { fetchReport, type LoadedReport } from './fetch-report.mjs';

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
 * page that is safe to leave open.
 */
export const App = (): React.ReactElement => {
  const [state, setState] = React.useState<LoadState>(LOADING);

  // Split from `refresh` below because this is what the effect runs, and an
  // effect that sets state synchronously is a cascading render. The initial
  // state is already `loading`, so there is nothing for it to say.
  const read = React.useCallback((): void => {
    fetchReport(REPORT_SOURCE)
      .then((result) => {
        setState(
          Result.isErr(result)
            ? { type: 'failed', message: result.value }
            : {
                type: 'ready',
                report: result.value,
                // Read here rather than during the render below: the instant
                // the page went and looked is a fact about this load, and a
                // render is not allowed to have facts of its own.
                readAtMs: Date.now(),
              },
        );
      })
      .catch((error: unknown) => {
        setState({ type: 'failed', message: unknownToString(error) });
      });
  }, []);

  const refresh = React.useCallback((): void => {
    setState(LOADING);

    read();
  }, [read]);

  React.useEffect(() => {
    read();
  }, [read]);

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
          <button
            className={'refresh-button'}
            disabled={state.type === 'loading'}
            type={'button'}
            onClick={refresh}
          >
            {state.type === 'loading' ? 'Reading…' : 'Refresh'}
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
        <ReportView nowMs={state.readAtMs} report={state.report} />
      ) : undefined}
    </main>
  );
};

type LoadState =
  | Readonly<{ type: 'failed'; message: string }>
  | Readonly<{ type: 'loading' }>
  | Readonly<{ type: 'ready'; report: LoadedReport; readAtMs: number }>;

/** One value, so that a re-render does not make a new one to compare. */
const LOADING: LoadState = { type: 'loading' };
