import { decideQueue, type QueueDecision } from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';
import { label, pull, snapshot } from '../../../test/index.mjs';
import { cardOf, claudeSessionsOf, priorityOf } from './card.mjs';

describe(priorityOf, () => {
  test.each([
    [[], 'none'],
    [['priority:high'], 'high'],
    [['Priority:Mid'], 'mid'],
    [['priority:low'], 'low'],
    [['priority:high', 'priority:low'], 'none'],
  ] as const)('%j is %s', (labels, expected) => {
    assert.strictEqual(priorityOf(labels), expected);
  });
});

describe(claudeSessionsOf, () => {
  test('reads titled and bare session lines outside code fences', () => {
    const body = [
      'Claude-Session: [Fix the thing](https://claude.ai/code/session_1)',
      '```',
      'Claude-Session: https://claude.ai/code/session_2',
      '```',
      'claude-session: https://claude.ai/code/session_3',
      'Claude-Session: not a link',
      'Claude-Session: [Elsewhere](https://example.com/session_4)',
      'Claude-Session: https://claude.ai/code/session_3',
    ].join('\n');

    assert.deepStrictEqual(claudeSessionsOf(body), [
      { title: 'Fix the thing', url: 'https://claude.ai/code/session_1' },
      { title: undefined, url: 'https://claude.ai/code/session_3' },
    ]);
  });
});

describe(cardOf, () => {
  test('says what a pull request waits for and how it is labelled', () => {
    const from = snapshot([
      pull(1),
      pull(2, {
        body: 'Merge-After: #1\nMerge-After: #99',
        labels: [label('merge-queued'), label('skip-ci'), label('pending')],
      }),
    ]);

    const decision = decided(from).pullRequests.find(
      (d) => d.facts.number === 2,
    );

    assert.isDefined(decision);

    const card = cardOf(decision, from, 0);

    assert.deepStrictEqual(card.mergeAfter, [1]);

    assert.isTrue(card.queued);

    assert.isTrue(card.paused);

    assert.isTrue(card.pending);

    assert.strictEqual(card.priority, 'none');
  });

  test('counts every reported context when the branch requires none', () => {
    const base = pull(3);

    const from = snapshot(
      [
        pull(3, {
          checks: Result.ok({
            sha: base.headSha,
            runs: [],
            statuses: [
              { context: 'lint', state: 'failure', url: undefined },
              { context: 'test', state: 'success', url: undefined },
            ],
            rounds: [],
          }),
        }),
      ],
      [],
      {
        requirements: Result.ok({
          requiredContexts: [],
          requireCodeOwnerReview: false,
          requireConversationResolution: false,
        }),
      },
    );

    const [decision] = decided(from).pullRequests;

    assert.isDefined(decision);

    assert.deepStrictEqual(cardOf(decision, from, 0).checks, {
      kind: 'counts',
      verdict: 'failing',
      failed: ['lint'],
      pending: [],
      skipped: [],
      passed: ['test'],
      noneRequired: true,
    });
  });
});

const decided = (from: ReturnType<typeof snapshot>): QueueDecision =>
  Result.unwrapThrow(
    decideQueue(from, { nowEpochMs: 0, demoted: new Set<number>() }),
  );
