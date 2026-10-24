import { summarize, type Label, type TreeNode } from 'pr-report-core';
import type { Entry } from './load-report.mjs';
import {
  arrangeForest,
  arrangeMergeOrder,
  countView,
  DEFAULT_MERGE_ORDER_VIEW,
  isShown,
  parseMergeOrderView,
  STATUS_FILTERS,
  statusesOf,
  statusFiltersOf,
  toggleOnly,
  togglePriority,
  toggleStatus,
  withAvailable,
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
      entry(6, { labels: [label('pending')] }),
      entry(7),
    ] as const;

    const summary = {
      ...summarize(entries),
      setAside: 1,
      awaitingReview: 1,
      pending: 1,
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
      [],
      ['failing'],
      ['setAside'],
      ['awaitingReview'],
      ['pending'],
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

  test('switching pending off hides what carries the label, queued or not', () => {
    const view = toggleStatus(DEFAULT_MERGE_ORDER_VIEW, 'pending');

    assert.isFalse(isShown(entry(1, { labels: [label('pending')] }), view));

    assert.isFalse(
      isShown(
        entry(2, { labels: [label('pending'), label('merge-queued')] }),
        view,
      ),
    );

    assert.isTrue(isShown(entry(3, { labels: [label('merge-queued')] }), view));
  });

  test('a pull request whose priority is hidden is hidden', () => {
    const view = togglePriority(DEFAULT_MERGE_ORDER_VIEW, 'none');

    assert.isFalse(isShown(entry(1), view));

    assert.isTrue(isShown(entry(2, { labels: [label('priority:mid')] }), view));
  });

  test('with some statuses picked, a pull request under any of them is shown, whatever else it is, and one under none is not', () => {
    const view = toggleOnly(
      toggleOnly(DEFAULT_MERGE_ORDER_VIEW, 'failing'),
      'setAside',
    );

    assert.isTrue(
      isShown(
        entry(1, { labels: [label('merge-queued')], verdict: 'failing' }),
        view,
      ),
    );

    assert.isTrue(isShown(entry(2, { setAside: true }), view));

    assert.isFalse(
      isShown(entry(3, { labels: [label('merge-queued')] }), view),
    );

    assert.isFalse(isShown(entry(4), view));
  });

  test('a hidden status still hides what is picked, and the priorities still apply', () => {
    const view = togglePriority(
      toggleStatus(toggleOnly(DEFAULT_MERGE_ORDER_VIEW, 'failing'), 'queued'),
      'low',
    );

    assert.isTrue(isShown(entry(1, { verdict: 'failing' }), view));

    assert.isFalse(
      isShown(
        entry(2, { labels: [label('merge-queued')], verdict: 'failing' }),
        view,
      ),
    );

    assert.isFalse(
      isShown(
        entry(3, { labels: [label('priority:low')], verdict: 'failing' }),
        view,
      ),
    );
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

describe(countView, () => {
  const entries = [
    entry(1, { labels: [label('merge-queued'), label('priority:high')] }),
    entry(2, {
      labels: [label('merge-queued')],
      verdict: 'failing',
    }),
    entry(3, { verdict: 'failing', labels: [label('priority:low')] }),
    entry(4, { behindBy: 2, labels: [label('priority:high')] }),
    entry(5),
  ] as const;

  test('with everything shown, each count is its total', () => {
    const counts = countView(entries, DEFAULT_MERGE_ORDER_VIEW);

    assert.deepStrictEqual(counts.open, { shown: 5, total: 5 });

    assert.deepStrictEqual(counts.statuses, {
      queued: { shown: 2, total: 2 },
      failing: { shown: 2, total: 2 },
      setAside: { shown: 0, total: 0 },
      awaitingReview: { shown: 0, total: 0 },
      pending: { shown: 0, total: 0 },
    });

    assert.deepStrictEqual(counts.priorities, {
      high: { shown: 2, total: 2 },
      mid: { shown: 0, total: 0 },
      low: { shown: 1, total: 1 },
      none: { shown: 2, total: 2 },
    });
  });

  test('a switched-on count is how many of the list are under it', () => {
    const view = toggleOnly(DEFAULT_MERGE_ORDER_VIEW, 'failing');

    const counts = countView(entries, view);

    const listed = entries.filter((each) => isShown(each, view));

    assert.deepStrictEqual(counts.open, { shown: listed.length, total: 5 });

    assert.deepStrictEqual(
      STATUS_FILTERS.map((filter) => counts.statuses[filter].shown),
      STATUS_FILTERS.map(
        (filter) =>
          listed.filter((each) => statusesOf(each).includes(filter)).length,
      ),
    );

    assert.deepStrictEqual(counts.statuses.queued, { shown: 1, total: 2 });

    assert.deepStrictEqual(counts.priorities, {
      high: { shown: 0, total: 2 },
      mid: { shown: 0, total: 0 },
      low: { shown: 1, total: 1 },
      none: { shown: 1, total: 2 },
    });
  });

  test('a switched-off count is how many switching it back on would show', () => {
    const view = togglePriority(
      toggleStatus(DEFAULT_MERGE_ORDER_VIEW, 'queued'),
      'low',
    );

    const counts = countView(entries, view);

    assert.deepStrictEqual(counts.open, { shown: 2, total: 5 });

    // #1 and #2; neither has the hidden priority.
    assert.deepStrictEqual(counts.statuses.queued, { shown: 2, total: 2 });

    // #3 is low, and #2 is queued.
    assert.deepStrictEqual(counts.statuses.failing, { shown: 0, total: 2 });

    // #3; switching low back on still leaves the queued ones hidden.
    assert.deepStrictEqual(counts.priorities.low, { shown: 1, total: 1 });

    // #4; #1 is queued.
    assert.deepStrictEqual(counts.priorities.high, { shown: 1, total: 2 });
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

describe(toggleOnly, () => {
  test('picks and unpicks, keeping the list in its own order', () => {
    const picked = toggleOnly(
      toggleOnly(DEFAULT_MERGE_ORDER_VIEW, 'failing'),
      'queued',
    );

    assert.deepStrictEqual(picked.onlyStatuses, ['queued', 'failing']);

    assert.deepStrictEqual(toggleOnly(picked, 'queued').onlyStatuses, [
      'failing',
    ]);
  });

  test('picking a hidden status shows it, and hiding a picked one unpicks it', () => {
    const picked = toggleOnly(
      toggleStatus(DEFAULT_MERGE_ORDER_VIEW, 'failing'),
      'failing',
    );

    assert.deepStrictEqual(picked.hiddenStatuses, []);

    assert.deepStrictEqual(picked.onlyStatuses, ['failing']);

    const hidden = toggleStatus(picked, 'failing');

    assert.deepStrictEqual(hidden.hiddenStatuses, ['failing']);

    assert.deepStrictEqual(hidden.onlyStatuses, []);
  });
});

describe(statusFiltersOf, () => {
  test('is every status where the queue is run', () => {
    assert.deepStrictEqual(
      statusFiltersOf({ queue: true, ruleset: true }),
      STATUS_FILTERS,
    );
  });

  // Nothing is queued or set aside without `unblock-prs`, and a count that
  // is always nought is a switch that does nothing.
  test('leaves out the queue’s own statuses where it is not', () => {
    assert.deepStrictEqual(statusFiltersOf({ queue: false, ruleset: true }), [
      'failing',
      'awaitingReview',
      'pending',
    ]);
  });

  test('leaves out the wait for a code owner where no ruleset asks for one', () => {
    assert.deepStrictEqual(statusFiltersOf({ queue: false, ruleset: false }), [
      'failing',
      'pending',
    ]);
  });
});

describe(withAvailable, () => {
  // The choice is kept across visits, and across repositories: `only
  // queued`, chosen on one that runs the queue, would otherwise leave
  // nothing on one that does not, with no switch on screen to undo it.
  test('drops what it hides or picks of the statuses not on offer', () => {
    const view: MergeOrderView = {
      ...DEFAULT_MERGE_ORDER_VIEW,
      hiddenStatuses: ['setAside', 'pending'],
      onlyStatuses: ['queued', 'failing'],
    } as const;

    assert.deepStrictEqual(
      withAvailable(view, ['failing', 'awaitingReview', 'pending']),
      {
        ...view,
        hiddenStatuses: ['pending'],
        onlyStatuses: ['failing'],
      },
    );

    assert.strictEqual(withAvailable(view, STATUS_FILTERS), view);
  });
});

describe(parseMergeOrderView, () => {
  test('reads back what was saved', () => {
    const view: MergeOrderView = {
      hiddenStatuses: ['queued', 'setAside'],
      onlyStatuses: ['failing'],
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
        onlyStatuses: 'failing',
        hiddenPriorities: 'low',
        sort: 'size',
      }),
      { ...DEFAULT_MERGE_ORDER_VIEW, hiddenStatuses: ['queued'] },
    );

    // Saved before anything could be picked.
    assert.deepStrictEqual(
      parseMergeOrderView({
        hiddenStatuses: ['setAside'],
        hiddenPriorities: [],
        sort: 'order',
      }),
      { ...DEFAULT_MERGE_ORDER_VIEW, hiddenStatuses: ['setAside'] },
    );

    // Saved while behind base was a status: it is dropped, and what is
    // behind is shown.
    assert.deepStrictEqual(
      parseMergeOrderView({
        hiddenStatuses: ['queued', 'behind'],
        onlyStatuses: ['behind'],
        hiddenPriorities: [],
        sort: 'order',
      }),
      { ...DEFAULT_MERGE_ORDER_VIEW, hiddenStatuses: ['queued'] },
    );

    // Saved while a draft was a status: it is dropped, and drafts are shown.
    assert.deepStrictEqual(
      parseMergeOrderView({
        hiddenStatuses: ['queued', 'draft'],
        onlyStatuses: ['draft'],
        hiddenPriorities: [],
        sort: 'order',
      }),
      { ...DEFAULT_MERGE_ORDER_VIEW, hiddenStatuses: ['queued'] },
    );

    // Saved while the counts had a mode switch: the mode is dropped.
    assert.deepStrictEqual(
      parseMergeOrderView({
        statusMode: 'only',
        hiddenStatuses: [],
        onlyStatuses: ['failing'],
        hiddenPriorities: [],
        sort: 'order',
      }),
      { ...DEFAULT_MERGE_ORDER_VIEW, onlyStatuses: ['failing'] },
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
    inheritedMergeAfter: [],
    notStartedIssues: [],
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
    reading: [],
  }) as const;
