import { Result } from 'ts-data-forge';
import {
  asMilestoneId,
  asTaskId,
  createMilestone,
  createTask,
  type Dependency,
  type DomainState,
} from '../domain/index.mjs';
import {
  appendEmptyRow,
  dependenciesFromRows,
  dependencySourceOptions,
  describeDependency,
  parseSourceValue,
  removeRow,
  rowsFromDependencies,
  updateRow,
  validateRows,
  validDependencies,
  type DependencyRow,
} from './dependency-edit.mjs';
import { DAY_MS, HOUR_MS } from './format.mjs';

const a = asTaskId('a');

const b = asTaskId('b');

const m = asMilestoneId('m');

const state: DomainState = {
  tasks: [
    createTask({ id: a, title: 'A', now: 0 }),
    createTask({
      id: b,
      title: 'B',
      now: 0,
      dependencies: [
        { from: { kind: 'task', id: a }, type: 'finish-to-start', lagMs: 0 },
      ],
    }),
  ],
  milestones: [createMilestone({ id: m, title: 'M', now: 0 })],
} as const;

const onM: Dependency = {
  from: { kind: 'milestone', id: m },
  lagMs: 0,
} as const;

const rowOn = (
  key: number,
  source: DependencyRow['source'],
  patch: Partial<DependencyRow> = {},
): DependencyRow =>
  ({
    key,
    source,
    type: 'finish-to-start',
    lagDays: '0',
    lagHours: '0',
    ...patch,
  }) as const;

describe(rowsFromDependencies, () => {
  test('writes each dependency as a row, its lag split into days and hours', () => {
    assert.deepStrictEqual(
      rowsFromDependencies([
        {
          from: { kind: 'task', id: a },
          type: 'start-to-start',
          lagMs: 2 * DAY_MS + 3 * HOUR_MS,
        },
        onM,
      ]),
      [
        rowOn(0, 'task:a', {
          type: 'start-to-start',
          lagDays: '2',
          lagHours: '3',
        }),
        rowOn(1, 'milestone:m'),
      ],
    );
  });
});

describe(appendEmptyRow, () => {
  test('adds an empty row with a key no other row has', () => {
    assert.deepStrictEqual(appendEmptyRow([]), [rowOn(0, '')]);

    assert.deepStrictEqual(
      appendEmptyRow([rowOn(3, 'task:a'), rowOn(1, 'milestone:m')]),
      [rowOn(3, 'task:a'), rowOn(1, 'milestone:m'), rowOn(4, '')],
    );
  });
});

describe(updateRow, () => {
  test('changes the row with the key, and only it', () => {
    assert.deepStrictEqual(
      updateRow([rowOn(0, 'task:a'), rowOn(1, '')], 1, {
        source: 'milestone:m',
        lagHours: '5',
      }),
      [rowOn(0, 'task:a'), rowOn(1, 'milestone:m', { lagHours: '5' })],
    );
  });
});

describe(removeRow, () => {
  test('removes the row with the key', () => {
    assert.deepStrictEqual(
      removeRow([rowOn(0, 'task:a'), rowOn(1, 'milestone:m')], 0),
      [rowOn(1, 'milestone:m')],
    );
  });
});

describe(validateRows, () => {
  const dependentA = { kind: 'task', id: a } as const;

  test('reads a complete row as its dependency, and an empty one as nothing', () => {
    assert.deepStrictEqual(
      validateRows(state, dependentA, [
        rowOn(0, 'milestone:m', { lagDays: '1', lagHours: '' }),
        rowOn(1, '', { lagDays: 'abc' }),
      ]),
      [
        {
          key: 0,
          status: 'ok',
          dependency: { from: { kind: 'milestone', id: m }, lagMs: DAY_MS },
        },
        { key: 1, status: 'empty' },
      ],
    );
  });

  test('gives a dependency on a task the type of the row', () => {
    assert.deepStrictEqual(
      validateRows(state, { kind: 'milestone', id: m }, [
        rowOn(0, 'task:b', { type: 'start-to-start', lagHours: '1.5' }),
      ]),
      [
        {
          key: 0,
          status: 'ok',
          dependency: {
            from: { kind: 'task', id: b },
            type: 'start-to-start',
            lagMs: 1.5 * HOUR_MS,
          },
        },
      ],
    );
  });

  test('refuses a row that would close a cycle, saying why', () => {
    assert.deepStrictEqual(
      validateRows(state, dependentA, [rowOn(0, 'task:b')]),
      [
        {
          key: 0,
          status: 'error',
          message: 'B は A に依存しているため、循環する依存になります。',
        },
      ],
    );
  });

  test('refuses a dependency on itself', () => {
    assert.deepStrictEqual(
      validateRows(state, dependentA, [rowOn(0, 'task:a')]),
      [{ key: 0, status: 'error', message: '自分自身には依存できません。' }],
    );
  });

  test('refuses a second row on the same node, keeping the first', () => {
    assert.deepStrictEqual(
      validateRows(state, dependentA, [
        rowOn(0, 'milestone:m'),
        rowOn(1, ''),
        rowOn(2, 'milestone:m', { lagDays: '1' }),
      ]).map((check) => check.status),
      ['ok', 'empty', 'error'],
    );

    assert.deepStrictEqual(
      validateRows(state, dependentA, [
        rowOn(0, 'milestone:m'),
        rowOn(1, 'milestone:m'),
      ])[1],
      { key: 1, status: 'error', message: 'M にはすでに依存しています。' },
    );
  });

  test('refuses a lag that is not a number, or is negative', () => {
    assert.deepStrictEqual(
      validateRows(state, dependentA, [
        rowOn(0, 'milestone:m', { lagDays: '1日' }),
      ]),
      [
        {
          key: 0,
          status: 'error',
          message: 'ずらす時間は数で入力してください。',
        },
      ],
    );

    assert.deepStrictEqual(
      validateRows(state, dependentA, [
        rowOn(0, 'milestone:m', { lagHours: '-1' }),
      ]),
      [
        {
          key: 0,
          status: 'error',
          message: 'ずらす時間は 0 以上にしてください。',
        },
      ],
    );
  });

  test('refuses a source that no longer exists', () => {
    assert.deepStrictEqual(
      validateRows(state, dependentA, [rowOn(0, 'task:gone')]),
      [
        {
          key: 0,
          status: 'error',
          message: '依存先が見つかりません。外してください。',
        },
      ],
    );
  });

  test('allows anything for a node that is not stored yet', () => {
    assert.deepStrictEqual(
      validateRows(state, { kind: 'task', id: asTaskId('new') }, [
        rowOn(0, 'task:b'),
      ]).map((check) => check.status),
      ['ok'],
    );
  });
});

describe(validDependencies, () => {
  test('keeps the dependencies of the rows that are valid', () => {
    assert.deepStrictEqual(
      validDependencies(
        validateRows(state, { kind: 'task', id: a }, [
          rowOn(0, 'task:b'),
          rowOn(1, 'milestone:m'),
          rowOn(2, ''),
        ]),
      ),
      [onM],
    );
  });
});

describe(dependenciesFromRows, () => {
  test('is the dependencies of the rows, the empty ones left out', () => {
    assert.deepStrictEqual(
      dependenciesFromRows(state, { kind: 'task', id: a }, [
        rowOn(0, ''),
        rowOn(1, 'milestone:m'),
      ]),
      Result.ok([onM]),
    );
  });

  test('is every error when a row is wrong', () => {
    assert.deepStrictEqual(
      dependenciesFromRows(state, { kind: 'task', id: a }, [
        rowOn(0, 'milestone:m'),
        rowOn(1, 'task:b'),
      ]),
      Result.err([
        {
          key: 1,
          status: 'error',
          message: 'B は A に依存しているため、循環する依存になります。',
        },
      ]),
    );
  });
});

describe(dependencySourceOptions, () => {
  test('offers every other node, tasks first', () => {
    assert.deepStrictEqual(
      dependencySourceOptions(state, { kind: 'task', id: a }),
      [
        { value: 'task:b', label: 'タスク: B', ref: { kind: 'task', id: b } },
        {
          value: 'milestone:m',
          label: 'マイルストーン: M',
          ref: { kind: 'milestone', id: m },
        },
      ],
    );
  });
});

describe(describeDependency, () => {
  test('names the source, the type and the lag', () => {
    assert.strictEqual(
      describeDependency(state, {
        from: { kind: 'task', id: a },
        type: 'start-to-start',
        lagMs: 2 * DAY_MS,
      }),
      'A の開始後 +2日',
    );

    assert.strictEqual(describeDependency(state, onM), 'M の到達後');

    assert.strictEqual(
      describeDependency(state, {
        from: { kind: 'task', id: asTaskId('gone') },
        type: 'finish-to-start',
        lagMs: 0,
      }),
      '（削除されたタスク） の完了後',
    );
  });
});

describe(parseSourceValue, () => {
  test('reads a node id, and nothing else', () => {
    assert.strictEqual(parseSourceValue('task:a'), 'task:a');

    assert.strictEqual(parseSourceValue('milestone:m'), 'milestone:m');

    assert.strictEqual(parseSourceValue(''), '');

    assert.strictEqual(parseSourceValue('task:'), '');

    assert.strictEqual(parseSourceValue('project:p'), '');
  });
});
