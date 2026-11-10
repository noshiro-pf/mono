import { searchOf } from '../url/index.mjs';
import type { IssueRow } from './issue-row.mjs';
import {
  DEFAULT_ISSUES,
  isListed,
  issuesCodec,
  issueTileCounts,
  passesTiers,
  sortIssues,
  toggleTierHidden,
  toggleTierOnly,
} from './issues-view.mjs';

describe('issuesCodec', () => {
  test('reads v1’s spelling, the older pending switches as hold', () => {
    const params = new URLSearchParams(
      'issues=dag&issues.hidePriority=D.close&issues.onlyPending=1&issues.label=bug&issues.label=bug&issues.sort=start',
    );

    assert.deepStrictEqual(issuesCodec.read(params), {
      ...DEFAULT_ISSUES,
      view: 'dag',
      hidePriority: ['D', 'close'],
      onlyPriority: ['hold'],
      labels: ['bug'],
      sort: 'start',
    });
  });

  test('writes only what differs, and drops the older keys', () => {
    const params = new URLSearchParams('issues.hidePending=1');

    issuesCodec.write({ ...DEFAULT_ISSUES, onlyInProgress: true }, params);

    assert.strictEqual(searchOf(params), '?issues.onlyInProgress=1');
  });
});

describe(passesTiers, () => {
  test('shows either of two tiers picked, and both of a tier and in progress', () => {
    const s = { ...DEFAULT_ISSUES, onlyPriority: ['S', 'A'] } as const;

    assert.isTrue(passesTiers(row(1, { tier: 'A' }), s));

    assert.isFalse(passesTiers(row(2, { tier: 'B' }), s));

    assert.isFalse(
      passesTiers(row(3, { tier: 'S' }), { ...s, onlyInProgress: true }),
    );

    assert.isTrue(
      passesTiers(row(4, { tier: 'S', start: 'in-progress' }), {
        ...s,
        onlyInProgress: true,
      }),
    );
  });
});

describe(isListed, () => {
  test('keeps an issue in progress whatever start states are off', () => {
    const s = { ...DEFAULT_ISSUES, hideStart: ['free'] } as const;

    assert.isFalse(isListed(row(1), s, ''));

    assert.isTrue(isListed(row(2, { start: 'in-progress' }), s, ''));
  });

  test('searches the title, full-width aside, or the number', () => {
    const r = row(123, { title: 'Fix the DAG zoom' });

    assert.isTrue(isListed(r, DEFAULT_ISSUES, 'ｄａｇ'));

    assert.isTrue(isListed(r, DEFAULT_ISSUES, '#123'));

    assert.isFalse(isListed(r, DEFAULT_ISSUES, '12'));
  });

  test('narrows to the labels picked, any of them', () => {
    const s = { ...DEFAULT_ISSUES, labels: ['bug', 'docs'] } as const;

    assert.isTrue(
      isListed(
        row(1, { labels: [{ name: 'docs', color: '', description: '' }] }),
        s,
        '',
      ),
    );

    assert.isFalse(isListed(row(2), s, ''));
  });
});

describe(issueTileCounts, () => {
  test('counts what picking a tier not picked would add', () => {
    const rows = [
      row(1, { tier: 'S' }),
      row(2, { tier: 'B' }),
      row(3, { tier: 'B' }),
    ] as const;

    const counts = issueTileCounts(
      rows,
      { ...DEFAULT_ISSUES, onlyPriority: ['S'] },
      passesTiers,
    );

    assert.deepStrictEqual(counts.open, { shown: 1, total: 3 });

    assert.deepStrictEqual(counts.tiers.B, { count: 2, hidden: true });

    assert.deepStrictEqual(counts.tiers.S, { count: 1, hidden: false });
  });
});

describe(sortIssues, () => {
  test('puts no tier between C and D, updated within', () => {
    const rows = [
      row(1, { tier: 'D' }),
      row(2, { tier: 'none', updatedAtMs: 1 }),
      row(3, { tier: 'none', updatedAtMs: 2 }),
      row(4, { tier: 'C' }),
    ] as const;

    assert.deepStrictEqual(
      sortIssues(rows, 'priority').map(({ number }) => number),
      [4, 3, 2, 1],
    );
  });
});

describe(toggleTierOnly, () => {
  test('a tier is never both hidden and picked', () => {
    const hidden = toggleTierHidden(DEFAULT_ISSUES, 'S');

    assert.deepStrictEqual(toggleTierOnly(hidden, 'S'), {
      ...DEFAULT_ISSUES,
      onlyPriority: ['S'],
    });

    assert.deepStrictEqual(
      toggleTierHidden(toggleTierOnly(DEFAULT_ISSUES, 'S'), 'S'),
      { ...DEFAULT_ISSUES, hidePriority: ['S'] },
    );
  });
});

const row = (number: number, fields: Partial<IssueRow> = {}): IssueRow =>
  ({
    number,
    title: `#${number}`,
    url: '',
    author: 'a',
    updatedAtMs: 0,
    commentCount: 0,
    labels: [],
    tier: 'none',
    start: 'free',
    waits: [],
    mergeAfterInBody: false,
    claim: undefined,
    unread: undefined,
    ...fields,
  }) as const;
