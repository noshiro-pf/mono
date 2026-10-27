import type { StrictOmit } from 'ts-type-forge';
import { createTask } from './create-task.mjs';
import { sortTasks, type SortSpec } from './sort-tasks.mjs';
import {
  asTaskId,
  type DisplayStatus,
  type Task,
  type TaskId,
} from './types.mjs';

const ids = (tasks: readonly Task[]): readonly string[] =>
  tasks.map(({ id }) => id);

const task = (
  id: string,
  fields: Partial<StrictOmit<Task, 'id' | 'createdAt' | 'updatedAt'>> = {},
): Task => createTask({ title: id, ...fields, id: asTaskId(id), now: 0 });

describe(sortTasks, () => {
  test('with no keys orders by id', () => {
    assert.deepStrictEqual(
      ids(sortTasks([task('c'), task('a'), task('b')], [])),
      ['a', 'b', 'c'],
    );
  });

  test('does not mutate its input', () => {
    const tasks = [task('b'), task('a')] as const;

    const sorted = sortTasks(tasks, [{ key: 'title', order: 'asc' }]);

    assert.deepStrictEqual(ids(tasks), ['b', 'a']);

    assert.deepStrictEqual(ids(sorted), ['a', 'b']);
  });

  test('sorts by priority, 1 first when ascending', () => {
    const tasks = [
      task('a', { priority: 3 }),
      task('b', { priority: 1 }),
      task('c', { priority: 5 }),
    ] as const;

    assert.deepStrictEqual(
      ids(sortTasks(tasks, [{ key: 'priority', order: 'asc' }])),
      ['b', 'a', 'c'],
    );

    assert.deepStrictEqual(
      ids(sortTasks(tasks, [{ key: 'priority', order: 'desc' }])),
      ['c', 'a', 'b'],
    );
  });

  test('sorts by display status in declared order, a task without one last', () => {
    const tasks = [
      task('a'),
      task('b'),
      task('c'),
      task('d'),
      task('e'),
      task('f'),
    ] as const;

    const displayStatusById = new Map<TaskId, DisplayStatus>([
      [asTaskId('a'), 'done'],
      [asTaskId('b'), 'in-progress'],
      [asTaskId('c'), 'blocked'],
      [asTaskId('d'), 'ready'],
      [asTaskId('e'), 'in-review'],
    ]);

    assert.deepStrictEqual(
      ids(
        sortTasks(tasks, [{ key: 'status', order: 'asc' }], {
          displayStatusById,
        }),
      ),
      ['d', 'c', 'b', 'e', 'a', 'f'],
    );

    assert.deepStrictEqual(
      ids(
        sortTasks(tasks, [{ key: 'status', order: 'desc' }], {
          displayStatusById,
        }),
      ),
      ['a', 'e', 'b', 'c', 'd', 'f'],
    );
  });

  test('puts an undefined value last whichever the order', () => {
    const tasks = [
      task('a'),
      task('b', { dueDate: 200 }),
      task('c', { dueDate: 100 }),
    ] as const;

    assert.deepStrictEqual(
      ids(sortTasks(tasks, [{ key: 'dueDate', order: 'asc' }])),
      ['c', 'b', 'a'],
    );

    assert.deepStrictEqual(
      ids(sortTasks(tasks, [{ key: 'dueDate', order: 'desc' }])),
      ['b', 'c', 'a'],
    );

    assert.deepStrictEqual(
      ids(
        sortTasks(
          [
            task('x'),
            task('y', { estimateHours: 2 }),
            task('z', { estimateHours: 1 }),
          ],
          [{ key: 'estimate', order: 'desc' }],
        ),
      ),
      ['y', 'z', 'x'],
    );
  });

  test('lets earlier keys dominate and ties fall through', () => {
    const tasks = [
      task('a', { priority: 2, dueDate: 300 }),
      task('b', { priority: 1, dueDate: 300 }),
      task('c', { priority: 2, dueDate: 100 }),
      task('d', { priority: 2, dueDate: 100 }),
    ] as const;

    const keys: readonly SortSpec[] = [
      { key: 'dueDate', order: 'asc' },
      { key: 'priority', order: 'desc' },
    ] as const;

    // c and d tie on both keys and fall back to id.
    assert.deepStrictEqual(ids(sortTasks(tasks, keys)), ['c', 'd', 'a', 'b']);
  });

  test('breaks a full tie by id regardless of input order', () => {
    const keys: readonly SortSpec[] = [
      { key: 'priority', order: 'asc' },
    ] as const;

    assert.deepStrictEqual(ids(sortTasks([task('b'), task('a')], keys)), [
      'a',
      'b',
    ]);

    assert.deepStrictEqual(ids(sortTasks([task('a'), task('b')], keys)), [
      'a',
      'b',
    ]);
  });

  test('compares titles with a collator', () => {
    const tasks = [
      task('1', { title: 'b' }),
      task('2', { title: 'B' }),
      task('3', { title: 'a' }),
      task('4', { title: 'item 10' }),
      task('5', { title: 'item 9' }),
    ] as const;

    assert.deepStrictEqual(
      ids(sortTasks(tasks, [{ key: 'title', order: 'asc' }])),
      ['3', '1', '2', '4', '5'],
    );
  });

  test('compares titles with the given locale', () => {
    const tasks = [
      task('1', { title: 'ä' }),
      task('2', { title: 'z' }),
    ] as const;

    assert.deepStrictEqual(
      ids(sortTasks(tasks, [{ key: 'title', order: 'asc' }], { locale: 'de' })),
      ['1', '2'],
    );

    assert.deepStrictEqual(
      ids(sortTasks(tasks, [{ key: 'title', order: 'asc' }], { locale: 'sv' })),
      ['2', '1'],
    );
  });

  test('sorts by depth from the context, a task without one last', () => {
    const tasks = [task('a'), task('b'), task('c'), task('d')] as const;

    const depthById = new Map([
      [asTaskId('a'), 2],
      [asTaskId('b'), 0],
      [asTaskId('c'), 1],
    ]);

    assert.deepStrictEqual(
      ids(sortTasks(tasks, [{ key: 'depth', order: 'asc' }], { depthById })),
      ['b', 'c', 'a', 'd'],
    );

    assert.deepStrictEqual(
      ids(sortTasks(tasks, [{ key: 'depth', order: 'desc' }], { depthById })),
      ['a', 'c', 'b', 'd'],
    );
  });

  test('sorts by createdAt and updatedAt', () => {
    const tasks = [
      { ...task('a'), createdAt: 3, updatedAt: 1 },
      { ...task('b'), createdAt: 1, updatedAt: 3 },
      { ...task('c'), createdAt: 2, updatedAt: 2 },
    ] as const;

    assert.deepStrictEqual(
      ids(sortTasks(tasks, [{ key: 'createdAt', order: 'asc' }])),
      ['b', 'c', 'a'],
    );

    assert.deepStrictEqual(
      ids(sortTasks(tasks, [{ key: 'updatedAt', order: 'desc' }])),
      ['b', 'c', 'a'],
    );
  });
});
