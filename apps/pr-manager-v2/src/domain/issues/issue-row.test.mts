import {
  decideQueue,
  instantOf,
  writeIssueClaimComment,
  type IssueDecision,
} from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';
import { issue, label, snapshot } from '../../../test/index.mjs';
import { issueRowOf, issueTitlesOf, STALE_CLAIM_MS } from './issue-row.mjs';

describe(issueRowOf, () => {
  const NOW = Date.parse('2026-11-10T00:00:00Z');

  const claimed = (
    state: 'planned' | 'started',
    ageMs: number,
  ): IssueDecision =>
    decided(
      issue(1, {
        labels: [label(state === 'started' ? 'in-progress' : 'planned')],
        comments: Result.ok([
          {
            id: 1,
            body: writeIssueClaimComment(
              {
                state,
                by: 'https://claude.ai/code/session_01abc',
                at: instantOf(NOW - ageMs),
              },
              'Started.',
            ),
            createdAt: '2026-11-01T00:00:00Z',
          },
        ]),
      }),
    );

  test('shows the claimant with its session and age', () => {
    const row = issueRowOf(claimed('started', 60_000), NO_TITLES, NOW);

    assert.deepStrictEqual(row.claim, {
      state: 'started',
      by: 'https://claude.ai/code/session_01abc',
      sessionUrl: 'https://claude.ai/code/session_01abc',
      atMs: NOW - 60_000,
      stale: false,
    });
  });

  test('marks a started claim older than the threshold stale', () => {
    const row = issueRowOf(
      claimed('started', STALE_CLAIM_MS + 60_000),
      NO_TITLES,
      NOW,
    );

    assert.strictEqual(row.claim?.stale, true);
  });

  test('reads several tiers as none, and warns of Merge-After in an issue', () => {
    const row = issueRowOf(
      decided(
        issue(2, {
          labels: [label('priority:S'), label('priority:A')],
          body: 'Merge-After: #1',
        }),
      ),
      NO_TITLES,
      NOW,
    );

    assert.strictEqual(row.tier, 'none');

    assert.isTrue(row.mergeAfterInBody);
  });

  test('names what it waits for by title', () => {
    const from = snapshot(
      [],
      [issue(1, { title: 'First' }), issue(2, { body: 'Start-After: #1' })],
    );

    const decisions = Result.unwrapThrow(
      Result.unwrapThrow(
        decideQueue(from, { nowEpochMs: NOW, demoted: new Set<number>() }),
      ).issues,
    );

    const second = decisions.find(({ facts }) => facts.number === 2);

    assert.isDefined(second);

    assert.deepStrictEqual(issueRowOf(second, issueTitlesOf(from), NOW).waits, [
      { number: 1, status: 'waiting', title: 'First' },
    ]);
  });
});

const decided = (one: ReturnType<typeof issue>): IssueDecision => {
  const decisions = Result.unwrapThrow(
    Result.unwrapThrow(
      decideQueue(snapshot([], [one]), {
        nowEpochMs: Date.parse('2026-11-10T00:00:00Z'),
        demoted: new Set<number>(),
      }),
    ).issues,
  );

  const [first] = decisions;

  if (first === undefined) {
    throw new Error('no decision');
  }

  return first;
};

const NO_TITLES = new Map<number, string>();
