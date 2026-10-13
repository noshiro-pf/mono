import {
  asMilestoneId,
  asTaskId,
  createMilestone,
  createTask,
  type DomainState,
} from '../domain/index.mjs';
import { hiddenNodeIds, withoutNodes } from './hidden-nodes.mjs';

const doneA = createTask({
  id: asTaskId('a'),
  title: 'A',
  now: 0,
  progress: 'done',
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

describe(hiddenNodeIds, () => {
  test('is the done tasks while they are not shown', () => {
    assert.deepStrictEqual(
      hiddenNodeIds(state, false),
      new Set(['task:a', 'task:c']),
    );
  });

  test('is nothing while they are shown', () => {
    assert.deepStrictEqual(hiddenNodeIds(state, true), new Set());
  });
});

describe(withoutNodes, () => {
  test('leaves out the nodes named, and keeps the dependencies on them', () => {
    assert.deepStrictEqual(
      withoutNodes(state, new Set(['task:a', 'milestone:m'])),
      {
        tasks: [inReviewB, doneC],
        milestones: [],
      },
    );
  });

  test('is `state` itself for nothing to leave out', () => {
    assert.strictEqual(withoutNodes(state, new Set()), state);
  });
});
