import {
  issuePriorityLabel,
  issuePriorityOfLabels,
  issueStartRank,
  parseIssuePriority,
} from './issue-priority.mjs';

describe(issuePriorityOfLabels, () => {
  test('reads the one priority label an issue carries', () => {
    assert.strictEqual(
      issuePriorityOfLabels(['bug', 'priority:S', 'pending']),
      'S',
    );

    assert.strictEqual(issuePriorityOfLabels(['priority:hold']), 'hold');
  });

  test('says none for no priority label, and the pull request ones are not one', () => {
    assert.strictEqual(issuePriorityOfLabels([]), 'none');

    assert.strictEqual(
      issuePriorityOfLabels(['priority:high', 'priority:low']),
      'none',
    );
  });

  test('says several for more than one, which says nothing', () => {
    assert.strictEqual(
      issuePriorityOfLabels(['priority:A', 'priority:C']),
      'several',
    );
  });
});

describe(issueStartRank, () => {
  test('ranks S first, then A, B and C, then what has no tier, then D', () => {
    const ranks = [
      ['priority:D'],
      ['priority:S'],
      [],
      ['priority:C'],
      ['priority:A', 'priority:B'],
      ['priority:B'],
      ['priority:A'],
    ].map(issueStartRank);

    assert.deepStrictEqual(ranks, [5, 0, 4, 3, 4, 2, 1]);
  });
});

describe(parseIssuePriority, () => {
  test('takes a tier as written', () => {
    assert.strictEqual(parseIssuePriority('B'), 'B');

    assert.strictEqual(parseIssuePriority('hold'), 'hold');
  });

  test('refuses anything else, the pull request priorities included', () => {
    assert.isUndefined(parseIssuePriority('b'));

    assert.isUndefined(parseIssuePriority('high'));

    assert.isUndefined(parseIssuePriority('priority:S'));
  });
});

describe(issuePriorityLabel, () => {
  test('is the tier under priority:', () => {
    assert.strictEqual(issuePriorityLabel('close'), 'priority:close');
  });
});
