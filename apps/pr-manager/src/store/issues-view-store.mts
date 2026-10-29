/**
 * How the issues block shows the open issues: as the list, or as the DAG of
 * what each waits for (`Start-After:`).
 *
 * The DAG can leave out what is done (`omitDone`), so that what is left to
 * do is all it lays out; and what is labelled `pending` (`omitPending`), a
 * switch of its own, since what is held back for now is not what is left to
 * do. The view and both switches start as `initial`, which the page reads
 * off the query string as it opens (`issues-view-settings.mts`), and every
 * change is handed to `save` from `start` on.
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
 * How large the DAG is drawn (`dag-zoom.mts`) is kept the same way, under
 * a parameter of its own: it starts at `initialZoom`, and every change is
 * handed to `saveZoom`.
 *
 * The fit is a way of drawing rather than a scale, so that it keeps the whole
 * graph in the box as the box is resized and as the graph gains or loses nodes,
 * until a zoom or the natural size is chosen; a zoom from the fit starts at the
 * scale it had. The fit also chooses where the nodes with no edge go
 * (`fitPlacement`): in rows as long, and under, beside or around the rest, as
 * lets the whole graph be drawn the largest. A zoom from the fit keeps that
 * arrangement, and the natural size puts them back in the default one.
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
} from 'synstate';
import { fastDeepEqual } from 'ts-data-forge';
import {
  fitPlacement,
  fitScale,
  NATURAL_ZOOM,
  zoomInFrom,
  zoomOutFrom,
  type DagZoom,
  type Size,
} from '../dag-zoom.mjs';
import {
  defaultPlacement,
  layoutConnected,
  placeGrid,
  type GridPlacement,
  type IssueGraphLayout,
} from '../issue-graph-layout.mjs';
import {
  buildIssueGraph,
  omitDone,
  omitPending,
  type IssueGraph,
} from '../issue-graph.mjs';
import type {
  IssuesView,
  IssuesViewSettings,
} from '../issues-view-settings.mjs';
import type { Entry, LoadedReport } from '../load-report.mjs';
import type { MoreIssuesStatus } from './reader.mjs';

export type IssuesViewDeps = Readonly<{
  issues: InitializedObservable<LoadedReport['issues']>;
  entries: InitializedObservable<readonly Entry[]>;
  /** `https://github.com/owner/name`, for a number nobody described. */
  repoUrl: string;
  /** The view and the DAG's switches as the page opens. */
  initial: IssuesViewSettings;
  save: (settings: IssuesViewSettings) => void;
  /** How large the DAG is drawn as the page opens. */
  initialZoom: DagZoom;
  saveZoom: (zoom: DagZoom) => void;
  /** How the last page of open issues asked for went. */
  moreIssues: InitializedObservable<MoreIssuesStatus>;
  /** Asks for the next page of open issues. */
  loadMoreIssues: () => void;
}>;

export type IssuesViewStore = Readonly<{
  view: InitializedObservable<IssuesView>;
  /** Whether the DAG leaves out what is done. */
  hideDone: InitializedObservable<boolean>;
  /** Whether the DAG leaves out what is labelled `pending`. */
  hidePending: InitializedObservable<boolean>;
  /**
   * The graph the DAG draws: without what is done, and what is pending,
   * when that is hidden.
   */
  graph: InitializedObservable<IssueGraph>;
  /** The whole graph, what is done included: what the list reads from. */
  fullGraph: InitializedObservable<IssueGraph>;
  layout: InitializedObservable<IssueGraphLayout>;
  /** How many nodes are done, whether or not they are drawn. */
  doneCount: InitializedObservable<number>;
  /** How many nodes are pending, whether or not they are drawn. */
  pendingCount: InitializedObservable<number>;
  /** What the layout's units are multiplied by to draw the DAG. */
  dagScale: InitializedObservable<number>;
  /** Whether the DAG is drawn to fit its box, whatever the scale that takes. */
  dagFitted: InitializedObservable<boolean>;
  choose: (view: IssuesView) => void;
  toggleHideDone: () => void;
  toggleHidePending: () => void;
  /** The room the DAG's box has for the graph, as last measured. */
  setDagBox: (box: Size) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  /** Draws the whole graph in the box, and keeps it there. */
  fitDag: () => void;
  /** Back to the natural size. */
  resetZoom: () => void;
  /**
   * Saves every change, and reads every page of the open issues, from now
   * on; returns what stops both.
   */
  start: () => () => void;
}>;

export const createIssuesViewStore = (
  deps: IssuesViewDeps,
): IssuesViewStore => {
  const [view, setView] = createState<IssuesView>(deps.initial.view);

  const [hideDone, , { updateState: updateHideDone }] = createState(
    deps.initial.hideDone,
  );

  const [hidePending, , { updateState: updateHidePending }] = createState(
    deps.initial.hidePending,
  );

  const [zoom, setZoom] = createState<DagZoom>(deps.initialZoom);

  const [dagBox, setDagBox] = createState<Size>({ width: 0, height: 0 });

  const start = (): (() => void) => {
    const saving = combine([view, hideDone, hidePending]).subscribe(
      ([current, hideD, hideP]) => {
        deps.save({ view: current, hideDone: hideD, hidePending: hideP });
      },
    );

    const zoomSaving = zoom.subscribe(deps.saveZoom);

    const reading = combine([deps.issues, deps.moreIssues]).subscribe(
      ([issues, more]) => {
        if (issues.endCursor !== undefined && more.type === 'idle') {
          deps.loadMoreIssues();
        }
      },
    );

    return () => {
      saving.unsubscribe();

      zoomSaving.unsubscribe();

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

  const graph = combine([fullGraph, hideDone, hidePending])
    .pipe(
      map(([full, hideD, hideP]) => {
        const withoutDone = hideD ? omitDone(full) : full;

        return hideP ? omitPending(withoutDone) : withoutDone;
      }),
    )
    .pipe(skipIfNoChange(fastDeepEqual));

  const parts = graph.pipe(map(layoutConnected));

  // While fitted, where the nodes with no edge go follows the box; a zoom
  // from the fit keeps where they went, so that the graph only grows or
  // shrinks, and 100% puts them back under the rest.
  const [kept, setKept] = createState<GridPlacement | undefined>(undefined);

  const placement = combine([parts, zoom, dagBox, kept])
    .pipe(
      map(([laidOut, current, box, held]) =>
        current.type === 'fit'
          ? fitPlacement(laidOut, box)
          : (held ?? defaultPlacement(laidOut)),
      ),
    )
    .pipe(skipIfNoChange(fastDeepEqual));

  const layout = combine([parts, placement]).pipe(
    map(([laidOut, placed]) => placeGrid(laidOut, placed)),
  );

  const dagScale = combine([zoom, layout, dagBox]).pipe(
    map(([current, laidOut, box]) =>
      current.type === 'fit' ? fitScale(laidOut, box) : current.scale,
    ),
  );

  const dagFitted = zoom.pipe(map(({ type }) => type === 'fit'));

  const zoomBy = (step: (scale: number) => number) => (): void => {
    setKept(placement.getSnapshot().value);

    setZoom({ type: 'scale', scale: step(dagScale.getSnapshot().value) });
  };

  const doneCount = fullGraph.pipe(
    map(({ nodes }) => nodes.filter(({ state }) => state === 'done').length),
  );

  const pendingCount = fullGraph.pipe(
    map(({ nodes }) => nodes.filter(({ pending }) => pending).length),
  );

  return {
    view,
    hideDone,
    hidePending,
    graph,
    fullGraph,
    layout,
    doneCount,
    pendingCount,
    dagScale,
    dagFitted,
    choose: setView,
    toggleHideDone: () => {
      updateHideDone((current) => !current);
    },
    toggleHidePending: () => {
      updateHidePending((current) => !current);
    },
    setDagBox,
    zoomIn: zoomBy(zoomInFrom),
    zoomOut: zoomBy(zoomOutFrom),
    fitDag: () => {
      setZoom({ type: 'fit' });
    },
    resetZoom: () => {
      setKept(undefined);

      setZoom(NATURAL_ZOOM);
    },
    start,
  };
};
