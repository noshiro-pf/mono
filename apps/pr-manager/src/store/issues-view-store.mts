/**
 * How the issues block shows the open issues: as the list, or as the DAG of
 * what each waits for (`Start-After:`).
 *
 * The DAG leaves out what is done (`omitDone`), so that what is left to do
 * is all it lays out — what is done is closed or merged, and is read only
 * for how an issue that names it stands; what is labelled `pending`
 * (`omitPending`) when it is switched off, since what is held back for now
 * is not what is left to do; and the issues the priorities and `pending`
 * leave out (`omitFilteredIssues`), which both views read
 * (`issues-list-store.mts`), with how many issues each of them has drawn of
 * how many are open. The view starts as `initial`, which the page reads off
 * the query string as it opens (`issues-view-settings.mts`), and every
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
 * The whole graph is {@link createIssueGraph}'s, which the list reads each
 * issue's start state off too. The graph the DAG draws, and where each of
 * its nodes goes, are derived here from it and those switches, and passed
 * on only when they changed: a poll that moved a pull request's checks
 * changes the entries, not the graph, and lays nothing out again.
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
import type { IssueFilter } from '../issue-filter.mjs';
import {
  defaultPlacement,
  layoutConnected,
  placeGrid,
  type GridPlacement,
  type IssueGraphLayout,
} from '../issue-graph-layout.mjs';
import {
  buildIssueGraph,
  isListedIssue,
  omitDone,
  omitFilteredIssues,
  omitPending,
  type IssueGraph,
  type IssueGraphNode,
} from '../issue-graph.mjs';
import {
  countIssueFilter,
  type IssueFacts,
  type IssueFilterCounts,
} from '../issues-list-view.mjs';
import type {
  IssuesView,
  IssuesViewSettings,
} from '../issues-view-settings.mjs';
import type { Entry, LoadedReport } from '../load-report.mjs';
import type { MoreIssuesStatus } from './reader.mjs';

export type IssuesViewDeps = Readonly<{
  issues: InitializedObservable<LoadedReport['issues']>;
  /** The whole graph, what is done included ({@link createIssueGraph}). */
  graph: InitializedObservable<IssueGraph>;
  /** The priorities and `pending` the list shows, which the DAG draws too. */
  filter: InitializedObservable<IssueFilter>;
  /** The view as the page opens. */
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
  /**
   * The graph the DAG draws: without what is done, what is pending when
   * that is hidden, and the issues the priorities and `pending` leave out.
   */
  graph: InitializedObservable<IssueGraph>;
  layout: InitializedObservable<IssueGraphLayout>;
  /**
   * How many open issues the DAG draws, of how many there are, in all, for
   * each priority and for `pending`, counted as the list counts its own.
   */
  counts: InitializedObservable<IssueFilterCounts>;
  /** What the layout's units are multiplied by to draw the DAG. */
  dagScale: InitializedObservable<number>;
  /** Whether the DAG is drawn to fit its box, whatever the scale that takes. */
  dagFitted: InitializedObservable<boolean>;
  choose: (view: IssuesView) => void;
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

  const [zoom, setZoom] = createState<DagZoom>(deps.initialZoom);

  const [dagBox, setDagBox] = createState<Size>({ width: 0, height: 0 });

  const start = (): (() => void) => {
    const saving = view.subscribe((current) => {
      deps.save({ view: current });
    });

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

  const withoutDone = deps.graph.pipe(map(omitDone));

  // `pending` switched off before the rest, so that what an issue waits on is
  // kept for it only while that issue is drawn.
  const graph = combine([withoutDone, deps.filter])
    .pipe(
      map(([open, filter]) =>
        omitFilteredIssues(
          filter.hidePending ? omitPending(open) : open,
          filter,
        ),
      ),
    )
    .pipe(skipIfNoChange(fastDeepEqual));

  const counts = combine([deps.graph, deps.filter])
    .pipe(
      map(([full, filter]) =>
        countIssueFilter(
          full.nodes.filter(isListedIssue),
          NODE_FACTS,
          () => true,
          filter,
        ),
      ),
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

  return {
    view,
    graph,
    layout,
    counts,
    dagScale,
    dagFitted,
    choose: setView,
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

/**
 * The open issues as the graph of what each waits for (`issue-graph.mts`),
 * what is done included, since that is why an issue reads as ready: what
 * the DAG draws from (`createIssuesViewStore`) and what the list reads each
 * issue's start state off (`issues-list-store.mts`). Passed on only when it
 * changed.
 */
export const createIssueGraph = ({
  issues,
  entries,
  repoUrl,
}: Readonly<{
  issues: InitializedObservable<LoadedReport['issues']>;
  entries: InitializedObservable<readonly Entry[]>;
  /** `https://github.com/owner/name`, for a number nobody described. */
  repoUrl: string;
}>): InitializedObservable<IssueGraph> =>
  combine([issues, entries])
    .pipe(
      map(([read, pulls]) =>
        buildIssueGraph({
          repoUrl,
          issues: read.items,
          referenced: read.referenced,
          pulls,
        }),
      ),
    )
    .pipe(skipIfNoChange(fastDeepEqual));

const NODE_FACTS: IssueFacts<IssueGraphNode> = {
  priority: (node) => node.priority,
  pending: (node) => node.pending,
} as const;
