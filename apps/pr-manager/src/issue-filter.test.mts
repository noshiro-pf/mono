import {
  DEFAULT_ISSUE_FILTER,
  isIssueFilterShown,
  type IssueFilter,
} from './issue-filter.mjs';

describe(isIssueFilterShown, () => {
  test('by default, every tier is shown, held or not', () => {
    assert.isTrue(
      isIssueFilterShown(
        { priority: 'hold', inProgress: false },
        DEFAULT_ISSUE_FILTER,
      ),
    );

    assert.isTrue(
      isIssueFilterShown(
        { priority: 'none', inProgress: false },
        DEFAULT_ISSUE_FILTER,
      ),
    );
  });

  test('what the tiers hide is hidden, hold included', () => {
    assert.isFalse(
      isIssueFilterShown(
        { priority: 'hold', inProgress: false },
        { ...DEFAULT_ISSUE_FILTER, hiddenPriorities: ['hold'] },
      ),
    );

    assert.isTrue(
      isIssueFilterShown(
        { priority: 'S', inProgress: false },
        { ...DEFAULT_ISSUE_FILTER, hiddenPriorities: ['hold'] },
      ),
    );
  });

  test('in progress is a side of its own, read with the tiers', () => {
    const filter: IssueFilter = {
      ...DEFAULT_ISSUE_FILTER,
      onlyPriorities: ['S'],
      onlyInProgress: true,
    } as const;

    assert.isTrue(
      isIssueFilterShown({ priority: 'S', inProgress: true }, filter),
    );

    // Neither side brings in what the other leaves out.
    assert.isFalse(
      isIssueFilterShown({ priority: 'S', inProgress: false }, filter),
    );

    assert.isFalse(
      isIssueFilterShown({ priority: 'B', inProgress: true }, filter),
    );

    assert.isFalse(
      isIssueFilterShown(
        { priority: 'S', inProgress: true },
        { ...DEFAULT_ISSUE_FILTER, hideInProgress: true },
      ),
    );

    assert.isTrue(
      isIssueFilterShown(
        { priority: 'S', inProgress: false },
        { ...DEFAULT_ISSUE_FILTER, hideInProgress: true },
      ),
    );
  });
});
