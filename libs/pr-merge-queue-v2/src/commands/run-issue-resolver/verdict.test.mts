import type { ResultEvent } from '../../agent/index.mjs';
import { hitItsCap, judgeIssueSession, type IssueAfter } from './verdict.mjs';

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

const after = (overrides: Partial<IssueAfter> = {}): IssueAfter =>
  ({ open: true, closedBy: [], ...overrides }) as const;

describe(judgeIssueSession, () => {
  test('a pull request that closes it now is what the session opened', () => {
    assert.deepStrictEqual(
      judgeIssueSession(ended(), after({ closedBy: [12] })),
      { verdict: 'opened', release: false },
    );
  });

  test('takes in-progress off one left with no pull request, declined or stopped short', () => {
    assert.deepStrictEqual(
      judgeIssueSession(
        ended({ subtype: 'error_max_budget_usd', isError: true }),
        after(),
      ),
      { verdict: 'left', release: true },
    );
  });

  test('counts one that ended with no result as left, since it may have spent', () => {
    assert.deepStrictEqual(judgeIssueSession(undefined, after()), {
      verdict: 'left',
      release: true,
    });
  });

  test('takes in-progress off one it could not read afterwards', () => {
    assert.deepStrictEqual(judgeIssueSession(ended(), undefined), {
      verdict: 'left',
      release: true,
    });
  });

  test('says when it is closed, and takes the label off in case it is reopened', () => {
    assert.deepStrictEqual(judgeIssueSession(ended(), after({ open: false })), {
      verdict: 'closed',
      release: true,
    });
  });

  test('tries one again that failed before spending anything', () => {
    assert.deepStrictEqual(
      judgeIssueSession(ended({ isError: true, costUsd: 0 }), after()),
      { verdict: 'not-started', release: true },
    );
  });
});

describe(hitItsCap, () => {
  test('is a session its cap stopped, as its result says or its cost shows', () => {
    assert.isTrue(
      hitItsCap(ended({ subtype: 'error_max_budget_usd', isError: true }), 5),
    );

    assert.isTrue(hitItsCap(ended({ costUsd: 5.02 }), 5));
  });

  test('is not one that ended under it, or whose result says nothing', () => {
    assert.isFalse(hitItsCap(ended({ costUsd: 4.2 }), 5));

    assert.isFalse(hitItsCap(undefined, 5));
  });
});
