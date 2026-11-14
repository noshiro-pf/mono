import {
  BLOCKS_RELEASE_LABEL,
  MERGE_QUEUED_LABEL,
  PRIORITY_HIGH_LABEL,
  PRIORITY_LOW_LABEL,
  PRIORITY_MID_LABEL,
  SKIP_CI_LABEL,
  writeClaimComment,
  writeSetAsideComment,
  type ChecksSummary,
  type ContextState,
  type ReportEntry,
} from 'pr-report-core';
import { Arr } from 'ts-data-forge';
import {
  queueViewOf,
  type CheckedQueueLayer,
  type LayerChecks,
  type QueuePull,
  type QueueView,
} from './queue-view.mjs';

describe(queueViewOf, () => {
  test('leaves out what never asked to be queued', () => {
    assert.deepStrictEqual(
      shape(queueViewOf(input([pull(1, { labels: [] })]))),
      { slots: [], outside: [] },
    );
  });

  test('puts the running one first, then the candidates in the order the worker picks them', () => {
    const view = queueViewOf(
      input([
        pull(1, { labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] }),
        pull(2, { labels: [MERGE_QUEUED_LABEL], verdict: 'pending' }),
        pull(3, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL, PRIORITY_HIGH_LABEL],
        }),
        pull(4, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          mergeable: 'CONFLICTING',
        }),
      ]),
    );

    assert.deepStrictEqual(shape(view).slots, [
      [2, 'running', undefined],
      [3, 'next', undefined],
      [1, 'next', undefined],
      [4, 'next', 'conflicts'],
    ]);
  });

  // #3714: `unblock-prs` releases what it has stacked first, in the order it
  // stacked it, whatever has joined the queue ahead of it since.
  test('picks first what the worker has stacked, in its order, saying so', () => {
    const queued = [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] as const;

    const pulls = [
      pull(2, { labels: Arr.toPushed(queued, PRIORITY_HIGH_LABEL) }),
      pull(5, { labels: queued }),
      pull(7, { labels: queued }),
      pull(9, { labels: queued }),
    ] as const;

    const layer = (
      number: number,
      below: Readonly<{ tip: string; tree: string }>,
    ): CheckedQueueLayer =>
      ({
        number,
        head: sha(number),
        tip: `tip-${number}`,
        tree: `tree-${number}`,
        parent: below.tip,
        parentTree: below.tree,
        builtAt: NOW_MS,
        checks: undefined,
      }) as const;

    // #9 on #5 on the default branch, stacked before #2 gained priority:high.
    const built = [
      layer(5, { tip: BASE_TIP, tree: 'main-tree' }),
      layer(9, { tip: 'tip-5', tree: 'tree-5' }),
    ] as const;

    assert.deepStrictEqual(
      shape(
        queueViewOf({
          ...input(pulls),
          layers: { built, baseTree: 'main-tree' },
        }),
      ).slots,
      [
        [5, 'next', 'checked ahead'],
        [9, 'next', 'checked ahead'],
        [2, 'next', undefined],
        [7, 'next', undefined],
      ],
    );

    // Without the layers, or on a tree they no longer stand on, the queue's own.
    for (const layers of [
      undefined,
      { built, baseTree: 'another-tree' },
    ] as const) {
      assert.deepStrictEqual(
        shape(queueViewOf({ ...input(pulls), layers })).slots.map(
          ([number]) => number,
        ),
        [2, 5, 7, 9],
      );
    }
  });

  // The layers' runs are what the worker is running while what it has stacked
  // waits with `skip-ci` on, so each box says what the worker does with its
  // layer, decided over the whole stack (`layerStandings` in pr-report-core).
  test('says what the worker does with each layer, and how far its runs have got', () => {
    const cases = [
      {
        stack: [GREEN_LAYER, RUNNING_LAYER, NOT_DISPATCHED_LAYER],
        says: [
          [
            'passed',
            'green',
            'queue/pr-3: all 6 workflow runs passed — the worker releases it with no run of its own',
          ],
          ['2/6 runs', 'running', 'queue/pr-5: 2 of 6 workflow runs finished'],
          [
            'to check',
            'waits',
            'queue/pr-7: the worker dispatches its checks once every layer below is green or has started all its jobs, and none is red',
          ],
        ],
      },
      {
        stack: [GREEN_LAYER, NOT_DISPATCHED_LAYER, NOT_DISPATCHED_LAYER],
        says: [
          ['passed', 'green', undefined],
          [
            'to check',
            'to-dispatch',
            'queue/pr-5: the worker dispatches its checks on its next survey',
          ],
          ['to check', 'waits', undefined],
        ],
      },
      {
        stack: [RED_LAYER, GREEN_LAYER],
        says: [
          [
            'failed',
            'set-aside',
            "queue/pr-3: a workflow run failed, so the worker sets it aside — or releases it, when only fixers' diffs failed, for the release's own run to fix",
          ],
          [
            'on red',
            'dropped',
            'queue/pr-5: a layer below failed, so the worker drops this one and builds it again later',
          ],
        ],
      },
      {
        stack: [RUNNING_LAYER, RED_LAYER, RUNNING_LAYER],
        says: [
          ['2/6 runs', 'running', undefined],
          [
            'failed',
            'red',
            'queue/pr-5: a workflow run failed on top of layers not merged yet — the worker judges it once it is first',
          ],
          // Its failure may be the running layer's below: nothing is dropped.
          ['2/6 runs', 'running', undefined],
        ],
      },
      {
        // Nothing is dispatched on top of a red layer, whoever's it is.
        stack: [RUNNING_LAYER, RED_LAYER, NOT_DISPATCHED_LAYER],
        says: [
          ['2/6 runs', 'running', undefined],
          ['failed', 'red', undefined],
          ['to check', 'waits', undefined],
        ],
      },
      {
        stack: [
          GREEN_LAYER,
          { ...NOT_DISPATCHED_LAYER, cancelledTooOften: true },
        ],
        says: [
          ['passed', 'green', undefined],
          [
            'not checked',
            'stalled',
            'queue/pr-5: a workflow was cancelled too often to dispatch again — once first, the worker releases it to run its own checks',
          ],
        ],
      },
      {
        stack: [{ ...NOT_DISPATCHED_LAYER, cancelledTooOften: true }],
        says: [
          [
            'not checked',
            'stalled',
            'queue/pr-3: a workflow was cancelled too often to dispatch again — the worker releases it to run its own checks',
          ],
        ],
      },
    ] as const;

    for (const { stack, says } of cases) {
      const view = stackView(stack);

      assert.deepStrictEqual(
        view.slots.map(({ kind }) => kind),
        stack.map(() => 'next'),
      );

      assert.deepStrictEqual(
        view.slots.map(({ note, layer }) => [note, layer?.standing]),
        says.map(([note, standing]) => [note, standing]),
      );

      for (const [index, said] of says.entries()) {
        if (said[2] !== undefined) {
          assert.strictEqual(view.slots[index]?.detail, said[2]);
        }
      }
    }
  });

  // What the worker does with a layer turns on the ones below it.
  test('says no more than "checked ahead" of a stack with a layer whose checks were not read', () => {
    assert.deepStrictEqual(
      stackView([GREEN_LAYER, undefined]).slots.map(({ note, layer }) => [
        note,
        layer,
      ]),
      [
        ['checked ahead', undefined],
        ['checked ahead', undefined],
      ],
    );
  });

  test('says no more than "checked ahead" of a layer whose checks were not read', () => {
    const view = queueViewOf({
      ...input([pull(5, { labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] })]),
      layers: {
        built: [
          {
            number: 5,
            head: sha(5),
            tip: 'tip-5',
            tree: 'tree-5',
            parent: BASE_TIP,
            parentTree: 'main-tree',
            builtAt: NOW_MS,
            checks: undefined,
          },
        ],
        baseTree: 'main-tree',
      },
    });

    assert.deepStrictEqual(
      view.slots.map(({ note, layer }) => [note, layer]),
      [['checked ahead', undefined]],
    );
  });

  // The worker checks #6 right above #5, the one it is stacked on, and releases
  // it once #5 has merged, ahead of #2's priority:high.
  test('picks one stacked on a layer it has stacked in its place in the stack', () => {
    const queued = [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] as const;

    const pulls = [
      pull(2, { labels: Arr.toPushed(queued, PRIORITY_HIGH_LABEL) }),
      pull(5, { labels: queued }),
      pull(6, { labels: queued, baseRef: 'branch-5' }),
      pull(7, { labels: queued }),
    ] as const;

    const built = [
      {
        number: 5,
        head: sha(5),
        tip: 'tip-5',
        tree: 'tree-5',
        parent: BASE_TIP,
        parentTree: 'main-tree',
        builtAt: NOW_MS,
        checks: undefined,
      },
      {
        number: 6,
        head: sha(6),
        tip: 'tip-6',
        tree: 'tree-6',
        parent: 'tip-5',
        parentTree: 'tree-5',
        builtAt: NOW_MS,
        checks: undefined,
      },
    ] as const satisfies readonly CheckedQueueLayer[];

    assert.deepStrictEqual(
      shape(
        queueViewOf({
          ...input(pulls),
          layers: { built, baseTree: 'main-tree' },
        }),
      ).slots.map(([number]) => number),
      [5, 6, 2, 7],
    );

    assert.deepStrictEqual(
      shape(queueViewOf({ ...input(pulls), layers: undefined })).slots.map(
        ([number]) => number,
      ),
      [2, 5, 6, 7],
    );
  });

  // Releasing #5 rebased it and restacked #6 on its new head, which has the
  // tree #6's layer was checked with; #5 has merged since.
  test('keeps a layer whose pull request moved to a head with its tree', () => {
    const queued = [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] as const;

    const built = [
      {
        number: 6,
        head: sha(60),
        tip: 'tip-6',
        tree: 'tree-6',
        parent: 'tip-5',
        parentTree: 'main-tree',
        builtAt: NOW_MS,
        checks: undefined,
      },
    ] as const satisfies readonly CheckedQueueLayer[];

    const slots = (headTree: string): readonly number[] =>
      shape(
        queueViewOf({
          ...input([
            pull(2, { labels: Arr.toPushed(queued, PRIORITY_HIGH_LABEL) }),
            pull(6, { labels: queued, headTree }),
          ]),
          layers: { built, baseTree: 'main-tree' },
        }),
      ).slots.map(([number]) => number);

    assert.deepStrictEqual(slots('tree-6'), [6, 2]);

    assert.deepStrictEqual(slots('tree-6-pushed'), [2, 6]);
  });

  test('takes one behind its base as a candidate, and one up to date with a failed check as failing', () => {
    const view = queueViewOf(
      input([
        pull(1, { labels: [MERGE_QUEUED_LABEL], behindBy: 2 }),
        pull(2, { labels: [MERGE_QUEUED_LABEL], verdict: 'failing' }),
      ]),
    );

    assert.deepStrictEqual(shape(view).slots, [
      [1, 'next', undefined],
      [2, 'failing', 'failing'],
    ]);
  });

  test('puts what waits for another pull request after the candidates, saying what for', () => {
    const view = queueViewOf(
      input([
        pull(1, { labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] }),
        pull(2, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          body: 'Merge-After: #1',
        }),
        pull(3, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          baseRef: 'branch-1',
        }),
      ]),
    );

    assert.deepStrictEqual(shape(view).slots, [
      [1, 'next', undefined],
      [2, 'waiting', undefined],
      [3, 'waiting', undefined],
    ]);
  });

  test('draws a wait on a box ahead in the row as an arc, and says only what is not ahead', () => {
    const view = queueViewOf(
      input([
        pull(1, { labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] }),
        pull(2, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          body: 'Merge-After: #1, #5',
        }),
        pull(3, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          baseRef: 'branch-1',
        }),
        pull(4, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          body: 'Merge-After: #6',
        }),
        // Open, and not queued.
        pull(5, { labels: [] }),
        // Queued, and moved ahead of #4, which waits for it.
        pull(6, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          body: 'Merge-After: #5',
        }),
      ]),
    );

    assert.deepStrictEqual(
      view.slots.map(({ number, note, arcs }) => [number, note, arcs]),
      [
        [1, undefined, []],
        // Its turn comes once #1 merges.
        [3, undefined, [{ number: 1, span: 1 }]],
        [2, 'after #5', [{ number: 1, span: 2 }]],
        [6, 'after #5', []],
        [4, undefined, [{ number: 6, span: 1 }]],
      ],
    );
  });

  test('puts what waits after what it waits for when neither is picked, a chain included', () => {
    const view = queueViewOf(
      input([
        // Open, and not queued: nothing below is ever picked.
        pull(1, { labels: [] }),
        pull(2, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          body: 'Merge-After: #7',
        }),
        pull(3, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          body: 'Merge-After: #1',
        }),
        pull(4, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          body: 'Merge-After: #6',
        }),
        pull(5, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          body: 'Merge-After: #3',
        }),
        pull(6, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          body: 'Merge-After: #1',
        }),
        pull(7, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          baseRef: 'branch-6',
        }),
      ]),
    );

    assert.deepStrictEqual(
      view.slots.map(({ number, note, arcs }) => [number, note, arcs]),
      [
        [3, 'after #1', []],
        [5, undefined, [{ number: 3, span: 1 }]],
        [6, 'after #1', []],
        [4, undefined, [{ number: 6, span: 1 }]],
        [7, undefined, [{ number: 6, span: 2 }]],
        [2, undefined, [{ number: 7, span: 1 }]],
      ],
    );
  });

  test('strikes out what a pull request declared it merges after once that is no longer open', () => {
    const view = queueViewOf(
      input([
        pull(1, { labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] }),
        // #8 and #9 are merged or closed.
        pull(2, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          body: 'Merge-After: #9',
        }),
        pull(3, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          body: 'Merge-After: #1, #8, #9',
        }),
        pull(4, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          body: 'Merge-After: #9',
          mergeable: 'CONFLICTING',
        }),
      ]),
    );

    assert.deepStrictEqual(
      view.slots.map(({ number, kind, note, noteSettled, detail }) => [
        number,
        kind,
        note,
        noteSettled,
        detail,
      ]),
      [
        [1, 'next', undefined, false, undefined],
        [
          2,
          'next',
          'after #9',
          true,
          'Merge-After: #9 is merged, closed or not a pull request: not a blocker',
        ],
        // What it still waits for, ahead of it, is kept in the detail, which is
        // what a screen reader reads for the arc.
        [
          3,
          'waiting',
          'after #8 +1',
          true,
          'Merge-After: #1; #8, #9 are merged, closed or not a pull request: not a blocker',
        ],
        [4, 'next', 'conflicts', false, undefined],
      ],
    );
  });

  // What blocks is any open pull request, as the worker reads it: one that is
  // not queued, or a draft, is waited for like a queued one.
  test('strikes out nothing that is open, queued or not', () => {
    const view = queueViewOf(
      input([
        pull(5, { labels: [] }),
        pull(6, { labels: [], isDraft: true }),
        pull(7, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          body: 'Merge-After: #5, #6',
        }),
      ]),
    );

    assert.deepStrictEqual(
      view.slots.map(({ number, kind, note, noteSettled }) => [
        number,
        kind,
        note,
        noteSettled,
      ]),
      [[7, 'waiting', 'after #5 +1', false]],
    );
  });

  test('says where the checks on its layer stand of a stacked layer whose wait is an arc', () => {
    const queued = [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] as const;

    const layer = (
      number: number,
      below: Readonly<{ tip: string; tree: string }>,
      checks: LayerChecks,
    ): CheckedQueueLayer =>
      ({
        number,
        head: sha(number),
        tip: `tip-${number}`,
        tree: `tree-${number}`,
        parent: below.tip,
        parentTree: below.tree,
        builtAt: NOW_MS,
        checks,
      }) as const;

    const view = queueViewOf({
      ...input([
        pull(5, { labels: queued }),
        pull(6, { labels: queued, baseRef: 'branch-5' }),
      ]),
      layers: {
        baseTree: 'main-tree',
        built: [
          layer(5, { tip: BASE_TIP, tree: 'main-tree' }, GREEN_LAYER),
          layer(6, { tip: 'tip-5', tree: 'tree-5' }, RUNNING_LAYER),
        ],
      },
    });

    assert.deepStrictEqual(
      view.slots.map(({ number, note, arcs }) => [number, note, arcs]),
      [
        [5, 'passed', []],
        [6, '2/6 runs', [{ number: 5, span: 1 }]],
      ],
    );

    // Its layer's checks not read, it says it is checked ahead, and why.
    const unread = queueViewOf({
      ...input([
        pull(5, { labels: queued }),
        pull(6, { labels: queued, baseRef: 'branch-5' }),
      ]),
      layers: {
        baseTree: 'main-tree',
        built: [
          layer(5, { tip: BASE_TIP, tree: 'main-tree' }, GREEN_LAYER),
          {
            ...layer(6, { tip: 'tip-5', tree: 'tree-5' }, GREEN_LAYER),
            checks: undefined,
          },
        ],
      },
    });

    assert.deepStrictEqual(
      unread.slots.map(({ number, note, detail }) => [number, note, detail]),
      [
        [5, 'checked ahead', KEPT_AHEAD_DETAIL],
        [6, 'checked ahead', `stacked on #5; ${KEPT_AHEAD_DETAIL}`],
      ],
    );
  });

  test('puts one whose wait ends when the ones ahead of it merge where it would then be picked', () => {
    const view = queueViewOf(
      input([
        pull(1, { labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] }),
        pull(2, { labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] }),
        pull(3, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL, PRIORITY_HIGH_LABEL],
          body: 'Merge-After: #1',
        }),
        pull(4, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          baseRef: 'branch-1',
        }),
        pull(5, { labels: [MERGE_QUEUED_LABEL], verdict: 'failing' }),
        pull(6, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL, PRIORITY_HIGH_LABEL],
          body: 'Merge-After: #5',
        }),
        pull(7, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL, PRIORITY_HIGH_LABEL],
          body: 'Merge-After: #3',
        }),
      ]),
    );

    assert.deepStrictEqual(shape(view).slots, [
      [1, 'next', undefined],
      [3, 'waiting', undefined],
      [7, 'waiting', undefined],
      [2, 'next', undefined],
      [4, 'waiting', undefined],
      [5, 'failing', 'failing'],
      [6, 'waiting', undefined],
    ]);
  });

  test('counts the running one as merged first', () => {
    const view = queueViewOf(
      input([
        pull(1, { labels: [MERGE_QUEUED_LABEL], verdict: 'pending' }),
        pull(2, { labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] }),
        pull(3, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL, PRIORITY_HIGH_LABEL],
          body: 'Merge-After: #1',
        }),
        pull(4, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          body: 'Merge-After: #9',
        }),
      ]),
    );

    assert.deepStrictEqual(shape(view).slots, [
      [1, 'running', undefined],
      [3, 'waiting', undefined],
      [2, 'next', undefined],
      [4, 'next', 'after #9'],
    ]);
  });

  test('puts the release after what blocks it once that would have merged', () => {
    const view = queueViewOf(
      input([
        pull(1, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          headRef: 'changeset-release/main',
        }),
        pull(2, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL, BLOCKS_RELEASE_LABEL],
        }),
        pull(3, { labels: [MERGE_QUEUED_LABEL], verdict: 'failing' }),
      ]),
    );

    assert.deepStrictEqual(shape(view).slots, [
      [2, 'next', undefined],
      [1, 'waiting', 'release'],
      [3, 'failing', 'failing'],
    ]);

    assert.deepStrictEqual(
      view.slots.map(({ arcs, detail }) => [arcs, detail]),
      [
        [[], undefined],
        [[{ number: 2, span: 1 }], 'held by blocks-release on #2'],
        [[], 'a required check failed'],
      ],
    );
  });

  test('puts the release after what blocks it when that is never picked', () => {
    const view = queueViewOf(
      input([
        pull(1, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          headRef: 'changeset-release/main',
        }),
        pull(2, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL, BLOCKS_RELEASE_LABEL],
          body: 'Merge-After: #3',
        }),
        // Open, and not queued.
        pull(3, { labels: [] }),
      ]),
    );

    assert.deepStrictEqual(
      view.slots.map(({ number, note, arcs }) => [number, note, arcs]),
      [
        [2, 'after #3', []],
        [1, 'release', [{ number: 2, span: 1 }]],
      ],
    );
  });

  test('moves each layer of a stack onto the default branch as the one below it would merge', () => {
    const view = queueViewOf(
      input([
        pull(1, { labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] }),
        pull(2, { labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] }),
        pull(3, {
          labels: [MERGE_QUEUED_LABEL, PRIORITY_HIGH_LABEL],
          baseRef: 'branch-1',
        }),
        pull(4, {
          labels: [MERGE_QUEUED_LABEL, PRIORITY_HIGH_LABEL],
          baseRef: 'branch-3',
        }),
      ]),
    );

    assert.deepStrictEqual(shape(view).slots, [
      [1, 'next', undefined],
      [3, 'waiting', undefined],
      [4, 'waiting', undefined],
      [2, 'next', undefined],
    ]);
  });

  test('leaves waiting what waits for one only a bypass merges, or that its review would hold', () => {
    const view = queueViewOf(
      input(
        [
          pull(1, {
            labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
            files: ['.github/workflows/ci.yml'],
          }),
          pull(2, {
            labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
            body: 'Merge-After: #1',
          }),
          pull(3, { labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] }),
          pull(4, {
            labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
            body: 'Merge-After: #3',
            unresolvedConversations: 1,
          }),
        ],
        {
          requireCodeOwnerReview: true,
          requireConversationResolution: true,
          codeOwners: [{ pattern: '/.github/workflows/', owners: ['someone'] }],
        },
      ),
    );

    assert.deepStrictEqual(shape(view).slots, [
      [3, 'next', undefined],
      [1, 'next', undefined],
      [2, 'waiting', undefined],
      [4, 'waiting', undefined],
    ]);
  });

  test('leaves waiting a layer its set-aside would hand to someone else once it lands', () => {
    const view = queueViewOf(
      input([
        pull(1, { labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] }),
        pull(2, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL, PRIORITY_HIGH_LABEL],
          baseRef: 'branch-1',
          comments: [
            writeSetAsideComment(
              { reason: 'checks-failed', headSha: sha(2), baseSha: BASE_TIP },
              'Red.',
            ),
          ],
        }),
        pull(3, { labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] }),
      ]),
    );

    assert.deepStrictEqual(shape(view).slots, [
      [1, 'next', undefined],
      [3, 'next', undefined],
      [2, 'waiting', undefined],
    ]);
  });

  test('puts a release built before the tip after the first merge, which rebuilds it', () => {
    const release = pull(4, {
      labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
      headRef: 'changeset-release/main',
      behindBy: 1,
    });

    assert.deepStrictEqual(
      shape(
        queueViewOf(
          input([
            release,
            pull(2, { labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] }),
            pull(3, { labels: [MERGE_QUEUED_LABEL], verdict: 'failing' }),
          ]),
        ),
      ).slots,
      [
        [2, 'next', undefined],
        [4, 'waiting', 'rebuilding'],
        [3, 'failing', 'failing'],
      ],
    );
  });

  test('puts a release not yet compared with the tip after the first merge, which rebuilds it', () => {
    const release = queuePull(
      pull(4, {
        labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
        headRef: 'changeset-release/main',
      }),
    );

    const others = input([
      pull(2, { labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] }),
      pull(3, { labels: [MERGE_QUEUED_LABEL], verdict: 'failing' }),
    ]);

    const view = queueViewOf({
      ...others,
      pulls: Arr.toPushed(others.pulls, {
        ...release,
        entry: { ...release.entry, comparison: undefined },
      }),
    });

    assert.deepStrictEqual(shape(view).slots, [
      [2, 'next', undefined],
      [4, 'waiting', 'unknown'],
      [3, 'failing', 'failing'],
    ]);
  });

  test('takes a layer back that a moved base clears the set-aside of once it lands', () => {
    const view = queueViewOf(
      input([
        pull(1, { labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] }),
        pull(2, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL, PRIORITY_HIGH_LABEL],
          baseRef: 'branch-1',
          comments: [
            writeSetAsideComment(
              { reason: 'rebase-failed', headSha: sha(2), baseSha: BASE_TIP },
              'Conflicts.',
            ),
          ],
        }),
        pull(3, { labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] }),
      ]),
    );

    assert.deepStrictEqual(shape(view).slots, [
      [1, 'next', undefined],
      [2, 'waiting', undefined],
      [3, 'next', undefined],
    ]);
  });

  test('marks the release, and holds it for what blocks it', () => {
    const release = pull(1, {
      labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
      headRef: 'changeset-release/main',
    });

    assert.deepStrictEqual(shape(queueViewOf(input([release]))).slots, [
      [1, 'next', 'release'],
    ]);

    assert.deepStrictEqual(
      shape(
        queueViewOf(
          input([release, pull(2, { labels: [BLOCKS_RELEASE_LABEL] })]),
        ),
      ).slots,
      [[1, 'waiting', 'after #2']],
    );

    assert.deepStrictEqual(
      shape(queueViewOf(input([{ ...release, behindBy: 1 }]))).slots,
      [[1, 'waiting', 'rebuilding']],
    );
  });

  test('holds one its review holds', () => {
    const view = queueViewOf(
      input(
        [
          pull(1, {
            labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
            unresolvedConversations: 1,
          }),
        ],
        { requireConversationResolution: true },
      ),
    );

    assert.deepStrictEqual(
      view.slots.map(({ kind, note, detail }) => [kind, note, detail]),
      [['waiting', 'review', '1 unresolved review conversation']],
    );
  });

  // The worker would release it, see it green, set it aside for a person, and
  // have spent the cycle on nothing that merges on its own.
  test('puts a candidate only a bypass merges with priority:low', () => {
    const view = queueViewOf(
      input(
        [
          pull(1, {
            labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
            files: ['.github/workflows/ci.yml'],
          }),
          pull(2, {
            labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL, PRIORITY_LOW_LABEL],
          }),
          pull(3, { labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] }),
        ],
        {
          requireCodeOwnerReview: true,
          codeOwners: [{ pattern: '/.github/workflows/', owners: ['someone'] }],
        },
      ),
    );

    assert.deepStrictEqual(shape(view).slots, [
      [3, 'next', undefined],
      [1, 'next', undefined],
      [2, 'next', undefined],
    ]);
  });

  test('passes over one in a native stack', () => {
    assert.deepStrictEqual(
      shape(
        queueViewOf(
          input([
            pull(1, {
              labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
              autoMerge: false,
              nativeStack: { stack: 9, position: 1, size: 2 },
            }),
          ]),
        ),
      ).slots,
      [[1, 'waiting', 'native stack']],
    );
  });

  test('puts what is set aside, claimed or a draft outside the queue, with whose it is', () => {
    const view = queueViewOf(
      input([
        pull(1, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          comments: [
            writeSetAsideComment(
              { reason: 'rebase-failed', headSha: sha(1), baseSha: BASE_TIP },
              'Conflicts.',
            ),
          ],
        }),
        pull(2, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          comments: [
            writeSetAsideComment(
              {
                reason: 'awaiting-bypass',
                headSha: sha(2),
                baseSha: OLDER_BASE,
              },
              'Green.',
            ),
          ],
        }),
        pull(3, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          comments: [
            writeClaimComment(
              {
                headSha: sha(3),
                by: 'https://claude.ai/code/session_1',
                at: NOW_ISO,
              },
              'Fixing it.',
            ),
          ],
        }),
        pull(4, { labels: [MERGE_QUEUED_LABEL], isDraft: true }),
      ]),
    );

    assert.deepStrictEqual(
      view.outside.map(({ number, reason, owner }) => [number, reason, owner]),
      [
        [1, 'conflict', 'skill'],
        [2, 'bypass', 'you'],
        [3, 'claimed', 'skill'],
        [4, 'draft', 'you'],
      ],
    );

    assert.deepStrictEqual(view.slots, []);
  });

  // A conflict recorded against a base that has since moved is the worker's to
  // try again, as its next survey does.
  test('takes back one set aside for a reason the base moved under', () => {
    const view = queueViewOf(
      input([
        pull(1, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          comments: [
            writeSetAsideComment(
              { reason: 'rebase-failed', headSha: sha(1), baseSha: OLDER_BASE },
              'Conflicts.',
            ),
          ],
        }),
      ]),
    );

    assert.deepStrictEqual(shape(view), {
      slots: [[1, 'next', undefined]],
      outside: [],
    });
  });

  test('reads every priority label for its pill, mid included', () => {
    const view = queueViewOf(
      input([
        pull(1, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL, PRIORITY_MID_LABEL],
        }),
        pull(2, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL, PRIORITY_LOW_LABEL],
        }),
      ]),
    );

    assert.deepStrictEqual(
      view.slots.map(({ number, priority }) => [number, priority]),
      [
        [1, 'mid'],
        [2, 'low'],
      ],
    );
  });
});

/** Each slot as number, kind and note; each node outside as number. */
const GREEN_LAYER: LayerChecks = {
  status: { kind: 'green' },
  cancelledTooOften: false,
  done: 6,
  total: 6,
} as const;

/** Running, its jobs not known to have all started, as the page reads it. */
const RUNNING_LAYER: LayerChecks = {
  status: { kind: 'running', queued: true },
  cancelledTooOften: false,
  done: 2,
  total: 6,
} as const;

const NOT_DISPATCHED_LAYER: LayerChecks = {
  status: { kind: 'not-dispatched' },
  cancelledTooOften: false,
  done: 0,
  total: 6,
} as const;

const RED_LAYER: LayerChecks = {
  status: { kind: 'red', name: 'code-check.yml', link: 'L' },
  cancelledTooOften: false,
  done: 6,
  total: 6,
} as const;

/** A head, as the 40 hexadecimal digits the comments' records insist on. */
const sha = (number: number): string => number.toString(16).padStart(40, '0');

const entry = (fields: PullFields): ReportEntry =>
  ({
    number: fields.number,
    title: `Pull request ${fields.number}`,
    body: fields.body,
    author: 'someone',
    isDraft: fields.isDraft,
    labels: fields.labels.map((labelName) => ({
      name: labelName,
      color: 'ededed',
      description: '',
    })),
    autoMerge: fields.autoMerge,
    headRef: fields.headRef,
    headSha: sha(fields.number),
    baseRef: fields.baseRef,
    fromFork: false,
    url: `https://github.com/noshiro-pf/mono/pull/${fields.number}`,
    updatedAt: NOW_ISO,
    headCommittedAt: undefined,
    comparison: { aheadBy: 1, behindBy: fields.behindBy },
    reported: new Map<string, ContextState>(),
    checksRunning: false,
    linkedIssues: [],
    mergeAfter: [],
    stackedOn: undefined,
    inheritedMergeAfter: [],
    notStartedIssues: [],
    blockedBy: [],
    checks: {
      verdict: fields.verdict,
      passed: [],
      failed: [],
      pending: [],
      skipped: [],
      missing: [],
      notRun: [],
      required: 0,
    },
  }) as const;

const queuePull = (fields: PullFields): QueuePull =>
  ({
    entry: entry(fields),
    baseTip: BASE_TIP,
    headTree: fields.headTree,
    mergeable: fields.mergeable,
    nativeStack: fields.nativeStack,
    review: {
      author: 'someone',
      approvers: [],
      files: fields.files,
      filesComplete: true,
      unresolvedConversations: fields.unresolvedConversations,
    },
    ownComments: fields.comments,
  }) as const;

const input = (
  pulls: readonly PullFields[],
  rules: Partial<Parameters<typeof queueViewOf>[0]['rules']> = {},
): Parameters<typeof queueViewOf>[0] =>
  ({
    defaultBranch: 'main',
    nowEpochMs: NOW_MS,
    rules: {
      requireCodeOwnerReview: false,
      requireConversationResolution: false,
      codeOwners: [],
      ...rules,
    },
    pulls: pulls.map(queuePull),
  }) as const;

const pull = (number: number, fields: Partial<PullFields> = {}): PullFields =>
  ({
    number,
    labels: [MERGE_QUEUED_LABEL],
    isDraft: false,
    body: '',
    headRef: `branch-${number}`,
    baseRef: 'main',
    autoMerge: true,
    verdict: 'passed',
    behindBy: 0,
    mergeable: 'MERGEABLE',
    nativeStack: undefined,
    unresolvedConversations: 0,
    files: [],
    comments: [],
    headTree: undefined,
    ...fields,
  }) as const;

/**
 * The queue of one candidate per layer of `stack`, #3, #5, #7 and on, each
 * stacked on the one before with those checks on it.
 */
const stackView = (stack: readonly (LayerChecks | undefined)[]): QueueView => {
  const numbers = stack.map((_, index) => 3 + 2 * index);

  return queueViewOf({
    ...input(
      numbers.map((number) =>
        pull(number, { labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] }),
      ),
    ),
    layers: {
      baseTree: 'main-tree',
      built: numbers.map(
        (number, index): CheckedQueueLayer =>
          ({
            number,
            head: sha(number),
            tip: `tip-${number}`,
            tree: `tree-${number}`,
            parent: index === 0 ? BASE_TIP : `tip-${numbers[index - 1]}`,
            parentTree:
              index === 0 ? 'main-tree' : `tree-${numbers[index - 1]}`,
            builtAt: NOW_MS,
            checks: stack[index],
          }) as const,
      ),
    },
  });
};

const shape = (
  view: QueueView,
): Readonly<{
  slots: readonly (readonly [number, string, string | undefined])[];
  outside: readonly number[];
}> =>
  ({
    slots: view.slots.map(({ number, kind, note }) => [number, kind, note]),
    outside: view.outside.map(({ number }) => number),
  }) as const;

const BASE_TIP = 'b'.repeat(40);

const KEPT_AHEAD_DETAIL =
  'its queue layer is built, so the worker releases it before what the queue’s own order would put first';

const OLDER_BASE = 'a'.repeat(40);

const NOW_ISO = '2026-10-16T00:00:00Z';

/** {@link NOW_ISO}, in milliseconds. */
const NOW_MS = 1_792_108_800_000;

type PullFields = Readonly<{
  number: number;
  labels: readonly string[];
  isDraft: boolean;
  body: string;
  headRef: string;
  baseRef: string;
  autoMerge: boolean;
  verdict: ChecksSummary['verdict'];
  behindBy: number;
  mergeable: string;
  nativeStack: QueuePull['nativeStack'];
  unresolvedConversations: number;
  files: readonly string[];
  comments: readonly string[];
  headTree: string | undefined;
}>;
