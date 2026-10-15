import { createMilestone } from './create-milestone.mjs';
import { createTask } from './create-task.mjs';
import { removeDependency } from './remove-dependency.mjs';
import {
  asMilestoneId,
  asTaskId,
  type Dependency,
  type DomainState,
  type Milestone,
  type NodeRef,
  type Task,
} from './types.mjs';

const ref = (s: string): NodeRef =>
  s.startsWith('m')
    ? ({ kind: 'milestone', id: asMilestoneId(s) } as const)
    : ({ kind: 'task', id: asTaskId(s) } as const);

const on = (s: string): Dependency => {
  const from = ref(s);

  return from.kind === 'task'
    ? { from, type: 'start-to-start', lagMs: 3600_000 }
    : { from, lagMs: 0 };
};

const task = (id: string, ...sources: readonly string[]): Task =>
  createTask({
    id: asTaskId(id),
    title: id,
    now: 0,
    dependencies: sources.map(on),
  });

const milestone = (id: string, ...sources: readonly string[]): Milestone =>
  createMilestone({
    id: asMilestoneId(id),
    title: id,
    now: 0,
    dependencies: sources.map(on),
  });

// a -> c <- b, and a, c -> m1; c depends on a twice
const state: DomainState = {
  tasks: [task('a'), task('b'), task('c', 'a', 'b', 'a')],
  milestones: [milestone('m1', 'a', 'c')],
} as const;

describe(removeDependency, () => {
  test('takes every dependency of a task on the source, keeping the rest', () => {
    assert.deepStrictEqual(removeDependency(state, ref('c'), ref('a'), 100), {
      kind: 'task',
      task: { ...task('c', 'b'), updatedAt: 100 },
    });
  });

  test('takes a dependency of a milestone', () => {
    assert.deepStrictEqual(removeDependency(state, ref('m1'), ref('c'), 100), {
      kind: 'milestone',
      milestone: { ...milestone('m1', 'a'), updatedAt: 100 },
    });
  });

  test('is undefined when there is no such dependency, or no such node', () => {
    assert.isUndefined(removeDependency(state, ref('a'), ref('c'), 100));

    assert.isUndefined(removeDependency(state, ref('x'), ref('a'), 100));

    assert.isUndefined(removeDependency(state, ref('m9'), ref('a'), 100));
  });
});
