import {
  decideQueue,
  type MovedHead,
  type QueueDecision,
  type QueueLayerFacts,
  type WorkflowRoundFacts,
} from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { label, pull, snapshot } from '../../../test/index.mjs';
import { queueSummary, queueViewOf, type QueueView } from './queue-view.mjs';

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
        layers: [layerOf(2, undefined, [])],
      }),
    },
  );

  const view = queueViewOf(decided(from), from, []);

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

    const view = queueViewOf(decided(from), from, []);

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

    const [box] = queueViewOf(decided(from), from, []).next;

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

    const [box] = queueViewOf(decided(from), from, []).next;

    assert.deepStrictEqual([box?.why, box?.settled], ['conflicts', false]);
  });

  test('keep one in a merge state nothing expects in the row', () => {
    const from = snapshot([pull(7, { labels: queued, mergeState: 'UNKNOWN' })]);

    const view = queueViewOf(decided(from), from, []);

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

    const [box] = queueViewOf(decided(from), from, []).next;

    assert.include(box?.bypass ?? '', '@owner is the only owner');
  });
});

describe('a layer checked ahead', () => {
  const queued = [label('merge-queued')] as const;

  const WORKFLOWS = ['code-check.yml', 'style-check.yml'] as const;

  /** Pull requests 2 and 3, both candidates, checked ahead on layers. */
  const viewWith = (
    rounds: ReadonlyRecord<2 | 3, readonly WorkflowRoundFacts[] | undefined>,
    workflows: readonly string[] = WORKFLOWS,
  ): QueueView => {
    const from = snapshot(
      [
        pull(2, { labels: queued, mergeState: 'BEHIND' }),
        pull(3, { labels: queued, mergeState: 'BEHIND' }),
      ],
      [],
      {
        queueLayers: Result.ok({
          baseTree: 'b',
          movedHeads: new Map<number, MovedHead>(),
          layers: [layerOf(2, undefined, rounds[2]), layerOf(3, 2, rounds[3])],
        }),
      },
    );

    return queueViewOf(decided(from), from, workflows);
  };

  test('says how far the runs on a layer have got, and that a green one passed', () => {
    const view = viewWith({
      2: [
        round(2, 'code-check.yml', 'success'),
        round(2, 'style-check.yml', 'success'),
      ],
      3: [
        round(3, 'code-check.yml', 'success'),
        round(3, 'style-check.yml', undefined),
      ],
    });

    assert.deepStrictEqual(
      view.next.map(({ number, layer }) => [
        number,
        layer?.standing,
        layer?.note,
      ]),
      [
        [2, 'green', 'passed'],
        [3, 'running', '1/2 runs'],
      ],
    );

    assert.include(view.next[1]?.layer?.detail ?? '', 'queue/pr-3');

    assert.strictEqual(
      queueSummary(view),
      '2 queued · 0 running · 1 checking ahead · 0 set aside',
    );
  });

  test('takes the latest run of a workflow dispatched again', () => {
    const view = viewWith({
      2: [
        round(2, 'code-check.yml', 'cancelled'),
        round(2, 'code-check.yml', 'success', 2),
        round(2, 'style-check.yml', 'success'),
      ],
      3: [],
    });

    assert.strictEqual(view.next[0]?.layer?.note, 'passed');
  });

  test('says a failed first layer failed and drops the one above it', () => {
    const view = viewWith({
      2: [
        round(2, 'code-check.yml', 'failure'),
        round(2, 'style-check.yml', 'success'),
      ],
      3: [
        round(3, 'code-check.yml', undefined),
        round(3, 'style-check.yml', undefined),
      ],
    });

    assert.deepStrictEqual(
      view.next.map(({ layer }) => [layer?.standing, layer?.note]),
      [
        ['set-aside', 'failed'],
        ['dropped', 'on red'],
      ],
    );
  });

  test('says a layer whose runs are not dispatched is to check', () => {
    const view = viewWith({ 2: [], 3: [] });

    assert.deepStrictEqual(
      view.next.map(({ layer }) => layer?.note),
      ['to check', 'to check'],
    );
  });

  test('draws no layer when the runs on one of them were not read, or no workflow is dispatched on them', () => {
    for (const view of [
      viewWith({ 2: [], 3: undefined }),
      viewWith({ 2: [], 3: [] }, []),
    ]) {
      assert.deepStrictEqual(
        view.next.map(({ checkedAhead, layer }) => [checkedAhead, layer]),
        [
          [true, undefined],
          [true, undefined],
        ],
      );

      assert.notInclude(queueSummary(view), 'checking ahead');
    }
  });
});

describe('the stack kept ahead', () => {
  const queued = [label('merge-queued')] as const;

  const viewOf = (layers: readonly QueueLayerFacts[]): QueueView => {
    const from = snapshot(
      [
        pull(2, { labels: queued, mergeState: 'BEHIND' }),
        pull(3, {
          labels: Arr.toPushed(queued, label('priority:high')),
          mergeState: 'BEHIND',
        }),
      ],
      [],
      {
        queueLayers: Result.ok({
          baseTree: 'b',
          movedHeads: new Map<number, MovedHead>(),
          layers,
        }),
      },
    );

    return queueViewOf(decided(from), from, ['code-check.yml']);
  };

  test('comes first in the order it was stacked, whatever the queue order says', () => {
    const view = viewOf([layerOf(2, undefined, []), layerOf(3, 2, [])]);

    assert.deepStrictEqual(
      view.next.map(({ number, checkedAhead, layer: boxLayer }) => [
        number,
        checkedAhead,
        boxLayer?.standing,
      ]),
      [
        [2, true, 'to-dispatch'],
        [3, true, 'waits'],
      ],
    );
  });

  test('leaves out a layer built from a head its pull request has moved off', () => {
    const stale = {
      ...layerOf(2, undefined, []),
      origin: { number: 2, builtFromHead: 'old' },
    } as const;

    const view = viewOf([stale]);

    assert.deepStrictEqual(
      view.next.map(({ number, checkedAhead }) => [number, checkedAhead]),
      [
        [3, false],
        [2, false],
      ],
    );
  });
});

/**
 * The layer `queue/pr-<number>` built from the fixture's head of that pull
 * request, on the layer of `on` or on the base (tree `b`), its runs `rounds`,
 * or unread.
 */
const layerOf = (
  number: number,
  on: number | undefined,
  rounds: readonly WorkflowRoundFacts[] | undefined,
): QueueLayerFacts =>
  ({
    branch: `queue/pr-${number}`,
    origin: { number, builtFromHead: number.toString(16).padStart(40, '0') },
    sha: `s${number}`,
    tree: `t${number}`,
    parent: on === undefined ? ('tip' as const) : (`s${on}` as const),
    parentTree: on === undefined ? ('b' as const) : (`t${on}` as const),
    committedAt: '2026-11-01T00:00:00Z',
    checks:
      rounds === undefined
        ? Result.err({ kind: 'unavailable', what: 'the runs', message: '502' })
        : Result.ok({ sha: `s${number}`, runs: [], statuses: [], rounds }),
  }) as const;

/** A run the worker dispatched on `queue/pr-<number>`; going without a conclusion. */
const round = (
  number: number,
  workflow: string,
  conclusion: string | undefined,
  attempt = 1,
): WorkflowRoundFacts =>
  ({
    checkSuiteId: number * 100 + attempt,
    runId: number * 1000 + workflow.length * 10 + attempt,
    workflowId: workflow.length,
    completed: conclusion !== undefined,
    attemptStartedAt: '2026-11-01T00:00:00Z',
    headBranch: `queue/pr-${number}`,
    path: `.github/workflows/${workflow}`,
    event: 'workflow_dispatch',
    status:
      conclusion === undefined
        ? ('in_progress' as const)
        : ('completed' as const),
    conclusion,
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
    url: `https://example.com/runs/${number}`,
  }) as const;

const decided = (from: ReturnType<typeof snapshot>): QueueDecision =>
  Result.unwrapThrow(
    decideQueue(from, { nowEpochMs: 0, demoted: new Set<number>() }),
  );
