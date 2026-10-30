import type { ClaimComment, QueueComment } from 'pr-report-core';
import type { ResultEvent } from './claude.mjs';
import { judgeSession } from './verdict.mjs';

const HEAD = 'c'.repeat(40);

const ended = (overrides: Partial<ResultEvent> = {}): ResultEvent =>
  ({
    kind: 'result',
    subtype: 'success',
    isError: false,
    costUsd: 1.2,
    turns: 30,
    text: undefined,
    ...overrides,
  }) as const;

const claimBy = (
  by: string,
  applies: boolean = true,
): QueueComment<ClaimComment> =>
  ({
    commentId: 2,
    says: {
      kind: 'standing',
      claim: { headSha: HEAD, by, at: '2026-10-30T00:00:00Z' },
    },
    applies,
  }) as const;

describe(judgeSession, () => {
  test('a session that ended by itself has had its try', () => {
    assert.deepStrictEqual(judgeSession(ended(), undefined, 'me'), {
      verdict: 'tried',
      releaseClaim: false,
    });
  });

  test('so has one that ran out of budget, and its claim is let go', () => {
    assert.deepStrictEqual(
      judgeSession(
        ended({ subtype: 'error_max_budget_usd', isError: true, costUsd: 5 }),
        claimBy('me'),
        'me',
      ),
      { verdict: 'tried', releaseClaim: true },
    );
  });

  test('so has one that failed after spending, so it is not paid for again', () => {
    assert.deepStrictEqual(
      judgeSession(
        ended({
          subtype: 'error_during_execution',
          isError: true,
          costUsd: 4.9,
        }),
        undefined,
        'me',
      ),
      { verdict: 'tried', releaseClaim: false },
    );
  });

  test('and one that crashed or was stopped before its result', () => {
    assert.strictEqual(
      judgeSession(undefined, claimBy('me'), 'me').verdict,
      'tried',
    );
  });

  test('one that failed before spending anything has not', () => {
    assert.deepStrictEqual(
      judgeSession(
        ended({ subtype: 'success', isError: true, costUsd: 0 }),
        undefined,
        'me',
      ),
      { verdict: 'not-started', releaseClaim: false },
    );
  });

  test('one that failed and did not say what it spent has had its try', () => {
    assert.strictEqual(
      judgeSession(
        ended({
          subtype: 'error_during_execution',
          isError: true,
          costUsd: undefined,
        }),
        undefined,
        'me',
      ).verdict,
      'tried',
    );
  });

  test('one someone else claimed first is theirs, and is not marked', () => {
    assert.deepStrictEqual(judgeSession(ended(), claimBy('them'), 'me'), {
      verdict: 'taken',
      releaseClaim: false,
    });
  });

  test('a claim that has ended is neither released nor anyone’s', () => {
    assert.deepStrictEqual(judgeSession(ended(), claimBy('me', false), 'me'), {
      verdict: 'tried',
      releaseClaim: false,
    });

    assert.strictEqual(
      judgeSession(ended(), claimBy('them', false), 'me').verdict,
      'tried',
    );
  });
});
