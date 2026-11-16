import { searchOf } from '../url/index.mjs';
import type { IssueRow } from './issue-row.mjs';
import {
  DEFAULT_ISSUES,
  isListed,
  issueChipCounts,
  issuesCodec,
  issueTileCounts,
  labelColorsOf,
  labelPicksOf,
  passesTiers,
  sortIssues,
  toggleAuthorOnlyHidden,
  toggleAuthorOnlyOnly,
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

  test('drops author-only as a label, which has a switch of its own', () => {
    const params = new URLSearchParams(
      'issues.label=Author-Only&issues.label=bug&issues.onlyAuthorOnly=1',
    );

    assert.deepStrictEqual(issuesCodec.read(params), {
      ...DEFAULT_ISSUES,
      onlyAuthorOnly: true,
      labels: ['bug'],
    });

    issuesCodec.write(issuesCodec.read(params), params);

    assert.strictEqual(
      searchOf(params),
      '?issues.onlyAuthorOnly=1&issues.label=bug',
    );

    // Switched off and picked is switched off.
    assert.isFalse(
      issuesCodec.read(
        new URLSearchParams('issues.onlyAuthorOnly=1&issues.hideAuthorOnly=1'),
      ).onlyAuthorOnly,
    );
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

describe('author only', () => {
  const authorOnly = [
    { name: 'author-only', color: '', description: '' },
  ] as const;

  test('picked, shows only what carries the label, read with the tiers', () => {
    const s = toggleAuthorOnlyOnly({ ...DEFAULT_ISSUES, onlyPriority: ['A'] });

    assert.isTrue(passesTiers(row(1, { tier: 'A', labels: authorOnly }), s));

    assert.isFalse(passesTiers(row(2, { tier: 'A' }), s));

    assert.isFalse(passesTiers(row(3, { tier: 'B', labels: authorOnly }), s));
  });

  test('switched off, hides it, and its tile counts what showing it would add', () => {
    const s = toggleAuthorOnlyHidden(DEFAULT_ISSUES);

    const rows = [
      row(1, { tier: 'A', labels: authorOnly }),
      row(2, { tier: 'A' }),
      row(3, { tier: 'C', labels: authorOnly }),
    ] as const;

    assert.deepStrictEqual(
      rows.filter((r) => passesTiers(r, s)).map(({ number }) => number),
      [2],
    );

    const counts = issueTileCounts(rows, s, passesTiers);

    assert.deepStrictEqual(counts.authorOnly, { count: 2, hidden: true });

    assert.deepStrictEqual(counts.open, { shown: 1, total: 3 });
  });

  test('picking it switches it back on, and switching it off unpicks it', () => {
    const picked = toggleAuthorOnlyOnly(toggleAuthorOnlyHidden(DEFAULT_ISSUES));

    assert.isFalse(picked.hideAuthorOnly);

    assert.isTrue(picked.onlyAuthorOnly);

    const hidden = toggleAuthorOnlyHidden(picked);

    assert.isTrue(hidden.hideAuthorOnly);

    assert.isFalse(hidden.onlyAuthorOnly);
  });
});

describe(labelPicksOf, () => {
  test('lists every label but the tiers and author-only, in name order', () => {
    assert.deepStrictEqual(
      labelPicksOf([
        row(1, { labels: labelled('priority:A', 'bug', 'Author-Only') }),
        row(2, { labels: labelled('docs', 'bug', 'priority:hold') }),
      ]),
      ['bug', 'docs'],
    );
  });
});

describe(labelColorsOf, () => {
  test('gives each label the colour of the first issue carrying it', () => {
    const colors = labelColorsOf([
      row(1, { labels: [{ name: 'bug', color: 'd73a4a', description: '' }] }),
      row(2, { labels: [{ name: 'bug', color: '000000', description: '' }] }),
    ]);

    assert.strictEqual(colors.get('bug'), 'd73a4a');

    assert.isUndefined(colors.get('docs'));
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

describe(issueChipCounts, () => {
  test('counts each start state as switching it on would show it', () => {
    const rows = [
      row(1, { start: 'free' }),
      row(2, { start: 'free' }),
      row(3, { start: 'blocked' }),
      row(4, { start: 'blocked', tier: 'D' }),
    ] as const;

    const counts = issueChipCounts(
      rows,
      { ...DEFAULT_ISSUES, hideStart: ['blocked'], hidePriority: ['D'] },
      '',
    );

    assert.deepStrictEqual(counts.starts.free, { count: 2, hidden: false });

    // Off, it counts what switching it on would add; the tier filter holds.
    assert.deepStrictEqual(counts.starts.blocked, { count: 1, hidden: true });

    assert.deepStrictEqual(counts.starts.cycle, { count: 0, hidden: false });
  });

  test('counts each label as picking it would show it', () => {
    const rows = [
      row(1, { labels: labelled('bug') }),
      row(2, { labels: labelled('bug', 'docs') }),
      row(3, { labels: labelled('docs'), title: 'other' }),
    ] as const;

    const counts = issueChipCounts(
      rows,
      { ...DEFAULT_ISSUES, labels: ['bug'] },
      '#',
    );

    assert.deepStrictEqual(counts.labels.get('bug'), {
      count: 2,
      hidden: false,
    });

    // Not picked while another is: what picking it would add, the search held.
    assert.deepStrictEqual(counts.labels.get('docs'), {
      count: 1,
      hidden: true,
    });
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

const labelled = (...names: readonly string[]): IssueRow['labels'] =>
  names.map((name) => ({ name, color: '', description: '' }));

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
