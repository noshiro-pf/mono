import { createState } from 'synstate';
import { DEFAULT_ISSUE_FILTER } from '../issue-filter.mjs';
import type { IssueGraph } from '../issue-graph.mjs';
import {
  DEFAULT_ISSUES_LIST_VIEW,
  type IssuesListView,
} from '../issues-list-view.mjs';
import type { IssueItem, LoadedReport } from '../load-report.mjs';
import { createIssuesListStore } from './issues-list-store.mjs';

describe(createIssuesListStore, () => {
  test('starts at the view it is given, and hands every change to save from start on', () => {
    const { store, saved } = setup(STORED);

    assert.deepStrictEqual(store.view.getSnapshot().value, STORED);

    store.setSort('updated');

    // Nothing is handed over before it starts.
    assert.deepStrictEqual(saved, []);

    const stopStore = store.start();

    store.toggleLabel('enhancement');

    assert.deepStrictEqual(saved, [
      { ...STORED, sort: 'updated' },
      { ...STORED, sort: 'updated', onlyLabels: ['bug', 'enhancement'] },
    ]);

    stopStore();

    store.togglePriority('low');

    assert.strictEqual(saved.length, 2);
  });

  test('passes on the priorities and pending alone, and only when they changed', () => {
    const { store } = setup();

    const mut_filters: unknown[] = [];

    store.filter.subscribe((filter) => {
      mut_filters.push(filter);
    });

    store.setSort('priority');

    store.toggleLabel('bug');

    store.toggleStart('blocked');

    assert.deepStrictEqual(mut_filters, [DEFAULT_ISSUE_FILTER]);

    store.togglePriorityOnly('high');

    store.togglePendingOnly();

    assert.deepStrictEqual(mut_filters, [
      DEFAULT_ISSUE_FILTER,
      { ...DEFAULT_ISSUE_FILTER, onlyPriorities: ['high'] },
      { ...DEFAULT_ISSUE_FILTER, onlyPriorities: ['high'], onlyPending: true },
    ]);
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

  test('the search narrows the list and the counts, and is not saved', () => {
    const { store, saved, setIssues } = setup();

    store.start();

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
  onlyPriorities: [],
  hiddenStarts: [],
  onlyLabels: ['bug'],
  hidePending: false,
  onlyPending: false,
  hideInProgress: false,
  onlyInProgress: false,
  sort: 'priority',
} as const;

const setup = (
  initial: IssuesListView = DEFAULT_ISSUES_LIST_VIEW,
): Readonly<{
  store: ReturnType<typeof createIssuesListStore>;
  saved: readonly IssuesListView[];
  setIssues: (items: readonly IssueItem[]) => void;
}> => {
  const mut_saved: IssuesListView[] = [];

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
    initial,
    save: (view) => {
      mut_saved.push(view);
    },
  });

  return {
    store,
    saved: mut_saved,
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
