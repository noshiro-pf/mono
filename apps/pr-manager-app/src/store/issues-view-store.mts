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
 * The DAG can leave out what is done (`omitDone`), so that what is left to
 * do is all it lays out. That switch is kept the same way, under its own
 * key, and starts off: the DAG shows everything until told otherwise.
 *
 * The DAG reads every open issue: while it is shown, each page that is
 * left is asked for as soon as the one before has come in, because a graph
 * of the most recently updated thirty draws an edge to an issue it does not
 * list as if that issue declared nothing. A page that failed is not asked
 * for again on its own; the button under the block is still there for that.
 *
 * The graph the DAG draws, and where each of its nodes goes, are derived
 * here from the report and that switch, and passed on only when they
 * changed: a poll that moved a pull request's checks changes the entries,
 * not the graph, and lays nothing out again.
 */

import {
  combine,
  createState,
  map,
  skipIfNoChange,
  type InitializedObservable,
  type Subscription,
} from 'synstate';
import { Arr, fastDeepEqual } from 'ts-data-forge';
import {
  layoutIssueGraph,
  type IssueGraphLayout,
} from '../issue-graph-layout.mjs';
import { buildIssueGraph, omitDone, type IssueGraph } from '../issue-graph.mjs';
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
  /** Whether the DAG left out what is done, as it was saved. */
  loadHideDone: () => Promise<unknown>;
  saveHideDone: (hide: boolean) => void;
  /** How the last page of open issues asked for went. */
  moreIssues: InitializedObservable<MoreIssuesStatus>;
  /** Asks for the next page of open issues. */
  loadMoreIssues: () => void;
}>;

export type IssuesViewStore = Readonly<{
  view: InitializedObservable<IssuesView>;
  /** Whether the DAG leaves out what is done. */
  hideDone: InitializedObservable<boolean>;
  /** The graph the DAG draws: without what is done, when that is hidden. */
  graph: InitializedObservable<IssueGraph>;
  layout: InitializedObservable<IssueGraphLayout>;
  /** How many nodes are done, whether or not they are drawn. */
  doneCount: InitializedObservable<number>;
  choose: (view: IssuesView) => void;
  toggleHideDone: () => void;
  /** Reads what was saved, then saves every change; returns what stops it. */
  start: () => () => void;
}>;

export const createIssuesViewStore = (
  deps: IssuesViewDeps,
): IssuesViewStore => {
  const [view, setView] = createState<IssuesView>('list');

  const [hideDone, setHideDone, { updateState: updateHideDone }] =
    createState(false);

  // Whether the reader has chosen yet, for each.
  const mut_reader = { changedView: false, changedHideDone: false };

  const choose = (next: IssuesView): void => {
    mut_reader.changedView = true;

    setView(next);
  };

  const toggleHideDone = (): void => {
    mut_reader.changedHideDone = true;

    updateHideDone((current) => !current);
  };

  const start = (): (() => void) => {
    const mut_run: {
      stopped: boolean;
      saving: readonly Subscription[];
    } = {
      stopped: false,
      saving: [],
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

    const resume =
      (apply: (stored: unknown) => void, saving: () => Subscription) =>
      (stored: unknown): void => {
        if (mut_run.stopped) {
          return;
        }

        apply(stored);

        mut_run.saving = Arr.toPushed(mut_run.saving, saving());
      };

    deps
      .load()
      .catch(() => undefined)
      .then(
        resume(
          (stored) => {
            if (!mut_reader.changedView) {
              setView(stored === 'dag' ? 'dag' : 'list');
            }
          },
          () => view.subscribe(deps.save),
        ),
      )
      .catch(() => undefined);

    deps
      .loadHideDone()
      .catch(() => undefined)
      .then(
        resume(
          (stored) => {
            if (!mut_reader.changedHideDone) {
              setHideDone(stored === true);
            }
          },
          () => hideDone.subscribe(deps.saveHideDone),
        ),
      )
      .catch(() => undefined);

    return () => {
      mut_run.stopped = true;

      for (const subscription of mut_run.saving) {
        subscription.unsubscribe();
      }

      reading.unsubscribe();
    };
  };

  const fullGraph = combine([deps.issues, deps.entries])
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

  const graph = combine([fullGraph, hideDone])
    .pipe(map(([full, hide]) => (hide ? omitDone(full) : full)))
    .pipe(skipIfNoChange(fastDeepEqual));

  const layout = graph.pipe(map(layoutIssueGraph));

  const doneCount = fullGraph
    .pipe(
      map(({ nodes }) => nodes.filter(({ state }) => state === 'done').length),
    )
    .pipe(skipIfNoChange());

  return {
    view,
    hideDone,
    graph,
    layout,
    doneCount,
    choose,
    toggleHideDone,
    start,
  };
};
