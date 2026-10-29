import { Arr, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { Point } from '../dag/index.mjs';
import {
  asGroupId,
  asMilestoneId,
  asTaskId,
  createMilestone,
  createTask,
  type GraphNodeId,
  type Group,
  type GroupId,
} from '../domain/index.mjs';
import {
  parseProjectFile,
  projectFileText,
  type ProjectSnapshot,
} from './project-file.mjs';

const group: Group = {
  id: asGroupId('g1'),
  title: 'バックエンド',
  createdAt: 1000,
  updatedAt: 2000,
} as const;

const snapshot: ProjectSnapshot = {
  state: {
    tasks: [
      createTask({
        id: asTaskId('t1'),
        title: '設計',
        now: 1000,
        dueDate: 9000,
        labels: ['docs'],
        groupId: asGroupId('g1'),
      }),
      createTask({
        id: asTaskId('t2'),
        title: '実装',
        now: 1500,
        dependencies: [
          {
            from: { kind: 'task', id: asTaskId('t1') },
            type: 'finish-to-start',
            lagMs: 0,
          },
        ],
      }),
    ],
    milestones: [
      createMilestone({
        id: asMilestoneId('m1'),
        title: 'リリース',
        now: 2000,
        dependencies: [
          {
            from: { kind: 'task', id: asTaskId('t2') },
            type: 'finish-to-start',
            lagMs: 0,
          },
        ],
      }),
    ],
  },
  groups: [group],
  dagLayout: {
    direction: 'right',
    positions: new Map<GraphNodeId, Point>([['task:t1', { x: 1, y: 2 }]]),
    groupPositions: new Map<GroupId, Point>([
      [asGroupId('g1'), { x: 0, y: 0 }],
    ]),
  },
} as const;

const fileOf = (text: string): ReadonlyRecord<string, unknown> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- A test's own fixture, written just above.
  JSON.parse(text) as ReadonlyRecord<string, unknown>;

const errorsOf = (text: string): readonly string[] => {
  const parsed = parseProjectFile(text);

  return Result.isErr(parsed) ? parsed.value : [];
};

describe(projectFileText, () => {
  test('writes the format and its version, and when', () => {
    const file = fileOf(projectFileText(snapshot, 5000));

    assert.strictEqual(file['format'], 'task-manager-project');

    assert.strictEqual(file['version'], 1);

    assert.strictEqual(file['exportedAt'], 5000);
  });
});

describe(parseProjectFile, () => {
  test('reads back what was written', () => {
    assert.deepStrictEqual(
      parseProjectFile(projectFileText(snapshot, 5000)),
      Result.ok(snapshot),
    );
  });

  test('reads a project with no layout', () => {
    const empty: ProjectSnapshot = {
      state: { tasks: [], milestones: [] },
      groups: [],
      dagLayout: undefined,
    } as const;

    assert.deepStrictEqual(
      parseProjectFile(projectFileText(empty, 5000)),
      Result.ok(empty),
    );
  });

  test('refuses what is not JSON, or not a project file', () => {
    assert.deepStrictEqual(errorsOf('{'), ['JSON として読めません。']);

    assert.deepStrictEqual(errorsOf('[]'), [
      'このアプリが書き出したプロジェクトのファイルではありません。',
    ]);

    assert.deepStrictEqual(
      errorsOf(
        JSON.stringify({
          ...fileOf(projectFileText(snapshot, 5000)),
          version: 2,
        }),
      ),
      ['形式の版 2 は読めません（読めるのは 1）。'],
    );
  });

  test('says which record is wrong, and how', () => {
    const file = fileOf(projectFileText(snapshot, 5000));

    const errors = errorsOf(
      JSON.stringify({
        ...file,
        tasks: [{ id: 't9', title: 3 }],
      }),
    );

    assert.isTrue(Arr.isNonEmpty(errors));

    assert.isTrue(errors.every((error) => error.startsWith('タスク 1 件目')));
  });

  test('refuses a record with no id, or one Firestore cannot take', () => {
    const file = fileOf(projectFileText(snapshot, 5000));

    const errors = errorsOf(
      JSON.stringify({
        ...file,
        tasks: [],
        milestones: [],
        groups: [
          { title: 'G', createdAt: 0, updatedAt: 0 },
          { id: 'a/b', title: 'G', createdAt: 0, updatedAt: 0 },
          { id: '__x__', title: 'G', createdAt: 0, updatedAt: 0 },
        ],
      }),
    );

    const [first, second, third, ...rest] = errors;

    assert.strictEqual(first, 'グループ 1 件目: id がありません。');

    assert.match(second ?? '', /^グループ 2 件目: id「a\/b」は使えません/u);

    assert.match(third ?? '', /^グループ 3 件目: id「__x__」は使えません/u);

    assert.deepStrictEqual(rest, []);
  });

  test('takes the ids Firestore takes, `__` among them', () => {
    const file = fileOf(projectFileText(snapshot, 5000));

    assert.isTrue(
      Result.isOk(
        parseProjectFile(
          JSON.stringify({
            ...file,
            groups: [{ id: '__', title: 'G', createdAt: 0, updatedAt: 0 }],
          }),
        ),
      ),
    );
  });

  test('refuses a record too large to store, and a layout key Firestore refuses', () => {
    const file = fileOf(projectFileText(snapshot, 5000));

    assert.deepStrictEqual(
      errorsOf(
        JSON.stringify({
          ...file,
          groups: [
            {
              id: 'g1',
              title: 'x'.repeat(1_100_000),
              createdAt: 0,
              updatedAt: 0,
            },
          ],
          dagLayout: {
            direction: 'right',
            positions: {},
            groupPositions: { __x__: { x: 0, y: 0 } },
            updatedAt: 0,
          },
        }),
      ),
      [
        'グループ 1 件目: 大きすぎます（1 MB まで）。',
        'DAG の配置: 「__x__」の位置は保存できません。',
      ],
    );
  });

  test('refuses a layout with more positions than Firestore indexes', () => {
    const positions = Object.fromEntries(
      Array.from({ length: 6601 }, (_, i) => [`task:t${i}`, { x: i, y: i }]),
    );

    assert.deepStrictEqual(
      errorsOf(
        JSON.stringify({
          ...fileOf(projectFileText(snapshot, 5000)),
          dagLayout: {
            direction: 'right',
            positions,
            groupPositions: {},
            updatedAt: 0,
          },
        }),
      ),
      ['DAG の配置: 位置が多すぎます（6600 まで）。'],
    );
  });

  test('says which part of the file is wrong', () => {
    const errors = errorsOf(
      JSON.stringify({
        ...fileOf(projectFileText(snapshot, 5000)),
        groups: 'none',
      }),
    );

    assert.strictEqual(
      errors[0],
      'プロジェクトのファイルの形が正しくありません。',
    );

    assert.isTrue(errors.length > 1);
  });

  test('refuses an id used twice', () => {
    const file = fileOf(projectFileText(snapshot, 5000));

    const tasks = file['tasks'];

    assert.deepStrictEqual(
      errorsOf(
        JSON.stringify({
          ...file,
          tasks: Arr.isArray(tasks) ? Arr.toPushed(tasks, tasks[0]) : [],
        }),
      ),
      ['タスクの id「t1」が 2 回あります。'],
    );
  });

  test('reads a dependency on a node not in the file, and a cycle, as the app shows them', () => {
    const [t1, t2] = snapshot.state.tasks;

    assert.isDefined(t1);

    assert.isDefined(t2);

    const odd: ProjectSnapshot = {
      ...snapshot,
      state: {
        tasks: [
          {
            ...t1,
            dependencies: [
              {
                from: { kind: 'task', id: t2.id },
                type: 'finish-to-start',
                lagMs: 0,
              },
            ],
          },
          t2,
          {
            ...t2,
            id: asTaskId('t3'),
            dependencies: [
              {
                from: { kind: 'task', id: asTaskId('gone') },
                type: 'finish-to-start',
                lagMs: 0,
              },
            ],
          },
        ],
        milestones: [],
      },
    } as const;

    assert.deepStrictEqual(
      parseProjectFile(projectFileText(odd, 5000)),
      Result.ok(odd),
    );
  });

  test('measures a record as it is stored, without fields it leaves out', () => {
    const file = fileOf(projectFileText(snapshot, 5000));

    assert.isTrue(
      Result.isOk(
        parseProjectFile(
          JSON.stringify({
            ...file,
            groups: [
              {
                id: 'g1',
                title: 'G',
                createdAt: 0,
                updatedAt: 0,
                attachment: 'x'.repeat(1_100_000),
              },
            ],
          }),
        ),
      ),
    );
  });
});
