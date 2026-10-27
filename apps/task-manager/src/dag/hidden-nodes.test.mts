import {
  asMilestoneId,
  asTaskId,
  createMilestone,
  createTask,
  type DomainState,
  type GraphNodeId,
} from '../domain/index.mjs';
import { hiddenNodeIds, sameNodeIds, withoutNodes } from './hidden-nodes.mjs';

const doneA = createTask({
  id: asTaskId('a'),
  title: 'A',
  now: 0,
  progress: 'done',
  startedAt: 0,
  completedAt: 0,
});

const inReviewB = createTask({
  id: asTaskId('b'),
  title: 'B',
  now: 0,
  progress: 'in-review',
  dependencies: [
    {
      from: { kind: 'task', id: asTaskId('a') },
      type: 'finish-to-start',
      lagMs: 0,
    },
  ],
});

const doneC = createTask({
  id: asTaskId('c'),
  title: 'C',
  now: 0,
  progress: 'done',
});

const state: DomainState = {
  tasks: [doneA, inReviewB, doneC],
  milestones: [createMilestone({ id: asMilestoneId('m'), title: 'M', now: 0 })],
} as const;

const milestones: DomainState = {
  tasks: [doneA, inReviewB],
  milestones: [
    // Reached, through the done task.
    createMilestone({
      id: asMilestoneId('after-a'),
      title: 'After A',
      now: 0,
      dependencies: [
        {
          from: { kind: 'task', id: asTaskId('a') },
          type: 'finish-to-start',
          lagMs: 0,
        },
      ],
    }),
    // Not reached: B is not done.
    createMilestone({
      id: asMilestoneId('after-b'),
      title: 'After B',
      now: 0,
      dependencies: [
        {
          from: { kind: 'task', id: asTaskId('b') },
          type: 'finish-to-start',
          lagMs: 0,
        },
      ],
    }),
    // Reached once checked.
    createMilestone({
      id: asMilestoneId('checked'),
      title: 'Checked',
      now: 0,
      requiresManualCheck: true,
      checkedAt: 5,
    }),
    createMilestone({
      id: asMilestoneId('unchecked'),
      title: 'Unchecked',
      now: 0,
      requiresManualCheck: true,
    }),
    // Reached at 100.
    createMilestone({
      id: asMilestoneId('date'),
      title: 'Date',
      now: 0,
      date: 100,
    }),
    // Reached when created, with nothing to wait for.
    createMilestone({ id: asMilestoneId('empty'), title: 'Empty', now: 0 }),
  ],
} as const;

describe(hiddenNodeIds, () => {
  test('is the done tasks while they are not shown', () => {
    assert.deepStrictEqual(
      hiddenNodeIds(state, 0, false),
      new Set<GraphNodeId>(['task:a', 'task:c']),
    );
  });

  test('is nothing while they are shown', () => {
    assert.deepStrictEqual(
      hiddenNodeIds(state, 0, true),
      new Set<GraphNodeId>(),
    );
  });

  test('is the milestones reached, with what they waited for, too', () => {
    assert.deepStrictEqual(
      hiddenNodeIds(milestones, 50, false),
      new Set<GraphNodeId>([
        'task:a',
        'milestone:after-a',
        'milestone:checked',
      ]),
    );
  });

  test('takes in a milestone once its date has come', () => {
    assert.deepStrictEqual(
      hiddenNodeIds(milestones, 100, false),
      new Set<GraphNodeId>([
        'task:a',
        'milestone:after-a',
        'milestone:checked',
        'milestone:date',
      ]),
    );
  });

  test('is no milestone while they are shown', () => {
    assert.deepStrictEqual(
      hiddenNodeIds(milestones, 100, true),
      new Set<GraphNodeId>(),
    );
  });
});

describe(sameNodeIds, () => {
  test('is whether both hold the same ids, in any order', () => {
    assert.isTrue(
      sameNodeIds(
        new Set<GraphNodeId>(['task:a', 'task:c']),
        new Set<GraphNodeId>(['task:c', 'task:a']),
      ),
    );

    assert.isFalse(
      sameNodeIds(
        new Set<GraphNodeId>(['task:a']),
        new Set<GraphNodeId>(['task:c']),
      ),
    );

    assert.isFalse(
      sameNodeIds(
        new Set<GraphNodeId>(['task:a']),
        new Set<GraphNodeId>(['task:a', 'task:c']),
      ),
    );
  });
});

describe(withoutNodes, () => {
  test('leaves out the nodes named, and keeps the dependencies on them', () => {
    assert.deepStrictEqual(
      withoutNodes(state, new Set<GraphNodeId>(['task:a', 'milestone:m'])),
      {
        tasks: [inReviewB, doneC],
        milestones: [],
      },
    );
  });

  test('is `state` itself for nothing to leave out', () => {
    assert.strictEqual(withoutNodes(state, new Set<GraphNodeId>()), state);
  });
});
