import { expectType } from 'ts-data-forge';
import {
  asMilestoneId,
  asTaskId,
  dependencyTypes,
  displayStatuses,
  isMilestoneId,
  isTaskId,
  priorities,
  progresses,
  type DependencyType,
  type DisplayStatus,
  type MilestoneId,
  type Priority,
  type Progress,
  type TaskId,
} from './types.mjs';

describe('task ids', () => {
  test('isTaskId accepts a non-empty string only', () => {
    assert.isTrue(isTaskId('a'));

    assert.isFalse(isTaskId(''));
  });

  test('asTaskId brands a non-empty string', () => {
    const id = asTaskId('task-1');

    expectType<typeof id, TaskId>('=');

    assert.strictEqual(id, 'task-1');
  });

  test('asTaskId throws on the empty string', () => {
    expect(() => asTaskId('')).toThrow(TypeError);
  });
});

describe('milestone ids', () => {
  test('isMilestoneId accepts a non-empty string only', () => {
    assert.isTrue(isMilestoneId('m'));

    assert.isFalse(isMilestoneId(''));
  });

  test('asMilestoneId brands a non-empty string, distinct from TaskId', () => {
    const id = asMilestoneId('milestone-1');

    expectType<typeof id, MilestoneId>('=');

    expectType<MilestoneId, TaskId>('!=');

    assert.strictEqual(id, 'milestone-1');
  });

  test('asMilestoneId throws on the empty string', () => {
    expect(() => asMilestoneId('')).toThrow(TypeError);
  });
});

describe('the progresses', () => {
  test('lists the stored workflow in order', () => {
    expectType<Progress, 'not-started' | 'in-progress' | 'in-review' | 'done'>(
      '=',
    );

    assert.deepStrictEqual(progresses, [
      'not-started',
      'in-progress',
      'in-review',
      'done',
    ]);
  });
});

describe('the display statuses', () => {
  test('lists the derived statuses in order', () => {
    expectType<
      DisplayStatus,
      'ready' | 'blocked' | 'in-progress' | 'in-review' | 'done'
    >('=');

    assert.deepStrictEqual(displayStatuses, [
      'ready',
      'blocked',
      'in-progress',
      'in-review',
      'done',
    ]);
  });
});

describe('the dependency types', () => {
  test('lists the types a dependency on a task can have', () => {
    expectType<DependencyType, 'finish-to-start' | 'start-to-start'>('=');

    assert.deepStrictEqual(dependencyTypes, [
      'finish-to-start',
      'start-to-start',
    ]);
  });
});

describe('the priorities', () => {
  test('runs from 1 (highest) to 5', () => {
    expectType<Priority, 1 | 2 | 3 | 4 | 5>('=');

    assert.deepStrictEqual(priorities, [1, 2, 3, 4, 5]);
  });
});
