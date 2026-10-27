import { createMilestone } from './create-milestone.mjs';
import { createTask } from './create-task.mjs';
import { editNodes, NO_NODE_EDIT, type NodeEdit } from './edit-nodes.mjs';
import { setProgress } from './set-progress.mjs';
import {
  asGroupId,
  asMilestoneId,
  asTaskId,
  type DomainState,
  type NodeRef,
} from './types.mjs';

const g = asGroupId('g');

const a = createTask({
  id: asTaskId('a'),
  title: 'A',
  now: 0,
  labels: ['ui', 'docs'],
  groupId: g,
});

const b = createTask({
  id: asTaskId('b'),
  title: 'B',
  now: 0,
  progress: 'in-progress',
  startedAt: 0,
  labels: ['api'],
});

const c = createTask({ id: asTaskId('c'), title: 'C', now: 0 });

const m = createMilestone({ id: asMilestoneId('m'), title: 'M', now: 0 });

const state: DomainState = { tasks: [a, b, c], milestones: [m] } as const;

const refA: NodeRef = { kind: 'task', id: asTaskId('a') } as const;

const refB: NodeRef = { kind: 'task', id: asTaskId('b') } as const;

const refM: NodeRef = { kind: 'milestone', id: asMilestoneId('m') } as const;

const edit = (fields: Partial<NodeEdit>): NodeEdit =>
  ({
    ...NO_NODE_EDIT,
    ...fields,
  }) as const;

describe(editNodes, () => {
  test('sets the progress of every task named, as setProgress does, stamped now', () => {
    assert.deepStrictEqual(
      editNodes(state, [refA, refB], edit({ progress: 'done' }), 5),
      {
        updatedTasks: [setProgress(a, 'done', 5), setProgress(b, 'done', 5)],
        updatedMilestones: [],
      },
    );
  });

  test('adds labels a task lacks and takes off those it has, keeping the rest in order', () => {
    assert.deepStrictEqual(
      editNodes(
        state,
        [refA, refB],
        edit({ addLabels: ['api', 'urgent'], removeLabels: ['ui'] }),
        5,
      ),
      {
        updatedTasks: [
          { ...a, labels: ['docs', 'api', 'urgent'], updatedAt: 5 },
          { ...b, labels: ['api', 'urgent'], updatedAt: 5 },
        ],
        updatedMilestones: [],
      },
    );
  });

  test('keeps a label both added and taken off', () => {
    assert.deepStrictEqual(
      editNodes(
        state,
        [refB],
        edit({ addLabels: ['api'], removeLabels: ['api'] }),
        5,
      ).updatedTasks,
      [],
    );
  });

  test('moves tasks and milestones into a group, or into none', () => {
    assert.deepStrictEqual(
      editNodes(state, [refA, refB, refM], edit({ group: { to: g } }), 5),
      {
        updatedTasks: [{ ...b, groupId: g, updatedAt: 5 }],
        updatedMilestones: [{ ...m, groupId: g, updatedAt: 5 }],
      },
    );

    assert.deepStrictEqual(
      editNodes(state, [refA, refB], edit({ group: { to: undefined } }), 5),
      {
        updatedTasks: [{ ...a, groupId: undefined, updatedAt: 5 }],
        updatedMilestones: [],
      },
    );
  });

  test('applies every change at once, to each node once', () => {
    assert.deepStrictEqual(
      editNodes(
        state,
        [refA, refA],
        edit({
          progress: 'in-review',
          addLabels: ['x'],
          group: { to: undefined },
        }),
        5,
      ).updatedTasks,
      [
        {
          ...setProgress(a, 'in-review', 5),
          labels: ['ui', 'docs', 'x'],
          groupId: undefined,
        },
      ],
    );
  });

  test('leaves out the nodes that would not change, and those that are gone', () => {
    assert.deepStrictEqual(
      editNodes(
        state,
        [refA, refM, { kind: 'task', id: asTaskId('gone') }],
        edit({ progress: 'not-started', removeLabels: ['api'] }),
        5,
      ),
      { updatedTasks: [], updatedMilestones: [] },
    );
  });

  test('changes nothing with nothing asked', () => {
    assert.deepStrictEqual(
      editNodes(state, [refA, refB, refM], NO_NODE_EDIT, 5),
      {
        updatedTasks: [],
        updatedMilestones: [],
      },
    );
  });
});
