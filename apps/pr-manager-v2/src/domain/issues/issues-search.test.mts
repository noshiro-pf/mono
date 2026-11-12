import { issuesSearchOf } from './issues-search.mjs';
import { DEFAULT_ISSUES } from './issues-view.mjs';

describe(issuesSearchOf, () => {
  test('asks for the open issues by default', () => {
    assert.strictEqual(
      issuesSearchOf(DEFAULT_ISSUES).query,
      'is:issue is:open sort:updated-desc',
    );
  });

  test('says the tiers and labels as labels', () => {
    assert.strictEqual(
      issuesSearchOf({
        ...DEFAULT_ISSUES,
        hidePriority: ['D'],
        onlyPriority: ['S', 'A'],
        hideInProgress: true,
        labels: ['bug'],
      }).query,
      'is:issue is:open -label:"priority:D" label:"priority:S","priority:A" -label:"in-progress" label:"bug" sort:updated-desc',
    );
  });

  test('picks none as no tier label', () => {
    assert.include(
      issuesSearchOf({ ...DEFAULT_ISSUES, onlyPriority: ['none'] }).query,
      '-label:"priority:S" -label:"priority:A"',
    );
  });
});
