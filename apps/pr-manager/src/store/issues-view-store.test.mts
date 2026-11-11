import { createState } from 'synstate';
import { Optional } from 'ts-data-forge';
import { NATURAL_ZOOM, type DagZoom } from '../dag-zoom.mjs';
import { DEFAULT_ISSUE_FILTER, type IssueFilter } from '../issue-filter.mjs';
import {
  DEFAULT_ISSUES_VIEW_SETTINGS,
  type IssuesViewSettings,
} from '../issues-view-settings.mjs';
import type { Entry, LoadedReport } from '../load-report.mjs';
import {
  createIssueGraph,
  createIssuesViewStore,
} from './issues-view-store.mjs';
import type { MoreIssuesStatus } from './reader.mjs';

describe(createIssuesViewStore, () => {
  test('starts at the settings it is given, and hands every change to save from start on', () => {
    const { store, saved } = setup({
      initial: { view: 'dag' },
    });

    assert.strictEqual(Optional.unwrap(store.view.getSnapshot()), 'dag');

    store.choose('list');

    // Nothing is handed over before it starts.
    assert.deepStrictEqual(saved, []);

    const stopStore = store.start();

    store.choose('dag');

    assert.deepStrictEqual(saved, [{ view: 'list' }, { view: 'dag' }]);

    stopStore();

    store.choose('list');

    assert.strictEqual(saved.length, 2);
  });

  test('builds the graph from the issues, and passes it on only when it changed', () => {
    const { store, setIssues, setEntries } = setup();

    const mut_graphs: unknown[] = [];

    store.graph.subscribe((graph) => {
      mut_graphs.push(graph);
    });

    setIssues({
      items: [issueItem(1, []), issueItem(2, [1])],
      totalCount: 2,
      endCursor: undefined,
      referenced: [],
    });

    assert.deepStrictEqual(Optional.unwrap(store.graph.getSnapshot()).edges, [
      { from: 1, to: 2, kind: 'start-after' },
    ]);

    assert.strictEqual(
      Optional.unwrap(store.layout.getSnapshot()).nodes.length,
      2,
    );

    const drawn = mut_graphs.length;

    // A poll that changed the pull requests and nothing the graph reads.
    setEntries([]);

    assert.strictEqual(mut_graphs.length, drawn);
  });

  test('in either view, reads every page of the open issues, one page at a time', () => {
    const { store, setIssues, setMoreIssues, loadMoreCalls } = setup();

    store.start();

    assert.strictEqual(loadMoreCalls(), 0);

    setIssues(issueList('page-1'));

    assert.strictEqual(loadMoreCalls(), 1);

    setMoreIssues({ type: 'loading' });

    assert.strictEqual(loadMoreCalls(), 1);

    setIssues(issueList('page-2'));

    setMoreIssues({ type: 'idle' });

    assert.strictEqual(loadMoreCalls(), 2);

    store.choose('dag');

    setMoreIssues({ type: 'loading' });

    setIssues(issueList('page-3'));

    setMoreIssues({ type: 'idle' });

    assert.strictEqual(loadMoreCalls(), 3);

    setIssues(issueList(undefined));

    assert.strictEqual(loadMoreCalls(), 3);
  });

  test('reads no further on its own after a page failed, or once stopped', () => {
    const { store, setIssues, setMoreIssues, loadMoreCalls } = setup();

    const stopStore = store.start();

    setMoreIssues({ type: 'failed', message: 'HTTP 502' });

    setIssues(issueList('page-1'));

    assert.strictEqual(loadMoreCalls(), 0);

    stopStore();

    setMoreIssues({ type: 'idle' });

    assert.strictEqual(loadMoreCalls(), 0);
  });

  test('never draws what is done, and keeps what closed unfinished', () => {
    const { store, setIssues } = setup();

    setIssues({
      items: [issueItem(5, [3, 4])],
      totalCount: 1,
      endCursor: undefined,
      referenced: [referencedIssue(3, 'done'), referencedIssue(4, 'abandoned')],
    });

    assert.deepStrictEqual(
      Optional.unwrap(store.graph.getSnapshot()).nodes.map(
        ({ number }) => number,
      ),
      [4, 5],
    );

    assert.deepStrictEqual(
      Optional.unwrap(store.layout.getSnapshot()).nodes.map(
        ({ number }) => number,
      ),
      [4, 5],
    );

    // The wait on what is done is over, and is not drawn either.
    assert.deepStrictEqual(Optional.unwrap(store.graph.getSnapshot()).edges, [
      { from: 4, to: 5, kind: 'start-after' },
    ]);
  });

  test('hiding hold keeps a held issue only for what waits on it, and counts it either way', () => {
    const { store, setIssues, setFilter } = setup();

    setIssues({
      items: [
        { ...issueItem(5, [3]), labels: [priorityLabel('hold')] },
        issueItem(6, [5]),
      ],
      totalCount: 2,
      endCursor: undefined,
      referenced: [referencedIssue(3, 'abandoned')],
    });

    assert.deepStrictEqual(
      Optional.unwrap(store.counts.getSnapshot()).priorities.hold,
      {
        shown: 1,
        total: 1,
      },
    );

    setFilter({ ...DEFAULT_ISSUE_FILTER, hiddenPriorities: ['hold'] });

    // #5 stays because #6 waits on it, without #3, which only #5 waits on.
    assert.deepStrictEqual(
      Optional.unwrap(store.layout.getSnapshot()).nodes.map(
        ({ number }) => number,
      ),
      [5, 6],
    );

    // Switched off, hold reads what switching it on would draw.
    assert.deepStrictEqual(Optional.unwrap(store.counts.getSnapshot()), {
      open: { shown: 1, total: 2 },
      priorities: {
        S: { shown: 0, total: 0 },
        A: { shown: 0, total: 0 },
        B: { shown: 0, total: 0 },
        C: { shown: 0, total: 0 },
        D: { shown: 0, total: 0 },
        hold: { shown: 1, total: 1 },
        close: { shown: 0, total: 0 },
        none: { shown: 1, total: 1 },
      },
      inProgress: { shown: 0, total: 0 },
    });

    setFilter(DEFAULT_ISSUE_FILTER);

    assert.deepStrictEqual(
      Optional.unwrap(store.graph.getSnapshot()).nodes.map(
        ({ number }) => number,
      ),
      [3, 5, 6],
    );
  });

  test('draws the priorities the list shows, and counts the open issues it draws of each', () => {
    const { store, setIssues, setFilter } = setup();

    setIssues({
      items: [
        { ...issueItem(1, [9]), labels: [priorityLabel('S')] },
        { ...issueItem(2, [1]), labels: [priorityLabel('D')] },
        { ...issueItem(3, []), labels: [priorityLabel('D')] },
        issueItem(4, []),
      ],
      totalCount: 4,
      endCursor: undefined,
      referenced: [referencedIssue(9, 'waiting')],
    });

    assert.deepStrictEqual(Optional.unwrap(store.counts.getSnapshot()), {
      open: { shown: 4, total: 4 },
      priorities: {
        S: { shown: 1, total: 1 },
        A: { shown: 0, total: 0 },
        B: { shown: 0, total: 0 },
        C: { shown: 0, total: 0 },
        D: { shown: 2, total: 2 },
        hold: { shown: 0, total: 0 },
        close: { shown: 0, total: 0 },
        none: { shown: 1, total: 1 },
      },
      inProgress: { shown: 0, total: 0 },
    });

    setFilter({ ...DEFAULT_ISSUE_FILTER, onlyPriorities: ['D'] });

    // #1 stays, alone, since #2 waits on it; #9, which only #1 waits on,
    // goes with it.
    assert.deepStrictEqual(
      Optional.unwrap(store.graph.getSnapshot()).nodes.map(
        ({ number }) => number,
      ),
      [1, 2, 3],
    );

    // What an issue drawn waits on stays, though nobody read its priority.
    setFilter({ ...DEFAULT_ISSUE_FILTER, hiddenPriorities: ['D'] });

    assert.deepStrictEqual(
      Optional.unwrap(store.graph.getSnapshot()).nodes.map(
        ({ number }) => number,
      ),
      [1, 4, 9],
    );

    // A tier switched off counts what switching it on would draw.
    assert.deepStrictEqual(Optional.unwrap(store.counts.getSnapshot()), {
      open: { shown: 2, total: 4 },
      priorities: {
        S: { shown: 1, total: 1 },
        A: { shown: 0, total: 0 },
        B: { shown: 0, total: 0 },
        C: { shown: 0, total: 0 },
        D: { shown: 2, total: 2 },
        hold: { shown: 0, total: 0 },
        close: { shown: 0, total: 0 },
        none: { shown: 1, total: 1 },
      },
      inProgress: { shown: 0, total: 0 },
    });
  });

  test('keeps what a hidden held issue waits on only for that issue', () => {
    const { store, setIssues, setFilter } = setup();

    setIssues({
      items: [
        { ...issueItem(1, []), labels: [priorityLabel('D')] },
        { ...issueItem(2, [1]), labels: [priorityLabel('hold')] },
      ],
      totalCount: 2,
      endCursor: undefined,
      referenced: [],
    });

    setFilter({ ...DEFAULT_ISSUE_FILTER, hiddenPriorities: ['D'] });

    assert.deepStrictEqual(
      Optional.unwrap(store.graph.getSnapshot()).nodes.map(
        ({ number }) => number,
      ),
      [1, 2],
    );

    setFilter({ ...DEFAULT_ISSUE_FILTER, hiddenPriorities: ['D', 'hold'] });

    assert.deepStrictEqual(
      Optional.unwrap(store.graph.getSnapshot()).nodes,
      [],
    );
  });

  test('draws the DAG at its natural size until told otherwise, and steps a zoom in and out', () => {
    const { store } = setup();

    assert.strictEqual(Optional.unwrap(store.dagScale.getSnapshot()), 1);

    assert.isFalse(Optional.unwrap(store.dagFitted.getSnapshot()));

    store.zoomIn();

    assert.strictEqual(Optional.unwrap(store.dagScale.getSnapshot()), 1.1);

    store.zoomOut();

    store.zoomOut();

    assert.strictEqual(Optional.unwrap(store.dagScale.getSnapshot()), 0.9);

    store.resetZoom();

    assert.strictEqual(Optional.unwrap(store.dagScale.getSnapshot()), 1);
  });

  test('starts at the zoom it is given, and hands every change to save as it starts', () => {
    const { store, savedZoom } = setup({ initialZoom: { type: 'fit' } });

    assert.isTrue(Optional.unwrap(store.dagFitted.getSnapshot()));

    const stopStore = store.start();

    // What it started at is written back, as the theme is.
    assert.deepStrictEqual(savedZoom, [{ type: 'fit' }]);

    // From the fit of a box not measured yet, which is the natural size.
    store.zoomIn();

    store.resetZoom();

    assert.deepStrictEqual(savedZoom, [
      { type: 'fit' },
      { type: 'scale', scale: 1.1 },
      { type: 'scale', scale: 1 },
    ]);

    stopStore();

    store.zoomIn();

    assert.strictEqual(savedZoom.length, 3);
  });

  test('a scale it is given is drawn as it is', () => {
    const { store } = setup({ initialZoom: { type: 'scale', scale: 1.5 } });

    assert.strictEqual(Optional.unwrap(store.dagScale.getSnapshot()), 1.5);

    store.zoomIn();

    assert.strictEqual(Optional.unwrap(store.dagScale.getSnapshot()), 1.75);
  });

  test('the fit puts the whole graph in the box, and follows the box and the graph until a zoom', () => {
    const { store, setIssues } = setup();

    setIssues({
      items: [issueItem(1, []), issueItem(2, [1]), issueItem(3, [2])],
      totalCount: 3,
      endCursor: undefined,
      referenced: [],
    });

    const { width, height } = Optional.unwrap(store.layout.getSnapshot());

    store.setDagBox({ width: width / 2, height: height * 4 });

    store.fitDag();

    assert.isTrue(Optional.unwrap(store.dagFitted.getSnapshot()));

    assert.strictEqual(Optional.unwrap(store.dagScale.getSnapshot()), 0.5);

    store.setDagBox({ width: width / 4, height: height * 4 });

    assert.strictEqual(Optional.unwrap(store.dagScale.getSnapshot()), 0.25);

    // One more column makes the graph wider, and the fit smaller.
    setIssues({
      items: [
        issueItem(1, []),
        issueItem(2, [1]),
        issueItem(3, [2]),
        issueItem(4, [3]),
      ],
      totalCount: 4,
      endCursor: undefined,
      referenced: [],
    });

    assert.isBelow(Optional.unwrap(store.dagScale.getSnapshot()), 0.25);

    // A zoom starts from the fit, and leaves it.
    store.zoomIn();

    assert.isFalse(Optional.unwrap(store.dagFitted.getSnapshot()));

    assert.strictEqual(Optional.unwrap(store.dagScale.getSnapshot()), 0.25);

    store.setDagBox({ width: width * 4, height: height * 4 });

    assert.strictEqual(Optional.unwrap(store.dagScale.getSnapshot()), 0.25);

    store.fitDag();

    assert.strictEqual(Optional.unwrap(store.dagScale.getSnapshot()), 1);

    store.resetZoom();

    assert.isFalse(Optional.unwrap(store.dagFitted.getSnapshot()));
  });

  test('the fit arranges what has no edge for the box, a zoom keeps that arrangement, and 100% puts the default back', () => {
    const { store, setIssues } = setup();

    setIssues({
      items: [
        issueItem(1, []),
        issueItem(2, [1]),
        ...Array.from({ length: 12 }, (_, index) => issueItem(index + 3, [])),
      ],
      totalCount: 14,
      endCursor: undefined,
      referenced: [],
    });

    const natural = Optional.unwrap(store.layout.getSnapshot());

    // Wide and short: twelve under the pair, three to a row, would be small.
    store.setDagBox({ width: natural.width * 3, height: natural.height / 3 });

    store.fitDag();

    const fitted = Optional.unwrap(store.layout.getSnapshot());

    assert.notDeepEqual(fitted.nodes, natural.nodes);

    // The default arrangement would be held to a third by the box's height.
    assert.isAbove(Optional.unwrap(store.dagScale.getSnapshot()), 0.34);

    store.zoomIn();

    assert.deepStrictEqual(Optional.unwrap(store.layout.getSnapshot()), fitted);

    store.resetZoom();

    assert.deepStrictEqual(
      Optional.unwrap(store.layout.getSnapshot()),
      natural,
    );
  });

  test('a scale it is given draws what has no edge where it goes by default, whatever the box', () => {
    const issues = {
      items: [
        issueItem(1, []),
        issueItem(2, [1]),
        ...Array.from({ length: 12 }, (_, index) => issueItem(index + 3, [])),
      ],
      totalCount: 14,
      endCursor: undefined,
      referenced: [],
    } as const;

    const atNatural = setup();

    atNatural.setIssues(issues);

    const natural = Optional.unwrap(atNatural.store.layout.getSnapshot());

    const { store, setIssues } = setup({
      initialZoom: { type: 'scale', scale: 0.5 },
    });

    setIssues(issues);

    // A box the fit arranges them differently for.
    const box = {
      width: natural.width * 3,
      height: natural.height / 3,
    } as const;

    const fitted = setup({ initialZoom: { type: 'fit' } });

    fitted.setIssues(issues);

    fitted.store.setDagBox(box);

    assert.notDeepEqual(
      Optional.unwrap(fitted.store.layout.getSnapshot()),
      natural,
    );

    store.setDagBox(box);

    assert.deepStrictEqual(
      Optional.unwrap(store.layout.getSnapshot()),
      natural,
    );

    assert.strictEqual(Optional.unwrap(store.dagScale.getSnapshot()), 0.5);
  });
});

const setup = (
  options: Readonly<{
    initial?: IssuesViewSettings;
    initialZoom?: DagZoom;
  }> = {},
): Readonly<{
  store: ReturnType<typeof createIssuesViewStore>;
  saved: readonly IssuesViewSettings[];
  savedZoom: readonly DagZoom[];
  setIssues: (next: LoadedReport['issues']) => void;
  setEntries: (next: readonly Entry[]) => void;
  setFilter: (next: IssueFilter) => void;
  setMoreIssues: (next: MoreIssuesStatus) => void;
  loadMoreCalls: () => number;
}> => {
  const mut_saved: IssuesViewSettings[] = [];

  const mut_savedZoom: DagZoom[] = [];

  const mut_loadMore = { calls: 0 };

  const [issues, setIssues] = createState<LoadedReport['issues']>({
    items: [],
    totalCount: 0,
    endCursor: undefined,
    referenced: [],
  });

  const [entries, setEntries] = createState<readonly Entry[]>([]);

  const [filter, setFilter] = createState<IssueFilter>(DEFAULT_ISSUE_FILTER);

  const [moreIssues, setMoreIssues] = createState<MoreIssuesStatus>({
    type: 'idle',
  });

  const store = createIssuesViewStore({
    issues,
    graph: createIssueGraph({
      issues,
      entries,
      repoUrl: 'https://github.com/o/r',
    }),
    filter,
    initial: options.initial ?? DEFAULT_ISSUES_VIEW_SETTINGS,
    save: (settings) => {
      mut_saved.push(settings);
    },
    initialZoom: options.initialZoom ?? NATURAL_ZOOM,
    saveZoom: (zoom) => {
      mut_savedZoom.push(zoom);
    },
    moreIssues,
    loadMoreIssues: () => {
      mut_loadMore.calls += 1;
    },
  });

  return {
    store,
    saved: mut_saved,
    savedZoom: mut_savedZoom,
    setIssues,
    setEntries,
    setFilter,
    setMoreIssues,
    loadMoreCalls: () => mut_loadMore.calls,
  };
};

const issueItem = (
  number: number,
  startAfter: readonly number[],
): LoadedReport['issues']['items'][number] =>
  ({
    number,
    title: `Issue ${number}`,
    author: 'someone',
    url: `https://github.com/o/r/issues/${number}`,
    labels: [],
    createdAt: '2026-09-20T00:00:00Z',
    updatedAt: '2026-09-23T00:00:00Z',
    comments: 0,
    startAfter,
    misplacedMergeAfter: [],
  }) as const;

/** One listed issue, and a page after it when `endCursor` says so. */
const issueList = (endCursor: string | undefined): LoadedReport['issues'] =>
  ({
    items: [issueItem(1, [])],
    totalCount: endCursor === undefined ? (1 as const) : (2 as const),
    endCursor,
    referenced: [],
  }) as const;

const referencedIssue = (
  number: number,
  itemStatus: LoadedReport['issues']['referenced'][number]['status'],
): LoadedReport['issues']['referenced'][number] =>
  ({
    number,
    kind: 'issue',
    title: `Issue ${number}`,
    url: `https://github.com/o/r/issues/${number}`,
    status: itemStatus,
  }) as const;

const priorityLabel = (priority: 'S' | 'B' | 'D' | 'hold') =>
  ({
    name: `priority:${priority}`,
    color: 'ededed',
    description: '',
  }) as const;
