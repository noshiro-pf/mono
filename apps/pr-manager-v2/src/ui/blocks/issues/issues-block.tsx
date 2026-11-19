import { map, type InitializedObservable } from 'synstate';
import { constant, If, MatchOptional, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import {
  githubSearchUrl,
  issuesSearchOf,
  repoUrl,
  type IssuesView,
  type Repo,
} from '../../../domain/index.mjs';
import type { IssuesBlockView, IssuesStore } from '../../../store/index.mjs';
import { ExternalLink, FailuresNotice, Notice } from '../../common/index.mjs';
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
          class={constant('title-action')}
          href={constant(`${repoUrl(repo)}/issues/new`)}
        >
          {constant('New issue')}
        </ExternalLink>
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

  // The view a press of the switch has just drawn: its own switch, made anew,
  // takes the focus the pressed button had, which went with the other view.
  const mut_pressed: { view: IssuesView | undefined } = { view: undefined };

  // Each view draws these at its head, the DAG with its zoom beside the switch.
  const viewSwitch = (): JSX.Element => (
    <div
      aria-label={constant('View')}
      class={constant('segmented')}
      role={constant('group')}
    >
      {VIEWS.map(([shown, name]) => (
        <button
          ref={(button) => {
            if (mut_pressed.view !== shown) {
              return;
            }

            mut_pressed.view = undefined;

            queueMicrotask(() => {
              button.focus();
            });
          }}
          aria-pressed={store.settings.pipe(map((s) => s.view === shown))}
          class={constant('segment')}
          type={constant('button')}
          onClick={() => {
            if (Optional.unwrap(store.settings.getSnapshot()).view !== shown) {
              mut_pressed.view = shown;
            }

            store.update((prev) => ({ ...prev, view: shown }));
          }}
        >
          {constant(name)}
        </button>
      ))}
    </div>
  );

  const tiles = (): JSX.Element => (
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
  );

  return (
    <div class={constant('issues')}>
      <If
        cond={view.pipe(map(({ incomplete }) => incomplete))}
        then={
          <Notice>
            {constant(
              'More issues are open than one read takes: the oldest are left out.',
            )}
          </Notice>
        }
      />
      <FailuresNotice failures={view.pipe(map(({ failures }) => failures))} />
      <If
        cond={isDag}
        then={
          <IssueDag
            now={now}
            store={store}
            tiles={tiles}
            view={view}
            viewSwitch={viewSwitch}
          />
        }
        else={
          <IssueList
            now={now}
            store={store}
            tiles={tiles}
            view={view}
            viewSwitch={viewSwitch}
          />
        }
      />
    </div>
  );
};

const VIEWS = [
  ['list', 'List'],
  ['dag', 'DAG'],
] as const satisfies readonly (readonly [IssuesView, string])[];
