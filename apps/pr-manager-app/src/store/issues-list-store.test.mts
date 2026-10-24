import { createState } from 'synstate';
import type { IssueGraph } from '../issue-graph.mjs';
import {
  DEFAULT_ISSUES_LIST_VIEW,
  type IssuesListView,
} from '../issues-list-view.mjs';
import type { IssueItem, LoadedReport } from '../load-report.mjs';
import { createIssuesListStore } from './issues-list-store.mjs';

describe(createIssuesListStore, () => {
  test('starts with everything shown, then takes what was saved, and saves nothing before it has read', async () => {
    const { store, saved, resolveLoad } = setup();

    store.start();

    assert.deepStrictEqual(
      store.view.getSnapshot().value,
      DEFAULT_ISSUES_LIST_VIEW,
    );

    assert.deepStrictEqual(saved, []);

    resolveLoad(STORED);

    await settle();

    assert.deepStrictEqual(store.view.getSnapshot().value, STORED);

    store.toggleLabel('enhancement');

    assert.deepStrictEqual(saved.at(-1), {
      ...STORED,
      onlyLabels: ['bug', 'enhancement'],
    });
  });

  test('a choice made before the saved one is read is kept, and saved', async () => {
    const { store, saved, resolveLoad } = setup();

    store.start();

    store.setSort('priority');

    resolveLoad(STORED);

    await settle();

    assert.deepStrictEqual(store.view.getSnapshot().value, {
      ...DEFAULT_ISSUES_LIST_VIEW,
      sort: 'priority',
    });

    assert.deepStrictEqual(saved.at(-1), {
      ...DEFAULT_ISSUES_LIST_VIEW,
      sort: 'priority',
    });
  });

  test('a database that cannot be read leaves the default, and changes are still handed to save', async () => {
    const { store, saved, rejectLoad } = setup();

    store.start();

    rejectLoad();

    await settle();

    assert.deepStrictEqual(
      store.view.getSnapshot().value,
      DEFAULT_ISSUES_LIST_VIEW,
    );

    store.togglePriority('low');

    assert.deepStrictEqual(saved.at(-1), {
      ...DEFAULT_ISSUES_LIST_VIEW,
      hiddenPriorities: ['low'],
    });
  });

  test('stopped before the read answers, it neither applies nor saves', async () => {
    const { store, saved, resolveLoad } = setup();

    const stopStore = store.start();

    stopStore();

    resolveLoad(STORED);

    await settle();

    assert.deepStrictEqual(
      store.view.getSnapshot().value,
      DEFAULT_ISSUES_LIST_VIEW,
    );

    assert.deepStrictEqual(saved, []);
  });

  test('derives the list and the counts from the issues and the view', () => {
    const { store, setIssues } = setup();

    setIssues([
      issue(1, ['bug']),
      issue(2, ['priority:high']),
      issue(3, ['bug', 'priority:low']),
    ]);

    assert.deepStrictEqual(numbersShown(store), [1, 2, 3]);

    store.setSort('priority');

    assert.deepStrictEqual(numbersShown(store), [2, 1, 3]);

    store.toggleLabel('bug');

    assert.deepStrictEqual(numbersShown(store), [1, 3]);

    store.togglePriority('low');

    assert.deepStrictEqual(numbersShown(store), [1]);

    assert.deepStrictEqual(store.counts.getSnapshot().value.open, {
      shown: 1,
      total: 3,
    });

    assert.deepStrictEqual(store.counts.getSnapshot().value.labels, [
      {
        name: 'bug',
        color: 'ededed',
        picked: true,
        count: { shown: 1, total: 2 },
      },
    ]);
  });

  test('the search narrows the list and the counts, and is not saved', async () => {
    const { store, saved, setIssues, resolveLoad } = setup();

    store.start();

    resolveLoad(undefined);

    await settle();

    setIssues([issue(1, []), issue(2, []), issue(12, [])]);

    store.setQuery('ISSUE 1');

    assert.strictEqual(store.query.getSnapshot().value, 'ISSUE 1');

    assert.deepStrictEqual(numbersShown(store), [1, 12]);

    assert.deepStrictEqual(store.counts.getSnapshot().value.open, {
      shown: 2,
      total: 3,
    });

    assert.deepStrictEqual(saved, [DEFAULT_ISSUES_LIST_VIEW]);

    store.setQuery('');

    assert.deepStrictEqual(numbersShown(store), [1, 2, 12]);
  });
});

const STORED: IssuesListView = {
  hiddenPriorities: ['none'],
  hiddenStarts: [],
  onlyLabels: ['bug'],
  hidePending: false,
  sort: 'priority',
} as const;

const setup = (): Readonly<{
  store: ReturnType<typeof createIssuesListStore>;
  saved: readonly IssuesListView[];
  resolveLoad: (stored: unknown) => void;
  rejectLoad: () => void;
  setIssues: (items: readonly IssueItem[]) => void;
}> => {
  const mut_saved: IssuesListView[] = [];

  const { promise, resolve, reject } = Promise.withResolvers<unknown>();

  const [issues, setIssues] = createState<LoadedReport['issues']>({
    items: [],
    totalCount: 0,
    endCursor: undefined,
    referenced: [],
  });

  const [graph] = createState<IssueGraph>({ nodes: [], edges: [] });

  const store = createIssuesListStore({
    issues,
    graph,
    load: () => promise,
    save: (view) => {
      mut_saved.push(view);
    },
  });

  return {
    store,
    saved: mut_saved,
    resolveLoad: resolve,
    rejectLoad: () => {
      reject(new Error('blocked'));
    },
    setIssues: (items) => {
      setIssues({
        items,
        totalCount: items.length,
        endCursor: undefined,
        referenced: [],
      });
    },
  };
};

const numbersShown = (
  store: ReturnType<typeof createIssuesListStore>,
): readonly number[] =>
  store.items.getSnapshot().value.map(({ number }) => number);

const issue = (number: number, labelNames: readonly string[]): IssueItem =>
  ({
    number,
    title: `Issue ${number}`,
    author: 'someone',
    url: `https://github.com/o/r/issues/${number}`,
    labels: labelNames.map((labelName) => ({
      name: labelName,
      color: 'ededed',
      description: '',
    })),
    createdAt: '2026-09-20T00:00:00Z',
    updatedAt: '2026-09-23T00:00:00Z',
    comments: 0,
    startAfter: [],
    misplacedMergeAfter: [],
  }) as const;

const settle = async (): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};
