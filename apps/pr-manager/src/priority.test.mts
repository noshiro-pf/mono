import { issuePriorityLabel, issueStartRank, type Label } from 'pr-report-core';
import {
  isFadedTier,
  isPriorityLabel,
  isRingedTier,
  ISSUE_TIER_RANK,
  ISSUE_TIERS,
  issueTierOf,
  priorityOf,
} from './priority.mjs';

describe(priorityOf, () => {
  test('reads the one priority label a pull request carries', () => {
    assert.strictEqual(priorityOf([label('priority:high')]), 'high');

    assert.strictEqual(
      priorityOf([label('skip-ci'), label('priority:mid')]),
      'mid',
    );

    assert.strictEqual(priorityOf([label('priority:low')]), 'low');
  });

  test('none, or more than one, is no priority', () => {
    assert.strictEqual(priorityOf([]), 'none');

    assert.strictEqual(
      priorityOf([label('priority:high'), label('priority:low')]),
      'none',
    );
  });
});

describe(issueTierOf, () => {
  test('reads the one tier an issue carries', () => {
    assert.strictEqual(issueTierOf([label('bug'), label('priority:S')]), 'S');

    assert.strictEqual(issueTierOf([label('priority:hold')]), 'hold');
  });

  test('none, more than one, or only a pull request priority, is no tier', () => {
    assert.strictEqual(issueTierOf([]), 'none');

    assert.strictEqual(
      issueTierOf([label('priority:A'), label('priority:C')]),
      'none',
    );

    assert.strictEqual(issueTierOf([label('priority:high')]), 'none');
  });
});

describe('ISSUE_TIER_RANK', () => {
  test('sorts S to C, then no tier, then D, hold and close', () => {
    assert.deepStrictEqual(
      ISSUE_TIERS.toSorted((a, b) => ISSUE_TIER_RANK[a] - ISSUE_TIER_RANK[b]),
      ['S', 'A', 'B', 'C', 'none', 'D', 'hold', 'close'],
    );
  });
});

describe('ISSUE_TIER_RANK and issueStartRank', () => {
  test('agree on the order run-issue-resolver starts issues in', () => {
    const started = ['S', 'A', 'B', 'C', 'D', 'none'] as const;

    const rankOf = (tier: (typeof started)[number]): number =>
      issueStartRank(tier === 'none' ? [] : [issuePriorityLabel(tier)]);

    assert.deepStrictEqual(
      started.toSorted((a, b) => ISSUE_TIER_RANK[a] - ISSUE_TIER_RANK[b]),
      started.toSorted((a, b) => rankOf(a) - rankOf(b)),
    );
  });
});

describe(isRingedTier, () => {
  test('rings S and A alone', () => {
    assert.deepStrictEqual(ISSUE_TIERS.filter(isRingedTier), ['S', 'A']);
  });
});

describe(isFadedTier, () => {
  test('fades D, hold and close alone', () => {
    assert.deepStrictEqual(ISSUE_TIERS.filter(isFadedTier), [
      'D',
      'hold',
      'close',
    ]);
  });
});

describe(isPriorityLabel, () => {
  test('the pull request priorities and the issue tiers, and nothing else', () => {
    assert.isTrue(isPriorityLabel('priority:high'));

    assert.isTrue(isPriorityLabel('priority:mid'));

    assert.isTrue(isPriorityLabel('priority:low'));

    assert.isTrue(isPriorityLabel('priority:S'));

    assert.isTrue(isPriorityLabel('priority:hold'));

    assert.isFalse(isPriorityLabel('priority:urgent'));

    assert.isFalse(isPriorityLabel('bug'));
  });
});

const label = (labelName: string): Label =>
  ({
    name: labelName,
    color: 'ededed',
    description: '',
  }) as const;
