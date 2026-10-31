import {
  DEFAULT_ISSUE_FILTER,
  isIssueFilterShown,
  type IssueFilter,
} from './issue-filter.mjs';

describe(isIssueFilterShown, () => {
  test('by default, every priority is shown, pending or not', () => {
    assert.isTrue(
      isIssueFilterShown(
        { priority: 'low', pending: true, inProgress: false },
        DEFAULT_ISSUE_FILTER,
      ),
    );

    assert.isTrue(
      isIssueFilterShown(
        { priority: 'none', pending: false, inProgress: false },
        DEFAULT_ISSUE_FILTER,
      ),
    );
  });

  test('a pick on each side narrows by both: only what is of a priority picked and pending', () => {
    const filter: IssueFilter = {
      ...DEFAULT_ISSUE_FILTER,
      onlyPriorities: ['high'],
      onlyPending: true,
    } as const;

    assert.isTrue(
      isIssueFilterShown(
        { priority: 'high', pending: true, inProgress: false },
        filter,
      ),
    );

    // Neither side brings in what the other leaves out.
    assert.isFalse(
      isIssueFilterShown(
        { priority: 'low', pending: true, inProgress: false },
        filter,
      ),
    );

    assert.isFalse(
      isIssueFilterShown(
        { priority: 'high', pending: false, inProgress: false },
        filter,
      ),
    );
  });

  test('what either side hides is hidden', () => {
    assert.isFalse(
      isIssueFilterShown(
        { priority: 'high', pending: true, inProgress: false },
        {
          ...DEFAULT_ISSUE_FILTER,
          hidePending: true,
        },
      ),
    );

    assert.isFalse(
      isIssueFilterShown(
        { priority: 'low', pending: false, inProgress: false },
        {
          ...DEFAULT_ISSUE_FILTER,
          hiddenPriorities: ['low'],
        },
      ),
    );
  });

  test('in progress is a side of its own, read with the others', () => {
    const filter: IssueFilter = {
      ...DEFAULT_ISSUE_FILTER,
      onlyPriorities: ['high'],
      onlyInProgress: true,
    } as const;

    assert.isTrue(
      isIssueFilterShown(
        { priority: 'high', pending: false, inProgress: true },
        filter,
      ),
    );

    assert.isFalse(
      isIssueFilterShown(
        { priority: 'high', pending: false, inProgress: false },
        filter,
      ),
    );

    assert.isFalse(
      isIssueFilterShown(
        { priority: 'mid', pending: false, inProgress: true },
        filter,
      ),
    );

    assert.isFalse(
      isIssueFilterShown(
        { priority: 'high', pending: false, inProgress: true },
        {
          ...DEFAULT_ISSUE_FILTER,
          hideInProgress: true,
        },
      ),
    );

    assert.isTrue(
      isIssueFilterShown(
        { priority: 'high', pending: false, inProgress: false },
        {
          ...DEFAULT_ISSUE_FILTER,
          hideInProgress: true,
        },
      ),
    );
  });
});
