import {
  decideQueue,
  type MovedHead,
  type QueueDecision,
} from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import { label, pull, snapshot } from '../../../test/index.mjs';
import { queueSummary, queueViewOf } from './queue-view.mjs';

describe(queueViewOf, () => {
  const queued = [label('merge-queued')] as const;

  const from = snapshot(
    [
      pull(1, { labels: queued, mergeState: 'CLEAN', autoMerge: true }),
      pull(2, { labels: queued, mergeState: 'BEHIND' }),
      pull(3, {
        labels: Arr.toPushed(queued, label('priority:high')),
        mergeState: 'BEHIND',
      }),
      pull(4, {
        labels: queued,
        mergeState: 'BEHIND',
        body: 'Merge-After: #2',
      }),
      pull(5, { labels: queued, isDraft: true }),
      pull(6),
    ],
    [],
    {
      queueLayers: Result.ok({
        baseTree: 'b',
        movedHeads: new Map<number, MovedHead>(),
        layers: [
          {
            branch: 'queue/pr-2',
            origin: { number: 2, builtFromHead: 'x' },
            sha: 's',
            tree: 't',
            parent: 'q',
            parentTree: 'p',
            committedAt: '2026-11-01T00:00:00Z',
            checks: Result.ok({ sha: 's', runs: [], statuses: [], rounds: [] }),
          },
        ],
      }),
    },
  );

  const view = queueViewOf(decided(from), from);

  test('runs the one in flight, then picks high first, checked-ahead layers ahead of all', () => {
    assert.deepStrictEqual(
      view.running.map(({ number }) => number),
      [1],
    );

    assert.deepStrictEqual(
      view.next.map(({ number, checkedAhead }) => [number, checkedAhead]),
      [
        [2, true],
        [3, false],
      ],
    );

    assert.isTrue(view.orderKnown);
  });

  test('says why a queued pull request waits, and leaves out one not queued', () => {
    assert.deepStrictEqual(
      view.waiting.map(({ number, why }) => [number, why]),
      [[4, 'after #2']],
    );

    assert.deepStrictEqual(
      view.outside.map(({ number, why }) => [number, why]),
      [[5, 'draft']],
    );

    assert.strictEqual(
      queueSummary(view),
      '5 queued · 1 running · 0 set aside',
    );
  });
});

describe('the bypass mark', () => {
  test('carries the review hold’s reason when only the author owns what waits', () => {
    const from = snapshot(
      [
        pull(1, {
          labels: [label('merge-queued')],
          mergeState: 'BEHIND',
          author: 'owner',
          review: Result.ok({
            latestReviews: [],
            files: [
              {
                path: '.github/x.yml',
                change: 'added',
                previousPath: undefined,
              },
            ],
            filesComplete: true,
            unresolvedConversations: 0,
            pushers: 'unknown',
          }),
        }),
      ],
      [],
      {
        repository: {
          ...snapshot([]).repository,
          codeOwners: Result.ok('/.github/ @owner\n'),
        },
        requirements: Result.ok({
          requiredContexts: [],
          requireCodeOwnerReview: true,
          requireConversationResolution: false,
        }),
      },
    );

    const [box] = queueViewOf(decided(from), from).next;

    assert.include(box?.bypass ?? '', '@owner is the only owner');
  });
});

const decided = (from: ReturnType<typeof snapshot>): QueueDecision =>
  Result.unwrapThrow(
    decideQueue(from, { nowEpochMs: 0, demoted: new Set<number>() }),
  );
