import type { ContextState, TreeNode } from 'pr-report-core';
import { createState } from 'synstate';
import type { Entry } from '../load-report.mjs';
import {
  DEFAULT_MERGE_ORDER_VIEW,
  type MergeOrderView,
} from '../merge-order-view.mjs';
import { createMergeOrderStore } from './merge-order-store.mjs';

describe(createMergeOrderStore, () => {
  test('starts at the view it is given, and hands every change to save from start on', () => {
    const { store, saved } = setup(STORED);

    assert.deepStrictEqual(store.view.getSnapshot().value, STORED);

    store.toggleStatus('queued');

    // Nothing is handed over before it starts.
    assert.deepStrictEqual(saved, []);

    const stopStore = store.start();

    store.toggleStatus('setAside');

    assert.deepStrictEqual(saved, [
      { ...STORED, hiddenStatuses: ['setAside'] },
      DEFAULT_MERGE_ORDER_VIEW,
    ]);

    stopStore();

    store.togglePriority('low');

    assert.strictEqual(saved.length, 2);
  });

  test('derives the tree and the counts from the report and the view', () => {
    const { store, setEntries } = setup();

    setEntries([entry(1, ['merge-queued']), entry(2, ['priority:high'])]);

    assert.deepStrictEqual(
      store.roots.getSnapshot().value.map(({ number }) => number),
      [1, 2],
    );

    assert.deepStrictEqual(store.counts.getSnapshot().value.open, {
      shown: 2,
      total: 2,
    });

    assert.deepStrictEqual(store.counts.getSnapshot().value.priorities, {
      high: { shown: 1, total: 1 },
      mid: { shown: 0, total: 0 },
      low: { shown: 0, total: 0 },
      none: { shown: 1, total: 1 },
    });

    store.toggleStatus('queued');

    assert.deepStrictEqual(
      store.roots.getSnapshot().value.map(({ number }) => number),
      [2],
    );

    assert.deepStrictEqual(store.counts.getSnapshot().value.open, {
      shown: 1,
      total: 2,
    });

    assert.deepStrictEqual(store.counts.getSnapshot().value.priorities.none, {
      shown: 0,
      total: 1,
    });

    store.toggleOnly('queued');

    assert.deepStrictEqual(
      store.roots.getSnapshot().value.map(({ number }) => number),
      [1],
    );

    assert.deepStrictEqual(store.counts.getSnapshot().value.open, {
      shown: 1,
      total: 2,
    });

    assert.deepStrictEqual(store.counts.getSnapshot().value.priorities.high, {
      shown: 0,
      total: 1,
    });
  });

  test('ignores what the view says of the queue where there is none, and keeps it', () => {
    const { store, setEntries, setQueue } = setup();

    setEntries([entry(1, ['merge-queued']), entry(2, [])]);

    store.toggleOnly('queued');

    setQueue(false);

    assert.deepStrictEqual(
      store.roots.getSnapshot().value.map(({ number }) => number),
      [1, 2],
    );

    assert.deepStrictEqual(store.view.getSnapshot().value.onlyStatuses, [
      'queued',
    ]);

    setQueue(true);

    assert.deepStrictEqual(
      store.roots.getSnapshot().value.map(({ number }) => number),
      [1],
    );
  });
});

const STORED: MergeOrderView = {
  hiddenStatuses: ['queued', 'setAside'],
  onlyStatuses: [],
  hiddenPriorities: [],
  sort: 'order',
} as const;

const setup = (
  initial: MergeOrderView = DEFAULT_MERGE_ORDER_VIEW,
): Readonly<{
  store: ReturnType<typeof createMergeOrderStore>;
  saved: readonly MergeOrderView[];
  setEntries: (entries: readonly Entry[]) => void;
  setQueue: (queue: boolean) => void;
}> => {
  const mut_saved: MergeOrderView[] = [];

  const [entries$, setEntries] = createState<readonly Entry[]>([]);

  const [roots, setRoots] = createState<readonly TreeNode[]>([]);

  const [features, setFeatures] = createState({
    requiredChecks: true,
    codeOwnerReview: true,
    queue: true,
  });

  const store = createMergeOrderStore({
    entries: entries$,
    roots,
    features,
    initial,
    save: (view) => {
      mut_saved.push(view);
    },
  });

  return {
    store,
    saved: mut_saved,
    setQueue: (queue) => {
      setFeatures({ requiredChecks: true, codeOwnerReview: true, queue });
    },
    setEntries: (list) => {
      setEntries(list);

      setRoots(
        list.map(({ number }) => ({ number, repeated: false, children: [] })),
      );
    },
  };
};

const entry = (number: number, labels: readonly string[]): Entry =>
  ({
    number,
    title: `#${number}`,
    body: '',
    author: 'noshiro-pf',
    isDraft: false,
    labels: labels.map((labelName) => ({
      name: labelName,
      color: 'ededed',
      description: '',
    })),
    autoMerge: false,
    headRef: `branch-${number}`,
    headSha: 'sha',
    baseRef: 'main',
    fromFork: false,
    url: `https://github.com/noshiro-pf/mono/pull/${number}`,
    updatedAt: '2026-10-01T00:00:00Z',
    headCommittedAt: undefined,
    comparison: undefined,
    reported: new Map<string, ContextState>(),
    checksRunning: false,
    linkedIssues: [],
    mergeAfter: [],
    stackedOn: undefined,
    inheritedMergeAfter: [],
    notStartedIssues: [],
    blockedBy: [],
    checks: {
      verdict: 'passed',
      passed: [],
      failed: [],
      pending: [],
      skipped: [],
      missing: [],
      notRun: [],
      required: 0,
    },
    setAside: undefined,
    codeOwnerReview: { state: 'not-required' },
    claudeSessions: [],
    checksUnread: undefined,
    reading: [],
  }) as const;
