import { Result } from 'ts-data-forge';
import { createMilestone } from './create-milestone.mjs';
import { createTask } from './create-task.mjs';
import { dependencyDepth } from './dependency-depth.mjs';
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

describe(dependencyDepth, () => {
  test('is the length of the longest chain of dependencies above each node', () => {
    // a -> b -> m1 -> c, and a -> c directly; d depends on m0 only.
    assert.deepStrictEqual(
      dependencyDepth({
        tasks: [
          task('c', 'a', 'm1'),
          task('b', 'a'),
          task('a'),
          task('d', 'm0'),
        ],
        milestones: [milestone('m1', 'b'), milestone('m0')],
      }),
      Result.ok({
        tasks: new Map([
          [asTaskId('a'), 0],
          [asTaskId('b'), 1],
          [asTaskId('c'), 3],
          [asTaskId('d'), 1],
        ]),
        milestones: new Map([
          [asMilestoneId('m1'), 2],
          [asMilestoneId('m0'), 0],
        ]),
      }),
    );
  });

  test('ignores dependencies on missing nodes', () => {
    assert.deepStrictEqual(
      dependencyDepth({ tasks: [task('a', 'x', 'm9')], milestones: [] }),
      Result.ok({
        tasks: new Map([[asTaskId('a'), 0]]),
        milestones: new Map(),
      }),
    );
  });

  test('is the cycle when there is one', () => {
    assert.deepStrictEqual(
      dependencyDepth({ tasks: [task('a', 'a')], milestones: [] }),
      Result.err([ref('a'), ref('a')]),
    );
  });
});
