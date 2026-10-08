import { createMilestone } from './create-milestone.mjs';
import { createTask } from './create-task.mjs';
import {
  buildDependentIds,
  buildSourceIds,
  listNodes,
  nodeId,
} from './graph-nodes.mjs';
import { asMilestoneId, asTaskId, type DomainState } from './types.mjs';

const a = asTaskId('a');

const b = asTaskId('b');

const m = asMilestoneId('m');

const state: DomainState = {
  tasks: [
    createTask({ id: a, title: 'A', now: 0 }),
    createTask({
      id: b,
      title: 'B',
      now: 0,
      dependencies: [
        { from: { kind: 'task', id: a }, type: 'finish-to-start', lagMs: 0 },
        { from: { kind: 'task', id: a }, type: 'start-to-start', lagMs: 5 },
        { from: { kind: 'milestone', id: m }, lagMs: 0 },
        {
          from: { kind: 'task', id: asTaskId('missing') },
          type: 'finish-to-start',
          lagMs: 0,
        },
      ],
    }),
  ],
  milestones: [
    createMilestone({
      id: m,
      title: 'M',
      now: 0,
      dependencies: [
        { from: { kind: 'task', id: a }, type: 'finish-to-start', lagMs: 0 },
      ],
    }),
  ],
} as const;

describe(nodeId, () => {
  test('is the node kind and id', () => {
    assert.strictEqual(nodeId({ kind: 'task', id: a }), 'task:a');

    assert.strictEqual(nodeId({ kind: 'milestone', id: m }), 'milestone:m');
  });

  test('keeps a task and a milestone with the same id apart', () => {
    assert.notStrictEqual(
      nodeId({ kind: 'task', id: asTaskId('x') }),
      nodeId({ kind: 'milestone', id: asMilestoneId('x') }),
    );
  });
});

describe(listNodes, () => {
  test('lists tasks, then milestones, in input order', () => {
    assert.deepStrictEqual(
      listNodes(state).map(({ ref }) => ref),
      [
        { kind: 'task', id: a },
        { kind: 'task', id: b },
        { kind: 'milestone', id: m },
      ],
    );
  });
});

describe(buildSourceIds, () => {
  test('lists the existing nodes each node depends on, once each', () => {
    assert.deepStrictEqual(
      buildSourceIds(state),
      new Map([
        ['task:a', []],
        ['task:b', ['task:a', 'milestone:m']],
        ['milestone:m', ['task:a']],
      ]),
    );
  });
});

describe(buildDependentIds, () => {
  test('lists the nodes depending on each node, in node order', () => {
    assert.deepStrictEqual(
      buildDependentIds(state),
      new Map([
        ['task:a', ['task:b', 'milestone:m']],
        ['task:b', []],
        ['milestone:m', ['task:b']],
      ]),
    );
  });
});
