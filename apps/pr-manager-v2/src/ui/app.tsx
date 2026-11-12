import { combine, createState, map } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';
import type { Repo } from '../domain/index.mjs';
import type { AppStore } from '../store/index.mjs';
import {
  issuesBlock,
  mergedBlock,
  mergeOrderBlock,
  queueBlock,
  runsBlock,
} from './blocks/index.mjs';
import { Notice } from './common/index.mjs';
import {
  ActivityDialog,
  Header,
  ReadAge,
  ReadLine,
  RefreshButton,
  TokenPanel,
} from './header/index.mjs';
import { LayoutDialog, PageBody } from './layout/index.mjs';
import './tokens.css';

type Props = Readonly<{
  app: AppStore;
  /** Opens the page for another repository, keeping the rest of the query. */
  go: (repo: Repo) => void;
}>;

/**
 * The page for a repository: the header, the token panel, and the blocks laid
 * out as the layout says. Called once; everything below is bound to the stores.
 */
export const App = ({ app, go }: Props): JSX.Element => {
  const [headerHeight, setHeaderHeight] = createState(0);

  const { budget, status } = app.report;

  const now = app.clock.now;

  const noToken = app.token.token.pipe(map((t) => t === undefined));

  // A folded header still shows the panel when the token is what needs work.
  const tokenNeeded = combine([noToken, app.report.tokenRefused]).pipe(
    map(([none, refused]) => none || refused),
  );

  return (
    <main
      class={constant('page')}
      style={{
        '--header-height': headerHeight.pipe(map((h) => `${h}px`)),
        '--sticky-top': app.header.folded.pipe(
          map((folded) => (folded ? 'var(--header-height)' : '0px')),
        ),
      }}
    >
      <Header
        activity={<ActivityDialog activity={app.activity} repo={app.repo} />}
        refresh={<RefreshButton refresh={app.report.refresh} status={status} />}
        app={app}
        go={go}
        readAge={<ReadAge now={now} status={status} />}
        readLine={<ReadLine now={now} status={status} />}
        onHeight={setHeaderHeight}
      />

      <If
        cond={app.header.folded.pipe(map((folded) => !folded))}
        then={
          <TokenPanel
            budget={budget}
            refused={app.report.tokenRefused}
            token={app.token}
          />
        }
        else={
          <If
            cond={tokenNeeded}
            then={
              <TokenPanel
                budget={budget}
                refused={app.report.tokenRefused}
                token={app.token}
              />
            }
          />
        }
      />

      <If
        cond={noToken}
        then={
          <Notice>
            {constant(
              'This page reads GitHub’s GraphQL API, which answers nobody without a token. Give it one above — a classic token with no scopes ticked is enough.',
            )}
          </Notice>
        }
      />

      <If
        cond={status.pipe(map((s) => s.kind === 'failed'))}
        then={
          <Notice>
            {status.pipe(map((s) => (s.kind === 'failed' ? s.failure : '')))}
          </Notice>
        }
      />

      <PageBody
        layout={app.layout}
        views={{
          open: mergeOrderBlock(app.mergeOrder, app.repo, now),
          queue: queueBlock(app.queue, app.repo),
          runs: runsBlock(app.report.runs, app.repo, now),
          merged: mergedBlock(app.report.report, app.repo, now),
          issues: issuesBlock(app.issues, app.repo, now),
        }}
      />

      <LayoutDialog layout={app.layout} />
    </main>
  );
};
