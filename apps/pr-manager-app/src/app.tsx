import * as React from 'react';
import { Result, unknownToString } from 'ts-data-forge';
import {
  ExternalLink,
  LoadStateView,
  Notice,
  TokenPanel,
} from './components/index.mjs';
import {
  CLOCK_TICK_MS,
  POLL_INTERVAL_MS,
  REPORT_SOURCE,
  repositoryUrl,
} from './constants.mjs';
import { loadReport } from './load-report.mjs';
import { asRefreshing, LOADING, merge, type LoadState } from './load-state.mjs';
import { type RateLimit } from './rate-limit.mjs';
import {
  forgetToken,
  readToken,
  saveToken,
  type StoredToken,
} from './token.mjs';

/**
 * GitHub Pull Requests Manager.
 *
 * Reads the open pull requests straight from GitHub and shows what is
 * holding each one up — the merge order the `Merge-After:` trailers declare,
 * the verdict of the contexts the ruleset requires, how far each branch is
 * from its base, whether it conflicts with it, and whether it waits for a
 * code owner — with what merged in the last week below.
 *
 * It only reads. Nothing here labels, rebases, merges or comments: that is
 * `unblock-prs`, run by a person, and a page that cannot do any of it is a
 * page that is safe to leave open — which is what this is for, so it keeps
 * itself current rather than going stale behind a tab.
 */
export const App = React.memo(() => {
  const [state, setState] = React.useState<LoadState>(LOADING);

  /**
   * The instant every "3 minutes ago" on the page is measured against.
   *
   * Its own state, ticking on its own timer, rather than fixed at the moment
   * of the read: a hidden tab stops reading, and a page that said "read just
   * now" for as long as it stayed open would be claiming a freshness it does
   * not have.
   */
  const [nowMs, setNowMs] = React.useState(0);

  /**
   * The reader's token. Read from storage once, at the first render, so
   * that a reader who ticked "remember" does not have to paste it again.
   * Nothing is read without one: GraphQL answers nobody without a token.
   */
  const [token, setToken] = React.useState<StoredToken | undefined>(readToken);

  /** Said out loud only when the browser refused to keep the token. */
  const [saveError, setSaveError] = React.useState<string | undefined>(
    undefined,
  );

  /** What GitHub last said was left of the budget. */
  const [rateLimit, setRateLimit] = React.useState<RateLimit | undefined>(
    undefined,
  );

  const tokenValue = token?.value;

  // Sets no state until GitHub has answered, which is what lets the effect
  // and the timer below call it.
  const read = React.useCallback((): void => {
    if (tokenValue === undefined) {
      return;
    }

    const startedAtMs = Date.now();

    loadReport(REPORT_SOURCE, { token: tokenValue, nowMs: startedAtMs })
      .then(({ result, rateLimit: answeredLimit }) => {
        setNowMs(Date.now());

        setRateLimit((current) => answeredLimit ?? current);

        setState((current) => merge(current, result, startedAtMs));
      })
      .catch((error: unknown) => {
        setState((current) =>
          merge(current, Result.err(unknownToString(error)), startedAtMs),
        );
      });
  }, [tokenValue]);

  /**
   * Kept even when the browser refuses to store it: a token that works for
   * as long as the tab is open is still the thing the reader asked for, and
   * `saveError` is what says the rest.
   */
  const onSaveToken = React.useCallback((next: StoredToken): void => {
    const saved = saveToken(next);

    setSaveError(Result.isErr(saved) ? saved.value : undefined);

    setToken(next);
  }, []);

  const onForgetToken = React.useCallback((): void => {
    forgetToken();

    setSaveError(undefined);

    setToken(undefined);

    setState(LOADING);
  }, []);

  /**
   * Reads at once. There is nothing to hold it back for: a read costs the
   * same whether the timer or the reader asks for it, and a reader who
   * presses it wants now. The button is shut only while a read it started
   * is still out, so a double click is one read.
   */
  const refresh = React.useCallback((): void => {
    setState(asRefreshing);

    read();
  }, [read]);

  React.useEffect(() => {
    // The first read, and a read on every change of token, which is how a
    // reader finds out whether GitHub takes the one they pasted.
    read();
  }, [read]);

  React.useEffect(() => {
    const id = setInterval(() => {
      // A hidden tab is a tab nobody is reading, and a forgotten one would
      // otherwise go on spending the budget for the rest of the day. Coming
      // back to it is handled below.
      if (document.visibilityState === 'visible') {
        read();
      }
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(id);
    };
  }, [read]);

  React.useEffect(() => {
    const onVisible = (): void => {
      if (document.visibilityState !== 'visible') {
        return;
      }

      setNowMs(Date.now());

      read();
    };

    document.addEventListener('visibilitychange', onVisible);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [read]);

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

  const noToken = token === undefined;

  return (
    <main className={'page'}>
      <header className={'page-header'}>
        <div>
          <h1 className={'page-title'}>{'GitHub Pull Requests Manager'}</h1>
          <p className={'page-subtitle'}>
            <ExternalLink href={repositoryUrl(REPORT_SOURCE)}>
              {`${REPORT_SOURCE.owner}/${REPORT_SOURCE.repo}`}
            </ExternalLink>
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
            disabled={noToken || refreshing}
            type={'button'}
            onClick={refresh}
          >
            {refreshing ? 'Reading…' : 'Refresh'}
          </button>
        </div>
      </header>

      <TokenPanel
        rateLimit={rateLimit}
        saveError={saveError}
        token={token}
        onForget={onForgetToken}
        onSave={onSaveToken}
      />

      {noToken ? (
        <Notice tone={'neutral'}>
          {
            'This page reads GitHub’s GraphQL API, which answers nobody without a token. Give it one above — a classic token with no scopes ticked is enough.'
          }
        </Notice>
      ) : (
        <LoadStateView nowMs={nowMs} state={state} />
      )}
    </main>
  );
});

App.displayName = 'App';
