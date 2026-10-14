import type { Claim } from 'pr-report-core';
import { standingClaims } from './claims.mjs';
import type { PullRequest } from './types.mjs';

const HEAD = 'c'.repeat(40);

const CLAIM: Claim = {
  headSha: HEAD,
  by: 'https://claude.ai/code/session_01abc',
  at: '2026-10-12T01:00:00Z',
} as const;

const NOW = Temporal.Instant.from('2026-10-12T01:30:00Z').epochMilliseconds;

const pullRequest = (number: number, headRefOid = HEAD): PullRequest =>
  ({
    number,
    id: `PR_${number}`,
    title: `#${number}`,
    body: '',
    state: 'OPEN',
    headRefName: `feature/${number}`,
    headRefOid,
    baseRefName: 'main',
    isCrossRepository: false,
    isDraft: false,
    mergeStateStatus: 'BLOCKED',
    autoMergeRequest: null,
    labels: [],
  }) as const;

describe(standingClaims, () => {
  test('keeps a claim at the head its pull request is at', () => {
    assert.deepStrictEqual(
      standingClaims(new Map([[1, CLAIM]]), [pullRequest(1)], NOW),
      new Map([[1, CLAIM]]),
    );
  });

  test('drops one whose branch has been pushed, which is the claim done', () => {
    assert.deepStrictEqual(
      standingClaims(
        new Map([[1, CLAIM]]),
        [pullRequest(1, 'd'.repeat(40))],
        NOW,
      ),
      new Map(),
    );
  });

  test('drops one that has run out, and one on a closed pull request', () => {
    assert.deepStrictEqual(
      standingClaims(
        new Map([
          [1, CLAIM],
          [2, CLAIM],
        ]),
        [pullRequest(1)],
        NOW + 3 * 60 * 60_000,
      ),
      new Map(),
    );
  });
});
