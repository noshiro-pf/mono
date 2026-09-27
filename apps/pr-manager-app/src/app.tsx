import * as React from 'react';
import { useObservableValue } from 'synstate-react-hooks';
import {
  ExternalLink,
  LoadStateView,
  Notice,
  ThemeButton,
  TokenPanel,
} from './components/index.mjs';
import { REPORT_SOURCE, repositoryUrl } from './constants.mjs';
import { reader, tokenStore } from './store/index.mjs';

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
 * itself current rather than going stale behind a tab. When it reads is
 * `store/reader.mts`; this only draws what the store holds.
 */
export const App = React.memo(() => {
  const state = useObservableValue(reader.loadState);

  const nowMs = useObservableValue(reader.nowMs);

  const token = useObservableValue(tokenStore.token);

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

          <ThemeButton />

          <button
            className={'refresh-button'}
            disabled={noToken || refreshing}
            type={'button'}
            onClick={reader.refresh}
          >
            {refreshing ? 'Reading…' : 'Refresh'}
          </button>
        </div>
      </header>

      <TokenPanel />

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
