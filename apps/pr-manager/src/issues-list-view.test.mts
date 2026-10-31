import type { Label } from 'pr-report-core';
import {
  arrangeIssues,
  countIssues,
  DEFAULT_ISSUES_LIST_VIEW,
  isIssueShown,
  issuesListViewFromSearch,
  matchesIssueTitle,
  searchWithIssuesListView,
  toggleIssueInProgress,
  toggleIssueInProgressOnly,
  toggleIssuePending,
  toggleIssuePendingOnly,
  toggleIssuePriority,
  toggleIssuePriorityOnly,
  toggleIssueStart,
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

  test('with priorities picked, an issue is shown only when its priority is one of them', () => {
    const view = toggleIssuePriorityOnly(
      toggleIssuePriorityOnly(DEFAULT_ISSUES_LIST_VIEW, 'high'),
      'none',
    );

    assert.isTrue(isIssueShown(issue(1, ['priority:high']), view));

    assert.isTrue(isIssueShown(issue(2, ['bug']), view));

    assert.isFalse(isIssueShown(issue(3, ['priority:mid']), view));
  });

  test('under a pick, switching on one not picked picks it too, and switching off one picked unpicks it', () => {
    const picked = toggleIssuePriorityOnly(DEFAULT_ISSUES_LIST_VIEW, 'high');

    const both = toggleIssuePriority(picked, 'mid');

    assert.deepStrictEqual(both.onlyPriorities, ['high', 'mid']);

    assert.deepStrictEqual(both.hiddenPriorities, []);

    const hidden = toggleIssuePriority(both, 'high');

    assert.deepStrictEqual(hidden.onlyPriorities, ['mid']);

    assert.deepStrictEqual(hidden.hiddenPriorities, ['high']);
  });

  test('a priority is never both hidden and picked', () => {
    const hidden = toggleIssuePriority(DEFAULT_ISSUES_LIST_VIEW, 'high');

    const picked = toggleIssuePriorityOnly(hidden, 'high');

    assert.deepStrictEqual(picked.hiddenPriorities, []);

    assert.deepStrictEqual(picked.onlyPriorities, ['high']);

    const hiddenAgain = toggleIssuePriority(picked, 'high');

    assert.deepStrictEqual(hiddenAgain.hiddenPriorities, ['high']);

    assert.deepStrictEqual(hiddenAgain.onlyPriorities, []);
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

describe(toggleIssuePending, () => {
  test('hides the issues labelled pending, and shows them again', () => {
    const view = toggleIssuePending(DEFAULT_ISSUES_LIST_VIEW);

    assert.isFalse(isIssueShown(issue(1, ['pending']), view));

    assert.isFalse(isIssueShown(issue(2, ['bug', 'pending']), view));

    assert.isTrue(isIssueShown(issue(3, ['bug']), view));

    assert.isTrue(
      isIssueShown(issue(1, ['pending']), toggleIssuePending(view)),
    );
  });

  test('a picked label does not show what is hidden as pending', () => {
    const view = toggleIssuePending(
      toggleLabel(DEFAULT_ISSUES_LIST_VIEW, 'bug'),
    );

    assert.isFalse(isIssueShown(issue(1, ['bug', 'pending']), view));

    assert.isTrue(isIssueShown(issue(2, ['bug']), view));
  });

  test('switching off pending while it is picked unpicks it', () => {
    const view = toggleIssuePending(
      toggleIssuePendingOnly(DEFAULT_ISSUES_LIST_VIEW),
    );

    assert.isTrue(view.hidePending);

    assert.isFalse(view.onlyPending);
  });
});

describe(toggleIssuePendingOnly, () => {
  test('picked, only the issues labelled pending are shown, of the priorities shown', () => {
    const view = toggleIssuePendingOnly(
      toggleIssuePriorityOnly(DEFAULT_ISSUES_LIST_VIEW, 'high'),
    );

    assert.isTrue(isIssueShown(issue(1, ['pending', 'priority:high']), view));

    // Picking pending does not bring in what the priorities leave out, nor
    // picking a priority what pending leaves out.
    assert.isFalse(isIssueShown(issue(2, ['pending', 'priority:low']), view));

    assert.isFalse(isIssueShown(issue(3, ['priority:high']), view));

    assert.isTrue(
      isIssueShown(issue(3, ['priority:high']), toggleIssuePendingOnly(view)),
    );
  });

  test('picking pending while it is switched off switches it back on', () => {
    const view = toggleIssuePendingOnly(
      toggleIssuePending(DEFAULT_ISSUES_LIST_VIEW),
    );

    assert.isFalse(view.hidePending);

    assert.isTrue(view.onlyPending);
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
      onlyPriorities: [],
      hiddenStarts: [],
      onlyLabels: ['bug'],
      hidePending: false,
      onlyPending: false,
      hideInProgress: false,
      onlyInProgress: false,
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

  test('with a priority picked, it reads the list, and the rest read what picking them too would add', () => {
    const counts = countIssues(
      ISSUES,
      toggleIssuePriorityOnly(DEFAULT_ISSUES_LIST_VIEW, 'high'),
    );

    assert.deepStrictEqual(counts.open, { shown: 1, total: 6 });

    assert.deepStrictEqual(counts.priorities.high, { shown: 1, total: 1 });

    assert.deepStrictEqual(counts.priorities.low, { shown: 1, total: 1 });

    assert.deepStrictEqual(counts.priorities.none, { shown: 3, total: 3 });
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

  test('pending is its own switch, not a label: switched off, it reads what switching it on would show', () => {
    const items = [
      issue(1, ['pending']),
      issue(2, ['pending', 'bug', 'priority:low']),
      issue(3, ['bug']),
    ] as const;

    const shown = countIssues(items, DEFAULT_ISSUES_LIST_VIEW);

    assert.deepStrictEqual(shown.pending, { shown: 2, total: 2 });

    assert.deepStrictEqual(
      shown.labels.map(({ name }) => name),
      ['bug'],
    );

    const hidden = countIssues(
      items,
      toggleIssuePending(toggleIssuePriority(DEFAULT_ISSUES_LIST_VIEW, 'low')),
    );

    assert.deepStrictEqual(hidden.open, { shown: 1, total: 3 });

    // #2 is low, which is still hidden.
    assert.deepStrictEqual(hidden.pending, { shown: 1, total: 2 });

    assert.deepStrictEqual(hidden.labels[0]?.count, { shown: 1, total: 2 });
  });

  test('pending picked, the priorities read what is pending of each, and pending reads what the priorities show', () => {
    const items = [
      issue(1, ['pending', 'priority:high']),
      issue(2, ['pending', 'priority:low']),
      issue(3, ['priority:high']),
      issue(4, []),
    ] as const;

    const counts = countIssues(
      items,
      toggleIssuePendingOnly(
        toggleIssuePriorityOnly(DEFAULT_ISSUES_LIST_VIEW, 'high'),
      ),
    );

    assert.deepStrictEqual(counts.open, { shown: 1, total: 4 });

    assert.deepStrictEqual(counts.pending, { shown: 1, total: 2 });

    assert.deepStrictEqual(counts.priorities, {
      high: { shown: 1, total: 2 },
      mid: { shown: 0, total: 0 },
      low: { shown: 1, total: 1 },
      none: { shown: 0, total: 1 },
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

describe('the start states', () => {
  // #1 ready, #2 blocked, #3 in progress, #4 none known (free), #5 on a
  // cycle, #6 ready.
  const starts = new Map<
    1 | 2 | 3 | 5 | 6,
    'ready' | 'blocked' | 'cycle' | 'in-progress'
  >([
    [1, 'ready'],
    [2, 'blocked'],
    [3, 'in-progress'],
    [5, 'cycle'],
    [6, 'ready'],
  ] as const);

  test('a start state switched off hides the issues in it', () => {
    const view = toggleIssueStart(
      toggleIssueStart(DEFAULT_ISSUES_LIST_VIEW, 'blocked'),
      'free',
    );

    assert.deepStrictEqual(
      numbersOf(arrangeIssues(ISSUES, view, '', starts)),
      [1, 3, 5, 6],
    );
  });

  test('sorted by start state, the startable first and the stuck last, by update within each', () => {
    assert.deepStrictEqual(
      numbersOf(
        arrangeIssues(
          ISSUES,
          withIssueSort(DEFAULT_ISSUES_LIST_VIEW, 'start'),
          '',
          starts,
        ),
      ),
      [1, 6, 4, 3, 2, 5],
    );
  });

  test('each start state counts what switching it on would show', () => {
    const counts = countIssues(
      ISSUES,
      toggleIssueStart(DEFAULT_ISSUES_LIST_VIEW, 'ready'),
      '',
      starts,
    );

    assert.deepStrictEqual(counts.starts, {
      ready: { shown: 2, total: 2 },
      free: { shown: 1, total: 1 },
      planned: { shown: 0, total: 0 },
      attention: { shown: 0, total: 0 },
      blocked: { shown: 1, total: 1 },
      cycle: { shown: 1, total: 1 },
    });

    assert.deepStrictEqual(counts.open, { shown: 4, total: 6 });

    assert.deepStrictEqual(counts.inProgress, { shown: 1, total: 1 });
  });

  test('in progress picked shows only the issues in progress, read with the start states', () => {
    const view = toggleIssueInProgressOnly(DEFAULT_ISSUES_LIST_VIEW);

    assert.deepStrictEqual(
      numbersOf(arrangeIssues(ISSUES, view, '', starts)),
      [3],
    );

    const counts = countIssues(ISSUES, view, '', starts);

    assert.deepStrictEqual(counts.open, { shown: 1, total: 6 });

    assert.deepStrictEqual(counts.inProgress, { shown: 1, total: 1 });

    // A start state reads what picking in progress leaves of it.
    assert.deepStrictEqual(counts.starts.ready, { shown: 0, total: 2 });
  });

  test('in progress switched off hides the issues in progress, and counts what showing them would show', () => {
    const view = toggleIssueInProgress(DEFAULT_ISSUES_LIST_VIEW);

    assert.deepStrictEqual(
      numbersOf(arrangeIssues(ISSUES, view, '', starts)),
      [1, 2, 4, 5, 6],
    );

    assert.deepStrictEqual(countIssues(ISSUES, view, '', starts).inProgress, {
      shown: 1,
      total: 1,
    });
  });

  test('switching in progress off unpicks it, and picking it switches it back on', () => {
    const picked = toggleIssueInProgressOnly(DEFAULT_ISSUES_LIST_VIEW);

    const hidden = toggleIssueInProgress(picked);

    assert.isTrue(hidden.hideInProgress);

    assert.isFalse(hidden.onlyInProgress);

    const pickedAgain = toggleIssueInProgressOnly(hidden);

    assert.isFalse(pickedAgain.hideInProgress);

    assert.isTrue(pickedAgain.onlyInProgress);
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

describe(issuesListViewFromSearch, () => {
  test('reads back what was written', () => {
    const view: IssuesListView = {
      hiddenPriorities: ['low', 'none'],
      onlyPriorities: ['high'],
      hiddenStarts: ['blocked'],
      onlyLabels: ['bug', 'good first issue', 'v1.2'],
      hidePending: true,
      onlyPending: false,
      hideInProgress: false,
      onlyInProgress: true,
      sort: 'start',
    } as const;

    const search = searchWithIssuesListView('', view);

    assert.strictEqual(
      search,
      '?issues.hidePriority=low.none&issues.onlyPriority=high&issues.hideStart=blocked&issues.label=bug&issues.label=good+first+issue&issues.label=v1.2&issues.hidePending=1&issues.onlyInProgress=1&issues.sort=start',
    );

    assert.deepStrictEqual(issuesListViewFromSearch(search), view);

    const picked: IssuesListView = {
      ...DEFAULT_ISSUES_LIST_VIEW,
      onlyPending: true,
    } as const;

    assert.strictEqual(
      searchWithIssuesListView('', picked),
      '?issues.onlyPending=1',
    );

    assert.deepStrictEqual(
      issuesListViewFromSearch('?issues.onlyPending=1'),
      picked,
    );
  });

  test("the DAG's own pending switch an older page wrote switches pending off for both views", () => {
    assert.isTrue(issuesListViewFromSearch('?dag.hidePending=1').hidePending);

    // What the issues' own parameters say comes first.
    assert.isFalse(
      issuesListViewFromSearch('?dag.hidePending=1&issues.onlyPending=1')
        .hidePending,
    );

    assert.strictEqual(
      searchWithIssuesListView(
        '?dag.hidePending=1',
        issuesListViewFromSearch('?dag.hidePending=1'),
      ),
      '?dag.hidePending=1&issues.hidePending=1',
    );
  });

  test('the start state in-progress an older page switched off switches in progress off for both views', () => {
    const view = issuesListViewFromSearch(
      '?issues.hideStart=in-progress.blocked',
    );

    assert.isTrue(view.hideInProgress);

    assert.deepStrictEqual(view.hiddenStarts, ['blocked']);

    // What the issues' own parameters say comes first.
    assert.isFalse(
      issuesListViewFromSearch(
        '?issues.hideStart=in-progress&issues.onlyInProgress=1',
      ).hideInProgress,
    );

    assert.strictEqual(
      searchWithIssuesListView('?issues.hideStart=in-progress.blocked', view),
      '?issues.hideStart=blocked&issues.hideInProgress=1',
    );
  });

  test('pending both switched off and picked, which only a hand can write, is switched off', () => {
    const view = issuesListViewFromSearch(
      '?issues.hidePending=1&issues.onlyPending=1',
    );

    assert.isTrue(view.hidePending);

    assert.isFalse(view.onlyPending);
  });

  test('anything it cannot make sense of is the default, and what it does not know is dropped', () => {
    assert.deepStrictEqual(
      issuesListViewFromSearch(''),
      DEFAULT_ISSUES_LIST_VIEW,
    );

    assert.deepStrictEqual(
      issuesListViewFromSearch(
        '?issues.hidePriority=urgent.mid&issues.onlyPriority=mid.low&issues.hideStart=someday.cycle&issues.label=bug&issues.label=&issues.label=bug&issues.label=pending&issues.label=priority:high&issues.hidePending=yes&issues.sort=title',
      ),
      {
        hiddenPriorities: ['mid'],
        // Switched off and picked is switched off.
        onlyPriorities: ['low'],
        hiddenStarts: ['cycle'],
        onlyLabels: ['bug'],
        hidePending: false,
        onlyPending: false,
        hideInProgress: false,
        onlyInProgress: false,
        sort: 'updated',
      },
    );
  });

  test('the labels come in name order', () => {
    assert.deepStrictEqual(
      issuesListViewFromSearch('?issues.label=enhancement&issues.label=bug')
        .onlyLabels,
      ['bug', 'enhancement'],
    );
  });
});

describe(searchWithIssuesListView, () => {
  test('leaves the labels where they are while they are the same', () => {
    const search = '?issues.label=bug&dag.zoom=125';

    assert.strictEqual(
      searchWithIssuesListView(search, issuesListViewFromSearch(search)),
      search,
    );
  });

  test('writes the default as no parameter, and leaves the others where they were', () => {
    assert.strictEqual(
      searchWithIssuesListView(
        '?a=1&issues.label=bug&issues.sort=priority&b=2',
        DEFAULT_ISSUES_LIST_VIEW,
      ),
      '?a=1&b=2',
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
    misplacedMergeAfter: [],
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
