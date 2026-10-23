import { createState, onScopeDispose } from 'synstate';
import {
  constant,
  derive,
  If,
  mapBindable,
  MatchOptional,
  view,
  type JSX,
} from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import {
  ExternalLink,
  HeaderFoldToggle,
  LoadStateView,
  Notice,
  ReadFromGitHub,
  ReadFromGitHubFolded,
  ThemeSwitch,
  TokenPanel,
  ViewSettings,
  WeeklyActivity,
} from './components/index.mjs';
import { repositoryUrl } from './constants.mjs';
import {
  headerStore,
  layoutStore,
  reader,
  reportSource,
  tokenStore,
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
 * `store/reader.mts`; this only draws what the store holds, and is called
 * once: every part of the page below is bound to the store values it shows.
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
export const App = (): JSX.Element => {
  const { loadStatus } = reader;

  const { folded } = headerStore;

  const noToken = view(tokenStore.token, (token) => token === undefined);

  const ready = derive(
    [tokenStore.token, loadStatus],
    (token, status) => token !== undefined && status.type === 'ready',
  );

  const refreshing = view(
    loadStatus,
    (status) => status.type === 'ready' && status.refreshing,
  );

  const [headerHeight, setHeaderHeight] = createState(0);

  const repository = (
    <ExternalLink href={constant(repositoryUrl(reportSource))}>
      {constant(`${reportSource.owner}/${reportSource.repo}`)}
    </ExternalLink>
  );

  return (
    <main
      class={constant('page')}
      data-header={view(folded, (isFolded) => (isFolded ? 'folded' : 'full'))}
      data-mode={layoutStore.mode}
      style={{ '--header-height': view(headerHeight, (h) => `${h}px`) }}
    >
      <header
        ref={observeHeight(setHeaderHeight)}
        class={constant('page-header')}
      >
        <If
          cond={folded}
          then={
            <div class={constant('toolbar-title')}>
              <h1 class={constant('page-title')}>{constant(TITLE)}</h1>

              {repository}

              <If cond={ready} then={<ReadFromGitHubFolded />} />
            </div>
          }
          else={
            <div>
              <h1 class={constant('page-title')}>{constant(TITLE)}</h1>
              <p class={constant('page-subtitle')}>{repository}</p>
            </div>
          }
        />

        <div class={constant('header-actions')}>
          <MatchOptional
            value={view(loadStatus, (status) =>
              status.type === 'ready'
                ? Optional.fromNullable(status.pollError)
                : Optional.none,
            )}
            some={(pollError$) => (
              <span class={constant('poll-error')} title={pollError$}>
                {constant('last refresh failed')}
              </span>
            )}
          />

          <WeeklyActivity />

          <ViewSettings />

          <ThemeSwitch />

          <button
            class={constant('refresh-button')}
            disabled={derive(
              [noToken, refreshing],
              (none, busy) => none || busy,
            )}
            type={constant('button')}
            onClick={reader.refresh}
          >
            {mapBindable(refreshing, (busy) => (busy ? 'Reading…' : 'Refresh'))}
          </button>

          <HeaderFoldToggle />
        </div>
      </header>

      {/* Folded, the panel goes too — unless there is no token, when it is
          the one thing the page has to ask for. */}
      <If
        cond={derive([folded, noToken], (isFolded, none) => !isFolded || none)}
        then={<TokenPanel />}
      />

      <If
        cond={derive(
          [ready, folded],
          (isReady, isFolded) => isReady && !isFolded,
        )}
        then={<ReadFromGitHub />}
      />

      <If
        cond={noToken}
        then={
          <Notice tone={'neutral'}>
            {constant(
              'This page reads GitHub’s GraphQL API, which answers nobody without a token. Give it one above — a classic token with no scopes ticked is enough.',
            )}
          </Notice>
        }
        else={<LoadStateView />}
      />
    </main>
  );
};

const TITLE = 'GitHub Pull Requests Manager';

/**
 * Hands the header's border-box height to `setHeight` whenever it changes,
 * until the page goes. The toolbar wraps onto a second line on a narrow
 * screen, so the height is measured rather than known.
 */
const observeHeight =
  (setHeight: (height: number) => void) =>
  (header: HTMLElement): void => {
    const observer = new ResizeObserver(([observed]) => {
      const box = observed?.borderBoxSize[0];

      if (box !== undefined) {
        setHeight(box.blockSize);
      }
    });

    observer.observe(header);

    onScopeDispose(() => {
      observer.disconnect();
    });
  };
