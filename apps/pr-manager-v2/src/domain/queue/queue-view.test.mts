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
      view.next.map(({ number, checkedAhead, why }) => [
        number,
        checkedAhead,
        why,
      ]),
      [
        [2, true, 'checked ahead'],
        [3, false, undefined],
      ],
    );

    assert.isTrue(view.orderKnown);
  });

  test('draws a wait on a box ahead as an arc, not as words, and leaves out one not queued', () => {
    // #2 is the second box of the row, #4 the fourth: two places back.
    assert.deepStrictEqual(
      view.waiting.map(({ number, why, arcs }) => [number, why, arcs]),
      [[4, undefined, [{ number: 2, span: 2 }]]],
    );

    assert.deepStrictEqual(
      view.outside.map(({ number, why }) => [number, why]),
      [[5, 'draft']],
    );

    // Queued counts the boxes the worker may take, the running one aside.
    assert.strictEqual(
      queueSummary(view),
      '3 queued · 1 running · 1 set aside',
    );
  });
});

describe('the boxes that wait', () => {
  const queued = [label('merge-queued')] as const;

  test('come after what they wait for among them, by number otherwise', () => {
    const from = snapshot([
      pull(7, {
        labels: queued,
        mergeState: 'BEHIND',
        body: 'Merge-After: #9',
      }),
      pull(8, {
        labels: queued,
        mergeState: 'BEHIND',
        body: 'Merge-After: #10',
      }),
      pull(9, {
        labels: queued,
        mergeState: 'BEHIND',
        body: 'Merge-After: #10',
      }),
      pull(10, { labels: queued, isDraft: true }),
    ]);

    const view = queueViewOf(decided(from), from);

    assert.deepStrictEqual(
      view.waiting.map(({ number }) => number),
      [8, 9, 7],
    );

    // #9 is ahead of #7: an arc; #10 is not in the row: words.
    assert.deepStrictEqual(
      view.waiting.map(({ number, why, arcs }) => [number, why, arcs]),
      [
        [8, 'after #10', []],
        [9, 'after #10', []],
        [7, undefined, [{ number: 9, span: 1 }]],
      ],
    );
  });

  test('strike out a Merge-After that names no open pull request, with nothing else to say', () => {
    const from = snapshot([
      pull(7, {
        labels: queued,
        mergeState: 'BEHIND',
        body: 'Merge-After: #99',
      }),
    ]);

    const [box] = queueViewOf(decided(from), from).next;

    assert.deepStrictEqual([box?.why, box?.settled], ['after #99', true]);
  });

  test('say conflicts, which goes before a met Merge-After', () => {
    const from = snapshot([
      pull(7, {
        labels: queued,
        mergeState: 'DIRTY',
        body: 'Merge-After: #99',
      }),
    ]);

    const [box] = queueViewOf(decided(from), from).next;

    assert.deepStrictEqual([box?.why, box?.settled], ['conflicts', false]);
  });

  test('keep one in a merge state nothing expects in the row', () => {
    const from = snapshot([pull(7, { labels: queued, mergeState: 'UNKNOWN' })]);

    const view = queueViewOf(decided(from), from);

    assert.deepStrictEqual(
      view.waiting.map(({ number, why }) => [number, why]),
      [[7, 'merge state']],
    );

    assert.isEmpty(view.outside);
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
