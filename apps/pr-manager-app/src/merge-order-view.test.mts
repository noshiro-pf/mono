import { summarize, type Label, type TreeNode } from 'pr-report-core';
import type { Entry } from './load-report.mjs';
import {
  arrangeForest,
  arrangeMergeOrder,
  countPriorities,
  DEFAULT_MERGE_ORDER_VIEW,
  isShown,
  parseMergeOrderView,
  priorityOf,
  STATUS_FILTERS,
  statusesOf,
  togglePriority,
  toggleStatus,
  withSort,
  type MergeOrderView,
} from './merge-order-view.mjs';

describe(arrangeForest, () => {
  test('with everything shown and nothing ranked, gives the merge order back as it was', () => {
    assert.deepStrictEqual(
      arrangeForest(DIAMOND, { shown: () => true, rank: () => 0 }),
      DIAMOND,
    );
  });

  test('a hidden pull request gives its place to the shown ones below it', () => {
    // 1 → 2 → 3, and 2 hidden: 3 is drawn straight under 1.
    assert.deepStrictEqual(
      arrangeForest([node(1, [node(2, [node(3)])])], {
        shown: (n) => n !== 2,
        rank: () => 0,
      }),
      [node(1, [node(3)])],
    );
  });

  test('a hidden root lifts what is below it to the top level, in number order among the other roots', () => {
    assert.deepStrictEqual(
      arrangeForest([node(1, [node(4)]), node(3)], {
        shown: (n) => n !== 1,
        rank: () => 0,
      }),
      [node(3), node(4)],
    );
  });

  test('a repeated pull request is expanded where it is first drawn after the hidden ones are gone', () => {
    // 1 and 2 both before 3; 3 is expanded under 1. With 1 hidden, 3 is
    // lifted to the top level after 2, so it is expanded under 2 instead.
    assert.deepStrictEqual(
      arrangeForest(DIAMOND, { shown: (n) => n !== 1, rank: () => 0 }),
      [node(2, [node(3, [node(5)])]), node(3, [], true)],
    );
  });

  test('a hidden pull request is not left behind as a "shown above" line', () => {
    assert.deepStrictEqual(
      arrangeForest(DIAMOND, { shown: (n) => n !== 3, rank: () => 0 }),
      [node(1, [node(5)]), node(2, [node(5, [], true)])],
    );
  });

  test('siblings are sorted by the best rank anywhere below them, and by number among equals', () => {
    // 2 is low itself but holds up 4, which is high; 3 is mid.
    assert.deepStrictEqual(
      arrangeForest([node(1), node(2, [node(4)]), node(3)], {
        shown: () => true,
        rank: (n) => (n === 4 ? 0 : n === 3 ? 1 : 3),
      }),
      [node(2, [node(4)]), node(3), node(1)],
    );
  });

  test('a hidden pull request lends no rank to what holds it up', () => {
    assert.deepStrictEqual(
      arrangeForest([node(1), node(2, [node(4)])], {
        shown: (n) => n !== 4,
        rank: (n) => (n === 4 ? 0 : 3),
      }),
      [node(1), node(2)],
    );
  });

  test('sorting moves the expanded copy to whichever is drawn first', () => {
    // 3 waits for 1 and 2, and is expanded under 1 in number order; with 2
    // ranked first it is expanded under 2 instead.
    assert.deepStrictEqual(
      arrangeForest(DIAMOND, {
        shown: () => true,
        rank: (n) => (n === 2 ? 0 : 1),
      }),
      [node(2, [node(3, [node(5)])]), node(1, [node(3, [], true)])],
    );
  });
});

describe(statusesOf, () => {
  test('names every status the summary counts the pull request under', () => {
    const entries = [
      entry(1, { labels: [label('merge-queued')] }),
      entry(2, { isDraft: true }),
      entry(3, { verdict: 'failing', behindBy: 2 }),
      entry(4, { setAside: true }),
      entry(5, { awaitingReview: true }),
      entry(6),
    ] as const;

    const summary = {
      ...summarize(entries),
      setAside: 1,
      awaitingReview: 1,
    } as const;

    assert.deepStrictEqual(
      STATUS_FILTERS.map(
        (filter) =>
          entries.filter((e) => statusesOf(e).includes(filter)).length,
      ),
      STATUS_FILTERS.map((filter) => summary[filter]),
    );

    assert.deepStrictEqual(entries.map(statusesOf), [
      ['queued'],
      ['draft'],
      ['failing', 'behind'],
      ['setAside'],
      ['awaitingReview'],
      [],
    ]);
  });

  test('a set-aside record against a base that has since moved is not counted', () => {
    assert.deepStrictEqual(
      statusesOf(entry(1, { setAside: true, setAsideCurrent: false })),
      [],
    );
  });
});

describe(priorityOf, () => {
  test('reads the one priority label a pull request carries', () => {
    assert.strictEqual(priorityOf([label('priority:high')]), 'high');

    assert.strictEqual(
      priorityOf([label('skip-ci'), label('priority:mid')]),
      'mid',
    );

    assert.strictEqual(priorityOf([label('priority:low')]), 'low');
  });

  test('none, or more than one, is no priority', () => {
    assert.strictEqual(priorityOf([]), 'none');

    assert.strictEqual(
      priorityOf([label('priority:high'), label('priority:low')]),
      'none',
    );
  });
});

describe(isShown, () => {
  test('everything is shown by default', () => {
    assert.isTrue(
      isShown(
        entry(1, { isDraft: true, labels: [label('priority:low')] }),
        DEFAULT_MERGE_ORDER_VIEW,
      ),
    );
  });

  test('a pull request under any hidden status is hidden, whatever else it is', () => {
    const view = toggleStatus(DEFAULT_MERGE_ORDER_VIEW, 'queued');

    assert.isFalse(
      isShown(
        entry(1, { labels: [label('merge-queued')], verdict: 'failing' }),
        view,
      ),
    );

    assert.isTrue(isShown(entry(2, { verdict: 'failing' }), view));

    assert.isTrue(isShown(entry(3), view));
  });

  test('a pull request whose priority is hidden is hidden', () => {
    const view = togglePriority(DEFAULT_MERGE_ORDER_VIEW, 'none');

    assert.isFalse(isShown(entry(1), view));

    assert.isTrue(isShown(entry(2, { labels: [label('priority:mid')] }), view));
  });
});

describe(arrangeMergeOrder, () => {
  test('sorts by priority, with no priority between mid and low', () => {
    const entries = [
      entry(1, { labels: [label('priority:low')] }),
      entry(2),
      entry(3, { labels: [label('priority:mid')] }),
      entry(4, { labels: [label('priority:high')] }),
    ] as const;

    const roots = [node(1), node(2), node(3), node(4)] as const;

    assert.deepStrictEqual(
      arrangeMergeOrder(roots, entries, DEFAULT_MERGE_ORDER_VIEW).map(
        ({ number }) => number,
      ),
      [1, 2, 3, 4],
    );

    assert.deepStrictEqual(
      arrangeMergeOrder(
        roots,
        entries,
        withSort(DEFAULT_MERGE_ORDER_VIEW, 'priority'),
      ).map(({ number }) => number),
      [4, 3, 2, 1],
    );
  });

  test('leaves out what the view hides', () => {
    const entries = [
      entry(1, { labels: [label('merge-queued')] }),
      entry(2),
    ] as const;

    assert.deepStrictEqual(
      arrangeMergeOrder(
        [node(1), node(2)],
        entries,
        toggleStatus(DEFAULT_MERGE_ORDER_VIEW, 'queued'),
      ),
      [node(2)],
    );
  });
});

describe(countPriorities, () => {
  test('counts each priority, none included', () => {
    assert.deepStrictEqual(
      countPriorities([
        entry(1, { labels: [label('priority:high')] }),
        entry(2, { labels: [label('priority:high')] }),
        entry(3),
      ]),
      { high: 2, mid: 0, low: 0, none: 1 },
    );
  });
});

describe(toggleStatus, () => {
  test('hides a shown status and shows a hidden one, keeping the list in its own order', () => {
    const once = toggleStatus(
      toggleStatus(DEFAULT_MERGE_ORDER_VIEW, 'failing'),
      'queued',
    );

    assert.deepStrictEqual(once.hiddenStatuses, ['queued', 'failing']);

    assert.deepStrictEqual(toggleStatus(once, 'queued').hiddenStatuses, [
      'failing',
    ]);
  });
});

describe(parseMergeOrderView, () => {
  test('reads back what was saved', () => {
    const view: MergeOrderView = {
      hiddenStatuses: ['queued', 'draft'],
      hiddenPriorities: ['low'],
      sort: 'priority',
    } as const;

    assert.deepStrictEqual(parseMergeOrderView(view), view);
  });

  test('forgives: nothing, or something else, is the default; an unknown name is dropped', () => {
    assert.deepStrictEqual(
      parseMergeOrderView(undefined),
      DEFAULT_MERGE_ORDER_VIEW,
    );

    assert.deepStrictEqual(parseMergeOrderView('x'), DEFAULT_MERGE_ORDER_VIEW);

    assert.deepStrictEqual(
      parseMergeOrderView({
        hiddenStatuses: ['queued', 'gone', 3, 'queued'],
        hiddenPriorities: 'low',
        sort: 'size',
      }),
      { ...DEFAULT_MERGE_ORDER_VIEW, hiddenStatuses: ['queued'] },
    );
  });
});

const node = (
  number: number,
  children: readonly TreeNode[] = [],
  repeated = false,
): TreeNode => ({ number, repeated, children }) as const;

/** 1 and 2 both before 3, and 3 before 5: 3 is expanded under 1. */
const DIAMOND: readonly TreeNode[] = [
  node(1, [node(3, [node(5)])]),
  node(2, [node(3, [], true)]),
] as const;

const label = (labelName: string): Label =>
  ({
    name: labelName,
    color: 'ededed',
    description: '',
  }) as const;

const entry = (
  number: number,
  {
    labels = [],
    isDraft = false,
    verdict = 'passed',
    behindBy = 0,
    setAside = false,
    setAsideCurrent = true,
    awaitingReview = false,
  }: Readonly<{
    labels?: readonly Label[];
    isDraft?: boolean;
    verdict?: Entry['checks']['verdict'];
    behindBy?: number;
    setAside?: boolean;
    setAsideCurrent?: boolean;
    awaitingReview?: boolean;
  }> = {},
): Entry =>
  ({
    number,
    title: `#${number}`,
    body: '',
    author: 'noshiro-pf',
    isDraft,
    labels,
    autoMerge: false,
    headRef: `branch-${number}`,
    headSha: 'sha',
    baseRef: 'main',
    fromFork: false,
    url: `https://github.com/noshiro-pf/mono/pull/${number}`,
    updatedAt: '2026-10-01T00:00:00Z',
    headCommittedAt: undefined,
    comparison: { aheadBy: 1, behindBy },
    reported: new Map(),
    checksRunning: false,
    linkedIssues: [],
    mergeAfter: [],
    stackedOn: undefined,
    blockedBy: [],
    checks: {
      verdict,
      passed: [],
      failed: [],
      pending: [],
      skipped: [],
      missing: [],
      notRun: [],
      required: 0,
    },
    setAside: setAside
      ? ({
          reason: 'rebase-failed',
          headSha: 'sha',
          baseSha: 'base',
          current: setAsideCurrent,
          retry: false,
          url: `https://github.com/noshiro-pf/mono/pull/${number}#comment`,
        } as const)
      : undefined,
    codeOwnerReview: awaitingReview
      ? ({
          state: 'required',
          paths: [],
          owners: [],
          authorOwns: false,
        } as const)
      : ({ state: 'not-required' } as const),
    claudeSessions: [],
  }) as const;
