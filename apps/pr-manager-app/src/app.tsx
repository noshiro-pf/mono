import { memoNamed } from 'preact-utils';
import { useMemo } from 'preact/hooks';
import {
  ExternalLink,
  HeaderFoldToggle,
  LoadStateView,
  Notice,
  ReadFromGitHub,
  ThemeSwitch,
  TokenPanel,
  useBorderBoxHeight,
  ViewSettings,
} from './components/index.mjs';
import { REPORT_SOURCE, repositoryUrl } from './constants.mjs';
import {
  headerSignals,
  layoutSignals,
  reader,
  readerSignals,
  tokenSignals,
} from './store/index.mjs';

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
 *
 * The header folds into a one-line toolbar that stays at the top of the
 * window (`HeaderFoldToggle`), for a reader who wants the room for the
 * report: the title shrinks, the token panel and the line saying when the
 * report was read go, and the actions stay where they were. Its height is
 * handed to the stylesheet as `--header-height`, which is how far below the
 * top of the window the merge order's counts stop when they stay in view
 * under it (`index.css`): the toolbar wraps onto a second line on a narrow
 * screen, so that is not a length the stylesheet could know.
 *
 * In the layout's `fill` mode (`layout.mts`) the page is as tall as the
 * window and does not scroll; the blocks share what the header leaves.
 */
export const App = memoNamed('App', () => {
  const loadStatus = readerSignals.loadStatus.value;

  const token = tokenSignals.token.value;

  const folded = headerSignals.folded.value;

  const layoutMode = layoutSignals.mode.value;

  // Outside the JSX: `react/jsx-no-leaked-render` rewrites a `&&` in an
  // attribute into a ternary whose other arm is `null`, and `disabled` does
  // not accept `null`.
  const refreshing = loadStatus.type === 'ready' && loadStatus.refreshing;

  const noToken = token === undefined;

  const ready = !noToken && loadStatus.type === 'ready';

  const [headerRef, headerHeight] = useBorderBoxHeight<HTMLElement>();

  const style = useMemo(
    () => ({ '--header-height': `${headerHeight}px` }),
    [headerHeight],
  );

  return (
    <main
      className={'page'}
      data-header={folded ? 'folded' : 'full'}
      data-mode={layoutMode}
      style={style}
    >
      <header ref={headerRef} className={'page-header'}>
        {folded ? (
          <div className={'toolbar-title'}>
            <h1 className={'page-title'}>{'GitHub Pull Requests Manager'}</h1>

            <ExternalLink href={repositoryUrl(REPORT_SOURCE)}>
              {`${REPORT_SOURCE.owner}/${REPORT_SOURCE.repo}`}
            </ExternalLink>

            {ready ? <ReadFromGitHub folded /> : undefined}
          </div>
        ) : (
          <div>
            <h1 className={'page-title'}>{'GitHub Pull Requests Manager'}</h1>
            <p className={'page-subtitle'}>
              <ExternalLink href={repositoryUrl(REPORT_SOURCE)}>
                {`${REPORT_SOURCE.owner}/${REPORT_SOURCE.repo}`}
              </ExternalLink>
            </p>
          </div>
        )}

        <div className={'header-actions'}>
          {loadStatus.type === 'ready' && loadStatus.pollError !== undefined ? (
            <span className={'poll-error'} title={loadStatus.pollError}>
              {'last refresh failed'}
            </span>
          ) : undefined}

          <ViewSettings />

          <ThemeSwitch />

          <button
            className={'refresh-button'}
            disabled={noToken || refreshing}
            type={'button'}
            onClick={reader.refresh}
          >
            {refreshing ? 'Reading…' : 'Refresh'}
          </button>

          <HeaderFoldToggle />
        </div>
      </header>

      {/* Folded, the panel goes too — unless there is no token, when it is
          the one thing the page has to ask for. */}
      {folded && !noToken ? undefined : <TokenPanel />}

      {ready && !folded ? <ReadFromGitHub folded={false} /> : undefined}

      {noToken ? (
        <Notice tone={'neutral'}>
          {
            'This page reads GitHub’s GraphQL API, which answers nobody without a token. Give it one above — a classic token with no scopes ticked is enough.'
          }
        </Notice>
      ) : (
        <LoadStateView loadStatus={loadStatus} />
      )}
    </main>
  );
});
