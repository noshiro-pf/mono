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

    assert.deepStrictEqual(saved.at(-1), 'list');
  });

  test('a choice made before the saved value is read is kept, and saved', async () => {
    const { store, saved, resolveLoad } = setup();

    store.start();

    store.choose('dag');

    resolveLoad('list');

    await settle();

    assert.strictEqual(store.view.getSnapshot().value, 'dag');

    assert.deepStrictEqual(saved.at(-1), 'dag');
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

    assert.deepStrictEqual(saved.at(-1), 'dag');
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

  test('in the DAG, reads every page of the open issues, one page at a time', async () => {
    const { store, resolveLoad, setIssues, setMoreIssues, loadMoreCalls } =
      setup();

    store.start();

    resolveLoad('dag');

    await settle();

    assert.strictEqual(loadMoreCalls(), 0);

    setIssues(issueList('page-1'));

    assert.strictEqual(loadMoreCalls(), 1);

    setMoreIssues({ type: 'loading' });

    assert.strictEqual(loadMoreCalls(), 1);

    setIssues(issueList('page-2'));

    setMoreIssues({ type: 'idle' });

    assert.strictEqual(loadMoreCalls(), 2);

    setIssues(issueList(undefined));

    assert.strictEqual(loadMoreCalls(), 2);
  });

  test('switched to the DAG with pages left, starts reading them', () => {
    const { store, setIssues, loadMoreCalls } = setup();

    store.start();

    setIssues(issueList('page-1'));

    assert.strictEqual(loadMoreCalls(), 0);

    store.choose('dag');

    assert.strictEqual(loadMoreCalls(), 1);
  });

  test('reads no further on its own after a page failed, or once stopped', () => {
    const { store, setIssues, setMoreIssues, loadMoreCalls } = setup();

    const stopStore = store.start();

    store.choose('dag');

    setMoreIssues({ type: 'failed', message: 'HTTP 502' });

    setIssues(issueList('page-1'));

    assert.strictEqual(loadMoreCalls(), 0);

    stopStore();

    setMoreIssues({ type: 'idle' });

    assert.strictEqual(loadMoreCalls(), 0);
  });

  test('stopped before the read answers, it neither applies nor saves', async () => {
    const { store, saved, resolveLoad } = setup();

    const stopStore = store.start();

    stopStore();

    resolveLoad('dag');

    await settle();

    assert.strictEqual(store.view.getSnapshot().value, 'list');

    assert.deepStrictEqual(saved, []);
  });
});

const setup = (): Readonly<{
  store: ReturnType<typeof createIssuesViewStore>;
  saved: readonly IssuesView[];
  resolveLoad: (stored: unknown) => void;
  rejectLoad: () => void;
  setIssues: (next: LoadedReport['issues']) => void;
  setEntries: (next: readonly Entry[]) => void;
  setMoreIssues: (next: MoreIssuesStatus) => void;
  loadMoreCalls: () => number;
}> => {
  const mut_saved: IssuesView[] = [];

  const mut_loadMore = { calls: 0 };

  const { promise, resolve, reject } = Promise.withResolvers<unknown>();

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
    moreIssues,
    loadMoreIssues: () => {
      mut_loadMore.calls += 1;
    },
  });

  return {
    store,
    saved: mut_saved,
    resolveLoad: resolve,
    rejectLoad: () => {
      reject(new Error('blocked'));
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

const settle = async (): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};
