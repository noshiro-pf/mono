import type { ForestNode } from 'pr-report-core-v2';
import { Arr } from 'ts-data-forge';
import { searchOf } from '../url/index.mjs';
import type { MergeOrderCard } from './card.mjs';
import {
  availableStatuses,
  DEFAULT_MERGE_ORDER,
  MERGE_ORDER_STATUSES,
  mergeOrderCodec,
  shownTree,
  tileCounts,
  toggleHidden,
  toggleOnly,
  togglePriority,
  withAvailable,
  type MergeOrderSettings,
} from './view.mjs';

describe('mergeOrderCodec', () => {
  test('reads v1’s spelling and writes it back', () => {
    const search =
      '?prs.hide=queued.setAside&prs.only=failing&prs.hidePriority=low.none&prs.hideDrafts=1&prs.sort=priority';

    const settings = mergeOrderCodec.read(new URLSearchParams(search));

    assert.deepStrictEqual(settings, {
      hide: ['queued', 'setAside'],
      only: 'failing',
      hidePriority: ['low', 'none'],
      hideDrafts: true,
      sort: 'priority',
    });

    const params = new URLSearchParams();

    mergeOrderCodec.write(settings, params);

    assert.strictEqual(searchOf(params), search);
  });

  test('never has a status both hidden and picked', () => {
    const settings = mergeOrderCodec.read(
      new URLSearchParams('?prs.hide=failing&prs.only=failing'),
    );

    assert.deepStrictEqual(settings.hide, []);

    assert.strictEqual(settings.only, 'failing');
  });

  test('writes the default as nothing', () => {
    const params = new URLSearchParams();

    mergeOrderCodec.write(DEFAULT_MERGE_ORDER, params);

    assert.strictEqual(searchOf(params), '');
  });

  test('reads the status picked first as written', () => {
    assert.strictEqual(
      mergeOrderCodec.read(new URLSearchParams('?prs.only=pending.failing'))
        .only,
      'pending',
    );
  });
});

describe(availableStatuses, () => {
  test('offers the queue tiles on a queue repository only, and code owners when asked for', () => {
    assert.deepStrictEqual(availableStatuses(false, false), [
      'failing',
      'pending',
    ]);

    assert.deepStrictEqual(availableStatuses(true, true), MERGE_ORDER_STATUSES);
  });
});

describe(withAvailable, () => {
  test('ignores, without forgetting, what is hidden or picked of a tile not offered', () => {
    assert.deepStrictEqual(
      withAvailable(
        {
          ...DEFAULT_MERGE_ORDER,
          hide: ['queued', 'failing'],
          only: 'setAside',
        },
        ['failing', 'pending'],
      ),
      { ...DEFAULT_MERGE_ORDER, hide: ['failing'], only: undefined },
    );
  });
});

describe(tileCounts, () => {
  test('counts what is shown, and for a hidden status what showing would add', () => {
    const cards = [
      card(1, { queued: true }),
      card(2, { queued: true, isDraft: true }),
      card(3),
    ] as const;

    const counts = tileCounts(cards, {
      ...DEFAULT_MERGE_ORDER,
      hide: ['queued'],
      hideDrafts: true,
    });

    assert.deepStrictEqual(counts.open, { shown: 1, total: 3 });

    // #2 is a draft, still hidden once queued ones show.
    assert.deepStrictEqual(counts.statuses.queued, { count: 1, hidden: true });

    // #2 is queued, still hidden once drafts show.
    assert.deepStrictEqual(counts.drafts, { count: 0, hidden: true });
  });
});

describe(shownTree, () => {
  const numbers = (nodes: ReturnType<typeof shownTree>): readonly unknown[] =>
    nodes.map((n) =>
      Arr.isEmpty(n.children)
        ? n.card.number
        : [n.card.number, numbers(n.children)],
    );

  test('gives a hidden pull request’s place to what is below it', () => {
    const settings: MergeOrderSettings = {
      ...DEFAULT_MERGE_ORDER,
      hideDrafts: true,
    } as const;

    const tree = shownTree(
      [node(1, [node(2, [node(3)])])],
      cardsOf([card(1), card(2, { isDraft: true }), card(3)]),
      settings,
    );

    assert.deepStrictEqual(numbers(tree), [[1, [3]]]);
  });

  test('orders siblings by the best priority in their subtree', () => {
    const tree = shownTree(
      [node(1), node(2, [node(4)]), node(3)],
      cardsOf([
        card(1, { priority: 'low' }),
        card(2),
        card(3, { priority: 'mid' }),
        card(4, { priority: 'high' }),
      ]),
      { ...DEFAULT_MERGE_ORDER, sort: 'priority' },
    );

    assert.deepStrictEqual(numbers(tree), [[2, [4]], 3, 1]);
  });

  test('keeps the merge order of siblings of one priority', () => {
    const tree = shownTree(
      [node(120), node(95)],
      cardsOf([
        card(120, { priority: 'high' }),
        card(95, { priority: 'high' }),
      ]),
      { ...DEFAULT_MERGE_ORDER, sort: 'priority' },
    );

    assert.deepStrictEqual(numbers(tree), [120, 95]);
  });

  const lines = (nodes: ReturnType<typeof shownTree>): readonly unknown[] =>
    nodes.map((n) =>
      n.repeated
        ? `${n.card.number} shown above`
        : Arr.isEmpty(n.children)
          ? n.card.number
          : [n.card.number, lines(n.children)],
    );

  test('draws in full where a sort brings a pull request first', () => {
    // #10 waits on #3 (low) and #7 (high); the forest drew it in full under #3.
    const tree = shownTree(
      [node(3, [node(10, [node(11)])]), node(7, [repeated(10)])],
      cardsOf([
        card(3, { priority: 'low' }),
        card(7, { priority: 'high' }),
        card(10),
        card(11),
      ]),
      { ...DEFAULT_MERGE_ORDER, sort: 'priority' },
    );

    assert.deepStrictEqual(lines(tree), [
      [7, [[10, [11]]]],
      [3, ['10 shown above']],
    ]);
  });

  test('draws a pull request once among siblings its hidden parents leave', () => {
    const tree = shownTree(
      [node(1, [node(9)]), node(2, [repeated(9)]), node(3, [repeated(9)])],
      cardsOf([
        card(1, { isDraft: true }),
        card(2, { isDraft: true }),
        card(3, { isDraft: true }),
        card(9),
      ]),
      { ...DEFAULT_MERGE_ORDER, hideDrafts: true },
    );

    assert.deepStrictEqual(lines(tree), [9]);
  });
});

const card = (
  number: number,
  fields: Partial<MergeOrderCard> = {},
): MergeOrderCard =>
  ({
    number,
    title: `#${number}`,
    url: '',
    author: 'someone',
    isDraft: false,
    priority: 'none',
    checks: {
      kind: 'counts',
      verdict: 'passed',
      failed: [],
      pending: [],
      skipped: [],
      passed: [],
      noneRequired: false,
    },
    autoMerge: false,
    codeOwner: undefined,
    setAside: undefined,
    claim: undefined,
    paused: false,
    queued: false,
    pending: false,
    sessions: [],
    closingIssues: [],
    headRef: `feature/${number}`,
    baseRef: 'main',
    stackedOn: undefined,
    comparison: undefined,
    mergeAfter: [],
    inherited: [],
    notStartedIssues: [],
    pushedAtMs: undefined,
    updatedAtMs: 0,
    labels: [],
    ...fields,
  }) as const;

const node = (
  number: number,
  children: readonly ForestNode[] = [],
): ForestNode => ({ number, repeated: false, children }) as const;

const repeated = (number: number): ForestNode =>
  ({ number, repeated: true, children: [] }) as const;

const cardsOf = (
  list: readonly MergeOrderCard[],
): ReadonlyMap<number, MergeOrderCard> =>
  new Map<number, MergeOrderCard>(list.map((c) => [c.number, c]));

describe(toggleHidden, () => {
  test('unpicks a status it hides', () => {
    assert.deepStrictEqual(
      toggleHidden({ ...DEFAULT_MERGE_ORDER, only: 'failing' }, 'failing'),
      { ...DEFAULT_MERGE_ORDER, hide: ['failing'], only: undefined },
    );
  });
});

describe(toggleOnly, () => {
  test('shows a status it picks, and unpicks it on a second click', () => {
    const picked = toggleOnly(
      { ...DEFAULT_MERGE_ORDER, hide: ['failing', 'pending'] },
      'failing',
    );

    assert.deepStrictEqual(picked, {
      ...DEFAULT_MERGE_ORDER,
      hide: ['pending'],
      only: 'failing',
    });

    assert.strictEqual(toggleOnly(picked, 'failing').only, undefined);
  });
});

describe(togglePriority, () => {
  test('hides and shows a priority', () => {
    assert.deepStrictEqual(
      togglePriority(togglePriority(DEFAULT_MERGE_ORDER, 'low'), 'low'),
      DEFAULT_MERGE_ORDER,
    );
  });
});
