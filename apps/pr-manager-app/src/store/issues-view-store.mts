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
 * Every open issue is read, in either view: the first thirty come with the
 * report, so that the block has something to show as soon as the rest of
 * the page does, and each page that is left is asked for as soon as the one
 * before has come in. The DAG needs all of them, because a graph of the most
 * recently updated thirty draws an edge to an issue it does not list as if
 * that issue declared nothing; and the list's priorities and labels
 * (`issues-list-store.mts`) would otherwise filter and sort a page rather
 * than what is open. A page that failed is not asked for again on its own;
 * the button under the block is still there for that.
 *
 * How large the DAG is drawn (`dag-zoom.mts`) starts at the natural size
 * on every visit and is not kept: a zoom is for the graph in front of the
 * reader, which the next visit may not have. The fit is a way of drawing
 * rather than a scale, so that it keeps the whole graph in the box as the
 * box is resized and as the graph gains or loses nodes, until a zoom or the
 * natural size is chosen; a zoom from the fit starts at the scale it had.
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
import { fitScale, zoomInFrom, zoomOutFrom, type Size } from '../dag-zoom.mjs';
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
  /** What the layout's units are multiplied by to draw the DAG. */
  dagScale: InitializedObservable<number>;
  /** Whether the DAG is drawn to fit its box, whatever the scale that takes. */
  dagFitted: InitializedObservable<boolean>;
  choose: (view: IssuesView) => void;
  toggleHideDone: () => void;
  /** The room the DAG's box has for the graph, as last measured. */
  setDagBox: (box: Size) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  /** Draws the whole graph in the box, and keeps it there. */
  fitDag: () => void;
  /** Back to the natural size. */
  resetZoom: () => void;
  /** Reads what was saved, then saves every change; returns what stops it. */
  start: () => () => void;
}>;

export const createIssuesViewStore = (
  deps: IssuesViewDeps,
): IssuesViewStore => {
  const [view, setView] = createState<IssuesView>('list');

  const [hideDone, setHideDone, { updateState: updateHideDone }] =
    createState(false);

  const [zoom, setZoom] = createState<DagZoom>({ type: 'scale', scale: 1 });

  const [dagBox, setDagBox] = createState<Size>({ width: 0, height: 0 });

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

    const reading = combine([deps.issues, deps.moreIssues]).subscribe(
      ([issues, more]) => {
        if (issues.endCursor !== undefined && more.type === 'idle') {
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

  const dagScale = combine([zoom, layout, dagBox])
    .pipe(
      map(([current, laidOut, box]) =>
        current.type === 'fit' ? fitScale(laidOut, box) : current.scale,
      ),
    )
    .pipe(skipIfNoChange());

  const dagFitted = zoom
    .pipe(map(({ type }) => type === 'fit'))
    .pipe(skipIfNoChange());

  const zoomBy = (step: (scale: number) => number) => (): void => {
    setZoom({ type: 'scale', scale: step(dagScale.getSnapshot().value) });
  };

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
    dagScale,
    dagFitted,
    choose,
    toggleHideDone,
    setDagBox,
    zoomIn: zoomBy(zoomInFrom),
    zoomOut: zoomBy(zoomOutFrom),
    fitDag: () => {
      setZoom({ type: 'fit' });
    },
    resetZoom: () => {
      setZoom({ type: 'scale', scale: 1 });
    },
    start,
  };
};

type DagZoom = Readonly<{ type: 'fit' } | { type: 'scale'; scale: number }>;
