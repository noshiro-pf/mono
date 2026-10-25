import type { TreeNode } from 'pr-report-core';
import { createState } from 'synstate';
import type { Entry } from '../load-report.mjs';
import {
  DEFAULT_MERGE_ORDER_VIEW,
  type MergeOrderView,
} from '../merge-order-view.mjs';
import { createMergeOrderStore } from './merge-order-store.mjs';

describe(createMergeOrderStore, () => {
  test('starts with everything shown, then takes what was saved, and saves nothing before it has read', async () => {
    const { store, saved, resolveLoad } = setup();

    store.start();

    assert.deepStrictEqual(
      store.view.getSnapshot().value,
      DEFAULT_MERGE_ORDER_VIEW,
    );

    assert.deepStrictEqual(saved, []);

    resolveLoad(STORED);

    await settle();

    assert.deepStrictEqual(store.view.getSnapshot().value, STORED);

    store.toggleStatus('setAside');

    assert.deepStrictEqual(saved.at(-1), {
      ...STORED,
      hiddenStatuses: ['queued'],
    });
  });

  test('a choice made before the saved one is read is kept, and saved', async () => {
    const { store, saved, resolveLoad } = setup();

    store.start();

    store.setSort('priority');

    resolveLoad(STORED);

    await settle();

    assert.deepStrictEqual(store.view.getSnapshot().value, {
      ...DEFAULT_MERGE_ORDER_VIEW,
      sort: 'priority',
    });

    assert.deepStrictEqual(saved.at(-1), {
      ...DEFAULT_MERGE_ORDER_VIEW,
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
      DEFAULT_MERGE_ORDER_VIEW,
    );

    store.togglePriority('low');

    assert.deepStrictEqual(saved.at(-1), {
      ...DEFAULT_MERGE_ORDER_VIEW,
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
      DEFAULT_MERGE_ORDER_VIEW,
    );

    assert.deepStrictEqual(saved, []);
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

const setup = (): Readonly<{
  store: ReturnType<typeof createMergeOrderStore>;
  saved: readonly MergeOrderView[];
  resolveLoad: (stored: unknown) => void;
  rejectLoad: () => void;
  setEntries: (entries: readonly Entry[]) => void;
  setQueue: (queue: boolean) => void;
}> => {
  const mut_saved: MergeOrderView[] = [];

  const { promise, resolve, reject } = Promise.withResolvers<unknown>();

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

const settle = async (): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
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
    reported: new Map(),
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
    reading: [],
  }) as const;
