import { createState } from 'synstate';
import type { Entry, LoadedReport } from '../load-report.mjs';
import {
  createIssuesViewStore,
  type IssuesView,
} from './issues-view-store.mjs';
import type { MoreIssuesStatus } from './reader.mjs';

describe(createIssuesViewStore, () => {
  test('starts as the list, then takes what was saved, and saves nothing before it has read', async () => {
    const { store, saved, resolveLoad } = setup();

    store.start();

    assert.strictEqual(store.view.getSnapshot().value, 'list');

    assert.deepStrictEqual(saved, []);

    resolveLoad('dag');

    await settle();

    assert.strictEqual(store.view.getSnapshot().value, 'dag');

    store.choose('list');

    assert.strictEqual(store.view.getSnapshot().value, 'list');

    assert.strictEqual(saved.at(-1), 'list');
  });

  test('a choice made before the saved value is read is kept, and saved', async () => {
    const { store, saved, resolveLoad } = setup();

    store.start();

    store.choose('dag');

    resolveLoad('list');

    await settle();

    assert.strictEqual(store.view.getSnapshot().value, 'dag');

    assert.strictEqual(saved.at(-1), 'dag');
  });

  test('anything saved but a view it knows leaves the list', async () => {
    const { store, resolveLoad } = setup();

    store.start();

    resolveLoad('graph');

    await settle();

    assert.strictEqual(store.view.getSnapshot().value, 'list');
  });

  test('a database that cannot be read leaves the list, and changes are still handed to save', async () => {
    const { store, saved, rejectLoad } = setup();

    store.start();

    rejectLoad();

    await settle();

    assert.strictEqual(store.view.getSnapshot().value, 'list');

    store.choose('dag');

    assert.strictEqual(saved.at(-1), 'dag');
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

    assert.deepStrictEqual(store.graph.getSnapshot().value.edges, [
      { from: 1, to: 2, kind: 'start-after', settled: false },
    ]);

    assert.strictEqual(store.layout.getSnapshot().value.nodes.length, 2);

    const drawn = mut_graphs.length;

    // A poll that changed the pull requests and nothing the graph reads.
    setEntries([]);

    assert.strictEqual(mut_graphs.length, drawn);
  });

  test('in either view, reads every page of the open issues, one page at a time', async () => {
    const { store, resolveLoad, setIssues, setMoreIssues, loadMoreCalls } =
      setup();

    store.start();

    assert.strictEqual(loadMoreCalls(), 0);

    setIssues(issueList('page-1'));

    assert.strictEqual(loadMoreCalls(), 1);

    setMoreIssues({ type: 'loading' });

    assert.strictEqual(loadMoreCalls(), 1);

    setIssues(issueList('page-2'));

    setMoreIssues({ type: 'idle' });

    assert.strictEqual(loadMoreCalls(), 2);

    resolveLoad('dag');

    await settle();

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

  test('shows what is done until told to hide it, and takes the saved choice once read', async () => {
    const { store, savedHideDone, resolveLoadHideDone } = setup();

    store.start();

    assert.isFalse(store.hideDone.getSnapshot().value);

    assert.deepStrictEqual(savedHideDone, []);

    resolveLoadHideDone(true);

    await settle();

    assert.isTrue(store.hideDone.getSnapshot().value);

    store.toggleHideDone();

    assert.isFalse(store.hideDone.getSnapshot().value);

    assert.strictEqual(savedHideDone.at(-1), false);
  });

  test('a toggle made before the saved choice is read is kept, and saved', async () => {
    const { store, savedHideDone, resolveLoadHideDone } = setup();

    store.start();

    store.toggleHideDone();

    resolveLoadHideDone(false);

    await settle();

    assert.isTrue(store.hideDone.getSnapshot().value);

    assert.strictEqual(savedHideDone.at(-1), true);
  });

  test('anything saved but true, or nothing readable, shows what is done', async () => {
    const { store, rejectLoadHideDone } = setup();

    store.start();

    rejectLoadHideDone();

    await settle();

    assert.isFalse(store.hideDone.getSnapshot().value);

    const other = setup();

    other.store.start();

    other.resolveLoadHideDone('yes');

    await settle();

    assert.isFalse(other.store.hideDone.getSnapshot().value);
  });

  test('hiding what is done takes it out of the graph and its layout, and counts it either way', () => {
    const { store, setIssues } = setup();

    setIssues({
      items: [issueItem(5, [3, 4])],
      totalCount: 1,
      endCursor: undefined,
      referenced: [referencedIssue(3, 'done'), referencedIssue(4, 'abandoned')],
    });

    assert.deepStrictEqual(
      store.graph.getSnapshot().value.nodes.map(({ number }) => number),
      [3, 4, 5],
    );

    assert.strictEqual(store.doneCount.getSnapshot().value, 1);

    store.toggleHideDone();

    assert.deepStrictEqual(
      store.graph.getSnapshot().value.nodes.map(({ number }) => number),
      [4, 5],
    );

    assert.deepStrictEqual(
      store.layout.getSnapshot().value.nodes.map(({ number }) => number),
      [4, 5],
    );

    assert.strictEqual(store.doneCount.getSnapshot().value, 1);

    store.toggleHideDone();

    assert.strictEqual(store.graph.getSnapshot().value.nodes.length, 3);
  });

  test('draws the DAG at its natural size until told otherwise, and steps a zoom in and out', () => {
    const { store } = setup();

    assert.strictEqual(store.dagScale.getSnapshot().value, 1);

    assert.isFalse(store.dagFitted.getSnapshot().value);

    store.zoomIn();

    assert.strictEqual(store.dagScale.getSnapshot().value, 1.1);

    store.zoomOut();

    store.zoomOut();

    assert.strictEqual(store.dagScale.getSnapshot().value, 0.9);

    store.resetZoom();

    assert.strictEqual(store.dagScale.getSnapshot().value, 1);
  });

  test('the fit puts the whole graph in the box, and follows the box and the graph until a zoom', () => {
    const { store, setIssues } = setup();

    setIssues({
      items: [issueItem(1, []), issueItem(2, [1]), issueItem(3, [2])],
      totalCount: 3,
      endCursor: undefined,
      referenced: [],
    });

    const { width, height } = store.layout.getSnapshot().value;

    store.setDagBox({ width: width / 2, height: height * 4 });

    store.fitDag();

    assert.isTrue(store.dagFitted.getSnapshot().value);

    assert.strictEqual(store.dagScale.getSnapshot().value, 0.5);

    store.setDagBox({ width: width / 4, height: height * 4 });

    assert.strictEqual(store.dagScale.getSnapshot().value, 0.25);

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

    assert.isBelow(store.dagScale.getSnapshot().value, 0.25);

    // A zoom starts from the fit, and leaves it.
    store.zoomIn();

    assert.isFalse(store.dagFitted.getSnapshot().value);

    assert.strictEqual(store.dagScale.getSnapshot().value, 0.25);

    store.setDagBox({ width: width * 4, height: height * 4 });

    assert.strictEqual(store.dagScale.getSnapshot().value, 0.25);

    store.fitDag();

    assert.strictEqual(store.dagScale.getSnapshot().value, 1);

    store.resetZoom();

    assert.isFalse(store.dagFitted.getSnapshot().value);
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

    const natural = store.layout.getSnapshot().value;

    // Wide and short: twelve under the pair, three to a row, would be small.
    store.setDagBox({ width: natural.width * 3, height: natural.height / 3 });

    store.fitDag();

    const fitted = store.layout.getSnapshot().value;

    assert.notDeepEqual(fitted.nodes, natural.nodes);

    // The default arrangement would be held to a third by the box's height.
    assert.isAbove(store.dagScale.getSnapshot().value, 0.34);

    store.zoomIn();

    assert.deepStrictEqual(store.layout.getSnapshot().value, fitted);

    store.resetZoom();

    assert.deepStrictEqual(store.layout.getSnapshot().value, natural);
  });

  test('stopped before the read answers, it neither applies nor saves', async () => {
    const { store, saved, savedHideDone, resolveLoad, resolveLoadHideDone } =
      setup();

    const stopStore = store.start();

    stopStore();

    resolveLoad('dag');

    resolveLoadHideDone(true);

    await settle();

    assert.strictEqual(store.view.getSnapshot().value, 'list');

    assert.isFalse(store.hideDone.getSnapshot().value);

    assert.deepStrictEqual(saved, []);

    assert.deepStrictEqual(savedHideDone, []);
  });
});

const setup = (): Readonly<{
  store: ReturnType<typeof createIssuesViewStore>;
  saved: readonly IssuesView[];
  savedHideDone: readonly boolean[];
  resolveLoad: (stored: unknown) => void;
  rejectLoad: () => void;
  resolveLoadHideDone: (stored: unknown) => void;
  rejectLoadHideDone: () => void;
  setIssues: (next: LoadedReport['issues']) => void;
  setEntries: (next: readonly Entry[]) => void;
  setMoreIssues: (next: MoreIssuesStatus) => void;
  loadMoreCalls: () => number;
}> => {
  const mut_saved: IssuesView[] = [];

  const mut_loadMore = { calls: 0 };

  const mut_savedHideDone: boolean[] = [];

  const { promise, resolve, reject } = Promise.withResolvers<unknown>();

  const hideDoneRead = Promise.withResolvers<unknown>();

  const [issues, setIssues] = createState<LoadedReport['issues']>({
    items: [],
    totalCount: 0,
    endCursor: undefined,
    referenced: [],
  });

  const [entries, setEntries] = createState<readonly Entry[]>([]);

  const [moreIssues, setMoreIssues] = createState<MoreIssuesStatus>({
    type: 'idle',
  });

  const store = createIssuesViewStore({
    issues,
    entries,
    repoUrl: 'https://github.com/o/r',
    load: () => promise,
    save: (view) => {
      mut_saved.push(view);
    },
    loadHideDone: () => hideDoneRead.promise,
    saveHideDone: (hide) => {
      mut_savedHideDone.push(hide);
    },
    moreIssues,
    loadMoreIssues: () => {
      mut_loadMore.calls += 1;
    },
  });

  return {
    store,
    saved: mut_saved,
    savedHideDone: mut_savedHideDone,
    resolveLoad: resolve,
    rejectLoad: () => {
      reject(new Error('blocked'));
    },
    resolveLoadHideDone: hideDoneRead.resolve,
    rejectLoadHideDone: () => {
      hideDoneRead.reject(new Error('blocked'));
    },
    setIssues,
    setEntries,
    setMoreIssues,
    loadMoreCalls: () => mut_loadMore.calls,
  };
};

/** One listed issue, and a page after it when `endCursor` says so. */
const issueList = (endCursor: string | undefined): LoadedReport['issues'] =>
  ({
    items: [issueItem(1, [])],
    totalCount: endCursor === undefined ? (1 as const) : (2 as const),
    endCursor,
    referenced: [],
  }) as const;

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

const settle = async (): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};
