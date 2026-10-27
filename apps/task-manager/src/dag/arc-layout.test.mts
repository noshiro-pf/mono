import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  asMilestoneId,
  asTaskId,
  createMilestone,
  createTask,
  type Dependency,
  type DomainState,
  type GraphNodeId,
} from '../domain/index.mjs';
import { ARC_NODE_GAP, arcDiagramIds, arcDiagramNodes } from './arc-layout.mjs';
import {
  COMPACT_MILESTONE_NODE_SIZE,
  COMPACT_TASK_NODE_SIZE,
  MILESTONE_NODE_SIZE,
  TASK_NODE_SIZE,
} from './graph-layout.mjs';

const onTask = (id: string): Dependency =>
  ({
    from: { kind: 'task', id: asTaskId(id) },
    type: 'finish-to-start',
    lagMs: 0,
  }) as const;

const onMilestone = (id: string): Dependency =>
  ({
    from: { kind: 'milestone', id: asMilestoneId(id) },
    lagMs: 0,
  }) as const;

const task = (
  id: string,
  dependencies: readonly Dependency[] = [],
): DomainState['tasks'][number] =>
  createTask({ id: asTaskId(id), title: id, now: 0, dependencies });

const milestone = (
  id: string,
  dependencies: readonly Dependency[] = [],
): DomainState['milestones'][number] =>
  createMilestone({ id: asMilestoneId(id), title: id, now: 0, dependencies });

/** The tasks `a` to `d`, with the dependencies given for each. */
const tasks = (
  dependencies: ReadonlyRecord<string, readonly Dependency[]> = {},
): DomainState['tasks'] =>
  ['a', 'b', 'c', 'd'].map((id) => task(id, dependencies[id]));

describe(arcDiagramIds, () => {
  // The tasks in the order the diagrams share (`diagram-order.mts`).
  const order: readonly GraphNodeId[] = [
    'task:a',
    'task:b',
    'task:c',
    'task:d',
  ] as const;

  test('is the tasks in their order when there are no milestones', () => {
    assert.deepStrictEqual(
      arcDiagramIds(order, { tasks: tasks(), milestones: [] }),
      order,
    );
  });

  test('puts a milestone just above the first task that waits for it', () => {
    const state: DomainState = {
      tasks: tasks({ b: [onMilestone('m')], d: [onMilestone('m')] }),
      milestones: [milestone('m', [onTask('c')])],
    } as const;

    assert.deepStrictEqual(arcDiagramIds(order, state), [
      'task:a',
      'milestone:m',
      'task:b',
      'task:c',
      'task:d',
    ]);
  });

  test('puts a chain of milestones above the task, in the order they hold', () => {
    const state: DomainState = {
      tasks: tasks({ c: [onMilestone('m2')] }),
      // `m2` waits for `m1`: listed first, it still goes below it.
      milestones: [milestone('m2', [onMilestone('m1')]), milestone('m1')],
    } as const;

    assert.deepStrictEqual(arcDiagramIds(order, state), [
      'task:a',
      'task:b',
      'milestone:m1',
      'milestone:m2',
      'task:c',
      'task:d',
    ]);
  });

  test('puts a milestone nothing waits for just below the last it waits for', () => {
    const state: DomainState = {
      tasks: tasks(),
      milestones: [milestone('m', [onTask('a'), onTask('c')])],
    } as const;

    assert.deepStrictEqual(arcDiagramIds(order, state), [
      'task:a',
      'task:b',
      'task:c',
      'milestone:m',
      'task:d',
    ]);
  });

  test('puts a milestone nothing waits for below the milestone it waits for', () => {
    const state: DomainState = {
      tasks: tasks(),
      milestones: [
        milestone('last', [onMilestone('first')]),
        milestone('first', [onTask('b')]),
      ],
    } as const;

    assert.deepStrictEqual(arcDiagramIds(order, state), [
      'task:a',
      'task:b',
      'milestone:first',
      'milestone:last',
      'task:c',
      'task:d',
    ]);
  });

  test('puts a milestone only a milestone waits for just above that one', () => {
    // As the demo's 「コードフリーズ」, dated, which 「リリース承認」 waits
    // for along with a task.
    const state: DomainState = {
      tasks: tasks(),
      milestones: [
        milestone('release', [onTask('b'), onMilestone('freeze')]),
        milestone('freeze'),
      ],
    } as const;

    assert.deepStrictEqual(arcDiagramIds(order, state), [
      'task:a',
      'task:b',
      'milestone:freeze',
      'milestone:release',
      'task:c',
      'task:d',
    ]);
  });

  test('puts a milestone joined to no task at the end, in the order given', () => {
    const state: DomainState = {
      tasks: tasks(),
      milestones: [milestone('y'), milestone('x')],
    } as const;

    assert.deepStrictEqual(arcDiagramIds(order, state), [
      ...order,
      'milestone:y',
      'milestone:x',
    ]);
  });

  test('leaves out a task not in the order, and places by the rest', () => {
    const state: DomainState = {
      tasks: Arr.toPushed(tasks(), task('hidden', [onMilestone('m')])),
      milestones: [milestone('m', [onTask('a')])],
    } as const;

    assert.deepStrictEqual(arcDiagramIds(order, state), [
      'task:a',
      'milestone:m',
      'task:b',
      'task:c',
      'task:d',
    ]);
  });

  test('terminates on a cycle of milestones, which the editor never saves', () => {
    const state: DomainState = {
      tasks: tasks(),
      milestones: [
        milestone('m1', [onMilestone('m2')]),
        milestone('m2', [onMilestone('m1')]),
      ],
    } as const;

    assert.deepStrictEqual(
      arcDiagramIds(order, state).toSorted(),
      [...order, 'milestone:m1', 'milestone:m2'].toSorted(),
    );
  });
});

describe(arcDiagramNodes, () => {
  const ids: readonly GraphNodeId[] = [
    'task:t2',
    'milestone:m',
    'task:t1',
  ] as const;

  test('stacks the nodes in the order given, each the size of its kind', () => {
    const nodes = arcDiagramNodes(ids, 'standard');

    assert.deepStrictEqual(
      nodes.map(({ id, kind, y, width, height }) => ({
        id,
        kind,
        y,
        width,
        height,
      })),
      [
        { id: 'task:t2', kind: 'task', y: 0, ...TASK_NODE_SIZE },
        {
          id: 'milestone:m',
          kind: 'milestone',
          y: TASK_NODE_SIZE.height + ARC_NODE_GAP,
          ...MILESTONE_NODE_SIZE,
        },
        {
          id: 'task:t1',
          kind: 'task',
          y:
            TASK_NODE_SIZE.height +
            MILESTONE_NODE_SIZE.height +
            2 * ARC_NODE_GAP,
          ...TASK_NODE_SIZE,
        },
      ],
    );
  });

  test('lines up the right sides, where the arcs are, with the tasks at x = 0', () => {
    for (const size of ['standard', 'compact'] as const) {
      const nodes = arcDiagramNodes(ids, size);

      const rights = new Set(nodes.map(({ x, width }) => x + width));

      assert.strictEqual(rights.size, 1);

      assert.isTrue(nodes.every(({ kind, x }) => kind !== 'task' || x === 0));
    }
  });

  test('spaces compact nodes by their own height', () => {
    const nodes = arcDiagramNodes(ids, 'compact');

    assert.deepStrictEqual(
      nodes.map(({ y, width, height }) => ({ y, width, height })),
      [
        { y: 0, ...COMPACT_TASK_NODE_SIZE },
        {
          y: COMPACT_TASK_NODE_SIZE.height + ARC_NODE_GAP,
          ...COMPACT_MILESTONE_NODE_SIZE,
        },
        {
          y:
            COMPACT_TASK_NODE_SIZE.height +
            COMPACT_MILESTONE_NODE_SIZE.height +
            2 * ARC_NODE_GAP,
          ...COMPACT_TASK_NODE_SIZE,
        },
      ],
    );
  });

  test('is empty for no nodes', () => {
    assert.deepStrictEqual(arcDiagramNodes([], 'standard'), []);
  });
});
