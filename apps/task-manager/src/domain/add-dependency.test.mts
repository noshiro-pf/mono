import { Result } from 'ts-data-forge';
import { addDependency, dependencyRefusal } from './add-dependency.mjs';
import { createMilestone } from './create-milestone.mjs';
import { createTask } from './create-task.mjs';
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

// a -> b -> m1, and c on its own
const state: DomainState = {
  tasks: [task('a'), task('b', 'a'), task('c')],
  milestones: [milestone('m1', 'b')],
} as const;

describe(dependencyRefusal, () => {
  test('is undefined for a new edge that closes no cycle', () => {
    assert.isUndefined(dependencyRefusal(state, ref('c'), ref('a')));

    assert.isUndefined(dependencyRefusal(state, ref('c'), ref('m1')));

    assert.isUndefined(dependencyRefusal(state, ref('m1'), ref('a')));
  });

  test('refuses depending on oneself', () => {
    assert.strictEqual(dependencyRefusal(state, ref('a'), ref('a')), 'self');
  });

  test('refuses an edge that is already there', () => {
    assert.strictEqual(
      dependencyRefusal(state, ref('b'), ref('a')),
      'duplicate',
    );
  });

  test('refuses an edge that closes a cycle, directly or not', () => {
    assert.strictEqual(dependencyRefusal(state, ref('a'), ref('b')), 'cycle');

    assert.strictEqual(dependencyRefusal(state, ref('a'), ref('m1')), 'cycle');
  });

  test('refuses a node that is not stored', () => {
    assert.strictEqual(dependencyRefusal(state, ref('x'), ref('a')), 'missing');

    assert.strictEqual(
      dependencyRefusal(state, ref('c'), ref('m9')),
      'missing',
    );
  });
});

describe(addDependency, () => {
  test('appends a finish-to-start dependency with no lag on a task', () => {
    assert.deepStrictEqual(
      addDependency(state, ref('c'), ref('a'), 100),
      Result.ok({
        kind: 'task',
        task: {
          ...task('c'),
          updatedAt: 100,
          dependencies: [
            {
              from: { kind: 'task', id: asTaskId('a') },
              type: 'finish-to-start',
              lagMs: 0,
            },
          ],
        },
      }),
    );
  });

  test('keeps the dependencies already there, before the new one', () => {
    assert.deepStrictEqual(
      addDependency(state, ref('m1'), ref('c'), 100),
      Result.ok({
        kind: 'milestone',
        milestone: {
          ...milestone('m1', 'b'),
          updatedAt: 100,
          dependencies: [
            on('b'),
            {
              from: { kind: 'task', id: asTaskId('c') },
              type: 'finish-to-start',
              lagMs: 0,
            },
          ],
        },
      }),
    );
  });

  test('a dependency on a milestone has no type', () => {
    assert.deepStrictEqual(
      addDependency(state, ref('c'), ref('m1'), 100),
      Result.ok({
        kind: 'task',
        task: {
          ...task('c'),
          updatedAt: 100,
          dependencies: [
            { from: { kind: 'milestone', id: asMilestoneId('m1') }, lagMs: 0 },
          ],
        },
      }),
    );
  });

  test('says why it is refused', () => {
    assert.deepStrictEqual(
      addDependency(state, ref('b'), ref('a'), 100),
      Result.err('duplicate'),
    );

    assert.deepStrictEqual(
      addDependency(state, ref('a'), ref('a'), 100),
      Result.err('self'),
    );

    assert.deepStrictEqual(
      addDependency(state, ref('b'), ref('m1'), 100),
      Result.err('cycle'),
    );
  });
});
