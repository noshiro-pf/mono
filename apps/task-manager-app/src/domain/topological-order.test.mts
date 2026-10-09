import { Result } from 'ts-data-forge';
import { createMilestone } from './create-milestone.mjs';
import { createTask } from './create-task.mjs';
import { topologicalOrder } from './topological-order.mjs';
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

describe(topologicalOrder, () => {
  test('is empty for an empty state', () => {
    assert.deepStrictEqual(
      topologicalOrder({ tasks: [], milestones: [] }),
      Result.ok([]),
    );
  });

  test('puts every node after the nodes it depends on', () => {
    assert.deepStrictEqual(
      topologicalOrder({
        tasks: [task('c', 'm1'), task('b', 'a'), task('a')],
        milestones: [milestone('m1', 'b')],
      }),
      Result.ok([ref('a'), ref('b'), ref('m1'), ref('c')]),
    );
  });

  test('breaks ties by node order (tasks in input order, then milestones), not by id', () => {
    assert.deepStrictEqual(
      topologicalOrder({
        tasks: [task('d'), task('b'), task('c'), task('a')],
        milestones: [milestone('m2'), milestone('m1')],
      }),
      Result.ok([ref('d'), ref('b'), ref('c'), ref('a'), ref('m2'), ref('m1')]),
    );

    // d and b become free together once a is done; d comes first in input.
    assert.deepStrictEqual(
      topologicalOrder({
        tasks: [task('c'), task('d', 'a'), task('b', 'a'), task('a')],
        milestones: [],
      }),
      Result.ok([ref('c'), ref('a'), ref('d'), ref('b')]),
    );
  });

  test('is the cycle when there is one', () => {
    const result = topologicalOrder({
      tasks: [task('a'), task('b', 'm1')],
      milestones: [milestone('m1', 'b')],
    });

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result, Result.err([ref('b'), ref('m1'), ref('b')]));
  });
});
