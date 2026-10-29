import {
  DEFAULT_ISSUE_FILTER,
  isIssueFilterShown,
  type IssueFilter,
} from './issue-filter.mjs';

describe(isIssueFilterShown, () => {
  test('by default, every priority is shown, pending or not', () => {
    assert.isTrue(isIssueFilterShown('low', true, DEFAULT_ISSUE_FILTER));

    assert.isTrue(isIssueFilterShown('none', false, DEFAULT_ISSUE_FILTER));
  });

  test('a pick on each side narrows by both: only what is of a priority picked and pending', () => {
    const filter: IssueFilter = {
      ...DEFAULT_ISSUE_FILTER,
      onlyPriorities: ['high'],
      onlyPending: true,
    } as const;

    assert.isTrue(isIssueFilterShown('high', true, filter));

    // Neither side brings in what the other leaves out.
    assert.isFalse(isIssueFilterShown('low', true, filter));

    assert.isFalse(isIssueFilterShown('high', false, filter));
  });

  test('what either side hides is hidden', () => {
    assert.isFalse(
      isIssueFilterShown('high', true, {
        ...DEFAULT_ISSUE_FILTER,
        hidePending: true,
      }),
    );

    assert.isFalse(
      isIssueFilterShown('low', false, {
        ...DEFAULT_ISSUE_FILTER,
        hiddenPriorities: ['low'],
      }),
    );
  });
});
