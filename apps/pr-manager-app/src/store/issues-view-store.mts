/**
 * How the issues block shows the open issues: as the list, or as the DAG of
 * what each waits for (`Start-After:`).
 *
 * Kept as the header's fold is (`header-store.mts`), and for the same
 * reason: a working choice, not a way of looking at the page worth sharing in
 * a link. It starts as the list, which is what the page draws until `load`
 * answers; only then is anything handed to `save`, so the default never
 * overwrites what was saved, and a choice made in that moment is kept over
 * it.
 *
 * The DAG reads every open issue: while it is shown, each page that is
 * left is asked for as soon as the one before has come in, because a graph
 * of the most recently updated thirty draws an edge to an issue it does not
 * list as if that issue declared nothing. A page that failed is not asked
 * for again on its own; the button under the block is still there for that.
 *
 * The graph the DAG draws, and where each of its nodes goes, are derived
 * here from the report, and passed on only when they changed: a poll that
 * moved a pull request's checks changes the entries, not the graph, and lays
 * nothing out again.
 */

import {
  combine,
  createState,
  map,
  skipIfNoChange,
  type InitializedObservable,
  type Subscription,
} from 'synstate';
import { fastDeepEqual } from 'ts-data-forge';
import {
  layoutIssueGraph,
  type IssueGraphLayout,
} from '../issue-graph-layout.mjs';
import { buildIssueGraph, type IssueGraph } from '../issue-graph.mjs';
import type { Entry, LoadedReport } from '../load-report.mjs';
import type { MoreIssuesStatus } from './reader.mjs';

export const issuesViews = ['list', 'dag'] as const;

export type IssuesView = (typeof issuesViews)[number];

export type IssuesViewDeps = Readonly<{
  issues: InitializedObservable<LoadedReport['issues']>;
  entries: InitializedObservable<readonly Entry[]>;
  /** `https://github.com/owner/name`, for a number nobody described. */
  repoUrl: string;
  /** What was saved, as it was saved; it rejects when nothing can be read. */
  load: () => Promise<unknown>;
  save: (view: IssuesView) => void;
  /** How the last page of open issues asked for went. */
  moreIssues: InitializedObservable<MoreIssuesStatus>;
  /** Asks for the next page of open issues. */
  loadMoreIssues: () => void;
}>;

export type IssuesViewStore = Readonly<{
  view: InitializedObservable<IssuesView>;
  graph: InitializedObservable<IssueGraph>;
  layout: InitializedObservable<IssueGraphLayout>;
  choose: (view: IssuesView) => void;
  /** Reads what was saved, then saves every change; returns what stops it. */
  start: () => () => void;
}>;

export const createIssuesViewStore = (
  deps: IssuesViewDeps,
): IssuesViewStore => {
  const [view, setView] = createState<IssuesView>('list');

  // Whether the reader has chosen yet.
  const mut_reader = { changed: false };

  const choose = (next: IssuesView): void => {
    mut_reader.changed = true;

    setView(next);
  };

  const start = (): (() => void) => {
    const mut_run: { stopped: boolean; saving: Subscription | undefined } = {
      stopped: false,
      saving: undefined,
    };

    const reading = combine([view, deps.issues, deps.moreIssues]).subscribe(
      ([shown, issues, more]) => {
        if (
          shown === 'dag' &&
          issues.endCursor !== undefined &&
          more.type === 'idle'
        ) {
          deps.loadMoreIssues();
        }
      },
    );

    const resume = (stored: unknown): void => {
      if (mut_run.stopped) {
        return;
      }

      if (!mut_reader.changed) {
        setView(stored === 'dag' ? 'dag' : 'list');
      }

      mut_run.saving = view.subscribe(deps.save);
    };

    deps
      .load()
      .catch(() => undefined)
      .then(resume)
      .catch(() => undefined);

    return () => {
      mut_run.stopped = true;

      mut_run.saving?.unsubscribe();

      reading.unsubscribe();
    };
  };

  const graph = combine([deps.issues, deps.entries])
    .pipe(
      map(([issues, entries]) =>
        buildIssueGraph({
          repoUrl: deps.repoUrl,
          issues: issues.items,
          referenced: issues.referenced,
          pulls: entries,
        }),
      ),
    )
    .pipe(skipIfNoChange(fastDeepEqual));

  const layout = graph.pipe(map(layoutIssueGraph));

  return { view, graph, layout, choose, start };
};
