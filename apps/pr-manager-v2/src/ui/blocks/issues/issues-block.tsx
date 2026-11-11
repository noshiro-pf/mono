import { map, type InitializedObservable } from 'synstate';
import { constant, If, MatchOptional, type JSX } from 'synstate-dom';
import { Arr, Optional } from 'ts-data-forge';
import {
  githubSearchUrl,
  issuesSearchOf,
  repoUrl,
  type IssuesView,
  type Repo,
} from '../../../domain/index.mjs';
import type { IssuesBlockView, IssuesStore } from '../../../store/index.mjs';
import { ExternalLink, Notice } from '../../common/index.mjs';
import type { BlockView } from '../../layout/index.mjs';
import { IssueDag } from './issue-dag.js';
import { IssueList } from './issue-list.js';
import { IssueTiles } from './issue-tiles.js';
import './issues.css';

type Ready = IssuesBlockView & Readonly<{ kind: 'ready' }>;

/**
 * The open issues block (spec §11): its title with the counts, the view switch
 * and the tiles both views share, then the list or the DAG.
 */
export const issuesBlock = (
  store: IssuesStore,
  repo: Repo,
  now: InitializedObservable<number>,
): BlockView => {
  const ready = store.view.pipe(
    map((v) => (v.kind === 'ready' ? Optional.some(v) : Optional.none)),
  );

  const search = store.settings.pipe(map(issuesSearchOf));

  return {
    title: (
      <>
        {constant('Open issues')}
        {store.view.pipe(
          map((v) => (v.kind === 'ready' ? ` (${v.rows.size})` : '')),
        )}
      </>
    ),
    extras: (
      <>
        <ExternalLink
          class={constant('on-github')}
          href={search.pipe(
            map(({ query }) => githubSearchUrl(repo, 'issues', query)),
          )}
          title={search.pipe(map(({ title }) => title))}
        >
          {constant('on GitHub')}
        </ExternalLink>
        <ExternalLink
          class={constant('on-github')}
          href={constant(`${repoUrl(repo)}/issues/new`)}
        >
          {constant('New issue')}
        </ExternalLink>
        <div
          aria-label={constant('View')}
          class={constant('segmented')}
          role={constant('group')}
        >
          {VIEWS.map(([view, name]) => (
            <button
              aria-pressed={store.settings.pipe(map((s) => s.view === view))}
              class={constant('segment')}
              type={constant('button')}
              onClick={() => {
                store.update((prev) => ({ ...prev, view }));
              }}
            >
              {constant(name)}
            </button>
          ))}
        </div>
      </>
    ),
    body: () => (
      <MatchOptional
        value={ready}
        some={(view$) => <IssuesBody now={now} store={store} view={view$} />}
        none={
          <p class={constant('muted')}>
            {store.view.pipe(
              map((v) =>
                v.kind === 'unread' && v.reason !== undefined
                  ? `Could not read the open issues: ${v.reason}`
                  : 'Not read yet.',
              ),
            )}
          </p>
        }
      />
    ),
  };
};

const IssuesBody = ({
  view,
  store,
  now,
}: Readonly<{
  view: InitializedObservable<Ready>;
  store: IssuesStore;
  now: InitializedObservable<number>;
}>): JSX.Element => {
  const isDag = store.settings.pipe(map((s) => s.view === 'dag'));

  return (
    <div class={constant('issues')}>
      <If
        cond={view.pipe(
          map(
            ({ failures, incomplete }) =>
              incomplete || Arr.isNonEmpty(failures),
          ),
        )}
        then={
          <Notice>
            {view.pipe(
              map(({ failures, incomplete }) =>
                [
                  ...(incomplete
                    ? [
                        'More issues are open than one read takes: the oldest are left out.',
                      ]
                    : []),
                  ...failures.map(
                    ({ what, message }) =>
                      `Could not read ${what} (${message}); its last answer is drawn.`,
                  ),
                ].join(' '),
              ),
            )}
          </Notice>
        }
      />
      <IssueTiles
        counts={view.pipe(
          map((v) =>
            Optional.unwrap(store.settings.getSnapshot()).view === 'dag'
              ? v.dagCounts
              : v.listCounts,
          ),
        )}
        settings={store.settings}
        update={store.update}
      />
      <If
        cond={isDag}
        then={<IssueDag now={now} store={store} view={view} />}
        else={<IssueList now={now} store={store} view={view} />}
      />
    </div>
  );
};

const VIEWS = [
  ['list', 'List'],
  ['dag', 'DAG'],
] as const satisfies readonly (readonly [IssuesView, string])[];
