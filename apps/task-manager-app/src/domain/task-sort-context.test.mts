import { createMilestone } from './create-milestone.mjs';
import { createTask } from './create-task.mjs';
import { taskSortContext } from './task-sort-context.mjs';
import { asMilestoneId, asTaskId, type DomainState } from './types.mjs';

const a = asTaskId('a');

const b = asTaskId('b');

const c = asTaskId('c');

const gate = asMilestoneId('gate');

/** b waits for a; c waits for a milestone dated 5000. */
const state: DomainState = {
  tasks: [
    createTask({ id: a, title: 'A', now: 0, progress: 'in-progress' }),
    createTask({
      id: b,
      title: 'B',
      now: 0,
      dependencies: [
        { from: { kind: 'task', id: a }, type: 'finish-to-start', lagMs: 0 },
      ],
    }),
    createTask({
      id: c,
      title: 'C',
      now: 0,
      dependencies: [{ from: { kind: 'milestone', id: gate }, lagMs: 0 }],
    }),
  ],
  milestones: [
    createMilestone({ id: gate, title: 'Gate', now: 0, date: 5000 }),
  ],
} as const;

describe(taskSortContext, () => {
  test('has every task’s status at the time given', () => {
    assert.deepStrictEqual(
      taskSortContext(state, 1000).displayStatusById,
      new Map([
        [a, 'in-progress'],
        [b, 'blocked'],
        [c, 'blocked'],
      ]),
    );

    assert.deepStrictEqual(
      taskSortContext(state, 6000).displayStatusById,
      new Map([
        [a, 'in-progress'],
        [b, 'blocked'],
        [c, 'ready'],
      ]),
    );
  });

  test('has every task’s dependency depth, through milestones too', () => {
    assert.deepStrictEqual(
      taskSortContext(state, 1000).depthById,
      new Map([
        [a, 0],
        [b, 1],
        [c, 1],
      ]),
    );
  });

  test('has no depth with a cycle', () => {
    const cyclic: DomainState = {
      tasks: [
        createTask({
          id: a,
          title: 'A',
          now: 0,
          dependencies: [
            {
              from: { kind: 'task', id: b },
              type: 'finish-to-start',
              lagMs: 0,
            },
          ],
        }),
        createTask({
          id: b,
          title: 'B',
          now: 0,
          dependencies: [
            {
              from: { kind: 'task', id: a },
              type: 'finish-to-start',
              lagMs: 0,
            },
          ],
        }),
      ],
      milestones: [],
    } as const;

    assert.isUndefined(taskSortContext(cyclic, 1000).depthById);
  });
});
