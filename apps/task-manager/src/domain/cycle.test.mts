import { createMilestone } from './create-milestone.mjs';
import { createTask } from './create-task.mjs';
import { findCycle, wouldCreateCycle } from './cycle.mjs';
import {
  asMilestoneId,
  asTaskId,
  type Dependency,
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
    ? { from, type: 'finish-to-start', lagMs: 0 }
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

describe(findCycle, () => {
  test('is undefined for a DAG', () => {
    assert.isUndefined(
      findCycle({
        tasks: [task('a'), task('b', 'a', 'm1'), task('c', 'a', 'b')],
        milestones: [milestone('m1', 'a')],
      }),
    );
  });

  test('finds a self-dependency', () => {
    assert.deepStrictEqual(
      findCycle({ tasks: [task('a', 'a')], milestones: [] }),
      [ref('a'), ref('a')],
    );
  });

  test('returns the cycle in edge direction, closed on its first node', () => {
    // a -> b -> c -> a, plus d hanging off c
    assert.deepStrictEqual(
      findCycle({
        tasks: [task('a', 'c'), task('b', 'a'), task('c', 'b'), task('d', 'c')],
        milestones: [],
      }),
      [ref('a'), ref('b'), ref('c'), ref('a')],
    );
  });

  test('finds a cycle through milestones', () => {
    assert.deepStrictEqual(
      findCycle({
        tasks: [task('a', 'm2')],
        milestones: [milestone('m1', 'a'), milestone('m2', 'm1')],
      }),
      [ref('a'), ref('m1'), ref('m2'), ref('a')],
    );
  });

  test('ignores dependencies on missing nodes', () => {
    assert.isUndefined(
      findCycle({ tasks: [task('a', 'x', 'm9')], milestones: [] }),
    );
  });
});

describe(wouldCreateCycle, () => {
  // a -> m1 -> b
  const state = {
    tasks: [task('a'), task('b', 'm1')],
    milestones: [milestone('m1', 'a')],
  } as const;

  test('a self-dependency is a cycle', () => {
    assert.isTrue(wouldCreateCycle(state, ref('a'), ref('a')));

    assert.isTrue(wouldCreateCycle(state, ref('m1'), ref('m1')));
  });

  test('an edge closing a path is a cycle', () => {
    // making a depend on b closes a -> m1 -> b
    assert.isTrue(wouldCreateCycle(state, ref('a'), ref('b')));

    assert.isTrue(wouldCreateCycle(state, ref('m1'), ref('b')));
  });

  test('an edge along the existing order is not', () => {
    assert.isFalse(wouldCreateCycle(state, ref('b'), ref('a')));

    assert.isFalse(wouldCreateCycle(state, ref('c'), ref('b')));

    assert.isFalse(wouldCreateCycle(state, ref('a'), ref('c')));
  });

  test('a task and a milestone sharing an id are different nodes', () => {
    const shared = {
      tasks: [createTask({ id: asTaskId('x'), title: 'x', now: 0 })],
      milestones: [
        createMilestone({ id: asMilestoneId('x'), title: 'x', now: 0 }),
      ],
    } as const;

    assert.isFalse(
      wouldCreateCycle(
        shared,
        { kind: 'task', id: asTaskId('x') },
        { kind: 'milestone', id: asMilestoneId('x') },
      ),
    );
  });
});
