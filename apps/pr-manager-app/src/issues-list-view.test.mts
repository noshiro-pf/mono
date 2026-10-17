import type { Label } from 'pr-report-core';
import {
  arrangeIssues,
  countIssues,
  DEFAULT_ISSUES_LIST_VIEW,
  isIssueShown,
  matchesIssueTitle,
  parseIssuesListView,
  toggleIssuePriority,
  toggleLabel,
  withIssueSort,
  type IssuesListView,
} from './issues-list-view.mjs';
import type { IssueItem } from './load-report.mjs';

describe(isIssueShown, () => {
  test('everything is shown by default', () => {
    for (const each of ISSUES) {
      assert.isTrue(isIssueShown(each, DEFAULT_ISSUES_LIST_VIEW));
    }
  });

  test('an issue whose priority is hidden is hidden', () => {
    const view = toggleIssuePriority(DEFAULT_ISSUES_LIST_VIEW, 'none');

    assert.isFalse(isIssueShown(issue(1, []), view));

    assert.isFalse(isIssueShown(issue(2, ['bug']), view));

    assert.isTrue(isIssueShown(issue(3, ['priority:low']), view));
  });

  test('with labels picked, an issue is shown when it carries any of them', () => {
    const view = toggleLabel(
      toggleLabel(DEFAULT_ISSUES_LIST_VIEW, 'bug'),
      'enhancement',
    );

    assert.isTrue(isIssueShown(issue(1, ['bug']), view));

    assert.isTrue(isIssueShown(issue(2, ['enhancement', 'docs']), view));

    assert.isFalse(isIssueShown(issue(3, ['docs']), view));

    assert.isFalse(isIssueShown(issue(4, []), view));
  });

  test('a picked label does not show what its priority hides', () => {
    const view = toggleIssuePriority(
      toggleLabel(DEFAULT_ISSUES_LIST_VIEW, 'bug'),
      'low',
    );

    assert.isFalse(isIssueShown(issue(1, ['bug', 'priority:low']), view));

    assert.isTrue(isIssueShown(issue(2, ['bug', 'priority:mid']), view));
  });
});

describe(matchesIssueTitle, () => {
  test('nothing typed, or only spaces, matches every issue', () => {
    assert.isTrue(matchesIssueTitle(titled(1, 'Anything'), ''));

    assert.isTrue(matchesIssueTitle(titled(1, 'Anything'), ' '.repeat(3)));
  });

  test('matches a part of the title, whatever its case', () => {
    const each = titled(1, 'Show the DAG zoom in the toolbar');

    assert.isTrue(matchesIssueTitle(each, 'dag'));

    assert.isTrue(matchesIssueTitle(each, 'ZOOM IN'));

    assert.isTrue(matchesIssueTitle(each, '  toolbar '));

    assert.isFalse(matchesIssueTitle(each, 'zoom out'));
  });

  test('reads the title only, not the number or the labels', () => {
    const each = {
      ...titled(12, 'Fix the header'),
      labels: [label('bug')],
    } as const;

    assert.isFalse(matchesIssueTitle(each, '12'));

    assert.isFalse(matchesIssueTitle(each, 'bug'));
  });
});

describe(arrangeIssues, () => {
  test('by default, the issues as they were read: most recently updated first', () => {
    assert.deepStrictEqual(
      numbersOf(arrangeIssues(ISSUES, DEFAULT_ISSUES_LIST_VIEW)),
      [1, 2, 3, 4, 5, 6],
    );
  });

  test('sorted by priority, high first and no priority between mid and low, the most recently updated first within each', () => {
    assert.deepStrictEqual(
      numbersOf(
        arrangeIssues(
          ISSUES,
          withIssueSort(DEFAULT_ISSUES_LIST_VIEW, 'priority'),
        ),
      ),
      [3, 6, 1, 4, 5, 2],
    );
  });

  test('leaves out what the view hides, in either order', () => {
    const view: IssuesListView = {
      hiddenPriorities: ['none'],
      onlyLabels: ['bug'],
      sort: 'priority',
    } as const;

    assert.deepStrictEqual(numbersOf(arrangeIssues(ISSUES, view)), [6, 2]);
  });

  test('leaves out what the search does not match, with the view as well', () => {
    const items = [
      titled(1, 'Header search'),
      { ...titled(2, 'Search issues'), labels: [label('priority:low')] },
      titled(3, 'Zoom'),
    ] as const;

    assert.deepStrictEqual(
      numbersOf(arrangeIssues(items, DEFAULT_ISSUES_LIST_VIEW, 'SEARCH')),
      [1, 2],
    );

    assert.deepStrictEqual(
      numbersOf(
        arrangeIssues(
          items,
          toggleIssuePriority(DEFAULT_ISSUES_LIST_VIEW, 'low'),
          'search',
        ),
      ),
      [1],
    );
  });
});

describe(countIssues, () => {
  test('a search narrows what each count shows, not its whole', () => {
    const items = [
      titled(1, 'Header search'),
      { ...titled(2, 'Search issues'), labels: [label('bug')] },
      { ...titled(3, 'Zoom'), labels: [label('bug')] },
    ] as const;

    const counts = countIssues(items, DEFAULT_ISSUES_LIST_VIEW, 'search');

    assert.deepStrictEqual(counts.open, { shown: 2, total: 3 });

    assert.deepStrictEqual(counts.priorities.none, { shown: 2, total: 3 });

    assert.deepStrictEqual(counts.labels, [
      {
        name: 'bug',
        color: 'd73a4a',
        picked: false,
        count: { shown: 1, total: 2 },
      },
    ]);
  });

  test('with nothing hidden, every count is its whole', () => {
    const counts = countIssues(ISSUES, DEFAULT_ISSUES_LIST_VIEW);

    assert.deepStrictEqual(counts.open, { shown: 6, total: 6 });

    assert.deepStrictEqual(counts.priorities, {
      high: { shown: 1, total: 1 },
      mid: { shown: 1, total: 1 },
      low: { shown: 1, total: 1 },
      none: { shown: 3, total: 3 },
    });

    assert.deepStrictEqual(counts.labels, [
      {
        name: 'bug',
        color: 'd73a4a',
        picked: false,
        count: { shown: 2, total: 2 },
      },
      {
        name: 'enhancement',
        color: 'd73a4a',
        picked: false,
        count: { shown: 2, total: 2 },
      },
    ]);
  });

  test('a priority switched off reads what switching it on would show; the rest read the list', () => {
    const counts = countIssues(
      ISSUES,
      toggleIssuePriority(DEFAULT_ISSUES_LIST_VIEW, 'low'),
    );

    assert.deepStrictEqual(counts.open, { shown: 5, total: 6 });

    assert.deepStrictEqual(counts.priorities.low, { shown: 1, total: 1 });

    assert.deepStrictEqual(counts.priorities.high, { shown: 1, total: 1 });

    // #2 and #6 carry `bug`; #2 is low.
    assert.deepStrictEqual(
      counts.labels.find((each) => each.name === 'bug')?.count,
      { shown: 1, total: 2 },
    );
  });

  test('a label reads what picking it would show, picked or not', () => {
    const counts = countIssues(
      ISSUES,
      toggleLabel(DEFAULT_ISSUES_LIST_VIEW, 'enhancement'),
    );

    assert.deepStrictEqual(counts.open, { shown: 2, total: 6 });

    assert.deepStrictEqual(
      counts.labels.map((each) => ({
        name: each.name,
        picked: each.picked,
        count: each.count,
      })),
      [
        { name: 'bug', picked: false, count: { shown: 2, total: 2 } },
        { name: 'enhancement', picked: true, count: { shown: 2, total: 2 } },
      ],
    );

    // Only the picked label's issues: #3 (high) and #4 (none).
    assert.deepStrictEqual(counts.priorities, {
      high: { shown: 1, total: 1 },
      mid: { shown: 0, total: 1 },
      low: { shown: 0, total: 1 },
      none: { shown: 1, total: 3 },
    });
  });

  test('a picked label no open issue carries is still listed, so that it can be unpicked', () => {
    const counts = countIssues(
      ISSUES,
      toggleLabel(DEFAULT_ISSUES_LIST_VIEW, 'wontfix'),
    );

    assert.deepStrictEqual(counts.open, { shown: 0, total: 6 });

    assert.deepStrictEqual(counts.labels.at(-1), {
      name: 'wontfix',
      color: undefined,
      picked: true,
      count: { shown: 0, total: 0 },
    });
  });
});

describe(toggleLabel, () => {
  test('picks and unpicks, keeping the labels in name order', () => {
    const picked = toggleLabel(
      toggleLabel(DEFAULT_ISSUES_LIST_VIEW, 'enhancement'),
      'bug',
    );

    assert.deepStrictEqual(picked.onlyLabels, ['bug', 'enhancement']);

    assert.deepStrictEqual(toggleLabel(picked, 'bug').onlyLabels, [
      'enhancement',
    ]);
  });
});

describe(parseIssuesListView, () => {
  test('reads back what was saved', () => {
    const view: IssuesListView = {
      hiddenPriorities: ['low', 'none'],
      onlyLabels: ['bug'],
      sort: 'priority',
    } as const;

    assert.deepStrictEqual(parseIssuesListView(view), view);
  });

  test('anything it cannot make sense of is the default, and what it does not know is dropped', () => {
    assert.deepStrictEqual(
      parseIssuesListView(undefined),
      DEFAULT_ISSUES_LIST_VIEW,
    );

    assert.deepStrictEqual(
      parseIssuesListView('priority'),
      DEFAULT_ISSUES_LIST_VIEW,
    );

    assert.deepStrictEqual(
      parseIssuesListView({
        hiddenPriorities: ['urgent', 'mid'],
        onlyLabels: ['bug', 3, 'bug'],
        sort: 'title',
      }),
      {
        hiddenPriorities: ['mid'],
        onlyLabels: ['bug'],
        sort: 'updated',
      },
    );
  });
});

const issue = (number: number, labelNames: readonly string[]): IssueItem =>
  ({
    number,
    title: `Issue ${number}`,
    author: 'someone',
    url: `https://github.com/o/r/issues/${number}`,
    labels: labelNames.map(label),
    createdAt: '2026-09-20T00:00:00Z',
    updatedAt: '2026-09-23T00:00:00Z',
    comments: 0,
    startAfter: [],
  }) as const;

const titled = (number: number, title: string): IssueItem =>
  ({ ...issue(number, []), title }) as const;

const label = (labelName: string): Label =>
  ({
    name: labelName,
    color: 'd73a4a',
    description: '',
  }) as const;

/** Most recently updated first, as the list is read. */
const ISSUES = [
  issue(1, []),
  issue(2, ['bug', 'priority:low']),
  issue(3, ['enhancement', 'priority:high']),
  issue(4, ['enhancement']),
  issue(5, ['priority:low', 'priority:high']),
  issue(6, ['bug', 'priority:mid']),
] as const;

const numbersOf = (items: readonly IssueItem[]): readonly number[] =>
  items.map(({ number }) => number);
