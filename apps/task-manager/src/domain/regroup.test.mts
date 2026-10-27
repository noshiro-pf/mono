import { createMilestone } from './create-milestone.mjs';
import { createTask } from './create-task.mjs';
import { regroupNode, removeGroup } from './regroup.mjs';
import {
  asGroupId,
  asMilestoneId,
  asTaskId,
  type DomainState,
} from './types.mjs';

const g = asGroupId('g');

const h = asGroupId('h');

const a = createTask({ id: asTaskId('a'), title: 'A', now: 0, groupId: g });

const b = createTask({ id: asTaskId('b'), title: 'B', now: 0 });

const c = createTask({ id: asTaskId('c'), title: 'C', now: 0, groupId: h });

const m = createMilestone({
  id: asMilestoneId('m'),
  title: 'M',
  now: 0,
  groupId: g,
});

const state: DomainState = { tasks: [a, b, c], milestones: [m] } as const;

describe(regroupNode, () => {
  test('moves a task into a group, stamped now', () => {
    assert.deepStrictEqual(
      regroupNode(state, { kind: 'task', id: asTaskId('b') }, g, 5),
      {
        kind: 'task',
        task: { ...b, groupId: g, updatedAt: 5 },
      },
    );
  });

  test('moves a milestone out of its group', () => {
    assert.deepStrictEqual(
      regroupNode(
        state,
        { kind: 'milestone', id: asMilestoneId('m') },
        undefined,
        5,
      ),
      {
        kind: 'milestone',
        milestone: { ...m, groupId: undefined, updatedAt: 5 },
      },
    );
  });

  test('changes nothing for a node in that group already, or none', () => {
    assert.isUndefined(
      regroupNode(state, { kind: 'task', id: asTaskId('a') }, g, 5),
    );

    assert.isUndefined(
      regroupNode(state, { kind: 'task', id: asTaskId('x') }, g, 5),
    );
  });
});

describe(removeGroup, () => {
  test('takes every node of the group out of it, and no other', () => {
    assert.deepStrictEqual(removeGroup(state, g, 7), {
      updatedTasks: [{ ...a, groupId: undefined, updatedAt: 7 }],
      updatedMilestones: [{ ...m, groupId: undefined, updatedAt: 7 }],
    });
  });

  test('writes nothing for a group nothing is in', () => {
    assert.deepStrictEqual(removeGroup(state, asGroupId('none'), 7), {
      updatedTasks: [],
      updatedMilestones: [],
    });
  });
});
