import {
  asMilestoneId,
  asTaskId,
  createMilestone,
  createTask,
  type DomainState,
  type SortSpec,
} from '../domain/index.mjs';
import { DEFAULT_DIAGRAM_SORT } from '../view-model/index.mjs';
import { diagramTaskIds, sameDiagramOrder } from './diagram-order.mjs';

describe(diagramTaskIds, () => {
  const state: DomainState = {
    tasks: [
      createTask({ id: asTaskId('t1'), title: '結合テスト', now: 0 }),
      createTask({ id: asTaskId('t2'), title: 'API を実装する', now: 0 }),
      createTask({ id: asTaskId('t3'), title: 'あとで', now: 0 }),
    ],
    milestones: [
      createMilestone({ id: asMilestoneId('m'), title: 'リリース', now: 0 }),
    ],
  } as const;

  test('is the tasks alone, as graph node ids, in the order given', () => {
    assert.deepStrictEqual(diagramTaskIds(state, DEFAULT_DIAGRAM_SORT, 0), [
      'task:t2',
      'task:t3',
      'task:t1',
    ]);

    assert.deepStrictEqual(
      diagramTaskIds(state, [{ key: 'title', order: 'desc' }], 0),
      ['task:t1', 'task:t3', 'task:t2'],
    );
  });

  test('is by title ascending for no keys', () => {
    assert.deepStrictEqual(diagramTaskIds(state, [], 0), [
      'task:t2',
      'task:t3',
      'task:t1',
    ]);
  });

  test('is empty for no tasks', () => {
    assert.deepStrictEqual(
      diagramTaskIds({ tasks: [], milestones: [] }, DEFAULT_DIAGRAM_SORT, 0),
      [],
    );
  });

  describe('each key, as the list sorts by it', () => {
    const gate = asMilestoneId('gate');

    // p: in progress, priority 1, due 300, made first, estimate 2, depth 0.
    // q: waits for p to start, so ready; priority 3, due 100, depth 1.
    // r: waits for a milestone dated 5000; priority 2, no due date or
    //    estimate, depth 1.
    // s: waits for q to finish, so blocked; priority 2, due 200, depth 2.
    const graph: DomainState = {
      tasks: [
        createTask({
          id: asTaskId('p'),
          title: 'P',
          now: 1,
          progress: 'in-progress',
          startedAt: 1,
          priority: 1,
          dueDate: 300,
          estimateHours: 2,
        }),
        createTask({
          id: asTaskId('q'),
          title: 'Q',
          now: 4,
          priority: 3,
          dueDate: 100,
          estimateHours: 8,
          dependencies: [
            {
              from: { kind: 'task', id: asTaskId('p') },
              type: 'start-to-start',
              lagMs: 0,
            },
          ],
        }),
        createTask({
          id: asTaskId('r'),
          title: 'R',
          now: 3,
          priority: 2,
          dependencies: [{ from: { kind: 'milestone', id: gate }, lagMs: 0 }],
        }),
        createTask({
          id: asTaskId('s'),
          title: 'S',
          now: 2,
          priority: 2,
          dueDate: 200,
          estimateHours: 1,
          dependencies: [
            {
              from: { kind: 'task', id: asTaskId('q') },
              type: 'finish-to-start',
              lagMs: 0,
            },
          ],
        }),
      ],
      milestones: [
        createMilestone({ id: gate, title: 'Gate', now: 0, date: 5000 }),
      ],
    } as const;

    const ascending = (key: SortSpec['key'], now = 1000): readonly string[] =>
      diagramTaskIds(graph, [{ key, order: 'asc' }], now);

    test.each([
      ['title', ['task:p', 'task:q', 'task:r', 'task:s']],
      ['dueDate', ['task:q', 'task:s', 'task:p', 'task:r']],
      ['priority', ['task:p', 'task:r', 'task:s', 'task:q']],
      ['createdAt', ['task:p', 'task:s', 'task:r', 'task:q']],
      ['updatedAt', ['task:p', 'task:s', 'task:r', 'task:q']],
      ['estimate', ['task:s', 'task:p', 'task:q', 'task:r']],
      ['depth', ['task:p', 'task:q', 'task:r', 'task:s']],
    ] as const)('%s', (key, expected) => {
      assert.deepStrictEqual(ascending(key), expected);
    });

    test('status, at the time given', () => {
      // At 1000: q ready, r and s blocked, p in progress.
      assert.deepStrictEqual(ascending('status', 1000), [
        'task:q',
        'task:r',
        'task:s',
        'task:p',
      ]);

      // Then the title, descending: s ahead of r, both blocked at 1000; at
      // 6000 the milestone is reached, r is ready too, and goes ahead of q.
      assert.deepStrictEqual(
        diagramTaskIds(
          graph,
          [
            { key: 'status', order: 'asc' },
            { key: 'title', order: 'desc' },
          ],
          1000,
        ),
        ['task:q', 'task:s', 'task:r', 'task:p'],
      );

      assert.deepStrictEqual(
        diagramTaskIds(
          graph,
          [
            { key: 'status', order: 'asc' },
            { key: 'title', order: 'desc' },
          ],
          6000,
        ),
        ['task:r', 'task:q', 'task:s', 'task:p'],
      );
    });

    test('depth descending, a tie by id', () => {
      assert.deepStrictEqual(
        diagramTaskIds(graph, [{ key: 'depth', order: 'desc' }], 1000),
        ['task:s', 'task:q', 'task:r', 'task:p'],
      );
    });

    test('several keys, lexicographically', () => {
      assert.deepStrictEqual(
        diagramTaskIds(
          graph,
          [
            { key: 'priority', order: 'desc' },
            { key: 'title', order: 'desc' },
          ],
          1000,
        ),
        ['task:q', 'task:s', 'task:r', 'task:p'],
      );
    });
  });
});

describe(sameDiagramOrder, () => {
  test('is whether the same ids come in the same order', () => {
    assert.isTrue(sameDiagramOrder(['task:a', 'task:b'], ['task:a', 'task:b']));

    assert.isTrue(sameDiagramOrder([], []));

    assert.isFalse(
      sameDiagramOrder(['task:a', 'task:b'], ['task:b', 'task:a']),
    );

    assert.isFalse(sameDiagramOrder(['task:a'], ['task:a', 'task:b']));
  });
});
