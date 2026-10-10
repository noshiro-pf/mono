import { expectType, Result } from 'ts-data-forge';
import { type StrictExclude } from 'ts-type-forge';
import { type DagLayout } from '../dag/index.mjs';
import {
  asMilestoneId,
  asTaskId,
  createMilestone,
  createTask,
  type Milestone,
  type Task,
} from '../domain/index.mjs';
import {
  DagLayoutDocCodec,
  dagLayoutFromDoc,
  dagLayoutToDoc,
  MilestoneDocCodec,
  milestoneFromDoc,
  milestoneToDoc,
  personalProjectDoc,
  TaskDocCodec,
  taskFromDoc,
  taskToDoc,
  type DagLayoutDoc,
  type MilestoneDoc,
  type TaskDoc,
} from './converters.mjs';

// Each document as `api/firestore-io.mts` writes it: pruned to its codec.

const writtenTask = (task: Task): TaskDoc =>
  TaskDocCodec.prune(taskToDoc(task));

const writtenMilestone = (milestone: Milestone): MilestoneDoc =>
  MilestoneDocCodec.prune(milestoneToDoc(milestone));

const writtenLayout = (layout: DagLayout, updatedAt: number): DagLayoutDoc =>
  DagLayoutDocCodec.prune(dagLayoutToDoc(layout, updatedAt));

const fullTask: Task = createTask({
  id: asTaskId('t1'),
  title: '設計',
  now: 1000,
  description: 'まず設計する',
  progress: 'done',
  priority: 1,
  dueDate: 9000,
  startedAt: 2000,
  completedAt: 3000,
  labels: ['docs', 'ui'],
  estimateHours: 2.5,
  assignees: ['me'],
  reviewers: ['you'],
  dependencies: [
    {
      from: { kind: 'task', id: asTaskId('t0') },
      type: 'start-to-start',
      lagMs: 3_600_000,
    },
    { from: { kind: 'milestone', id: asMilestoneId('m0') }, lagMs: 0 },
  ],
});

const emptyTask: Task = createTask({
  id: asTaskId('t2'),
  title: 'Empty',
  now: 1000,
});

const fullMilestone: Milestone = createMilestone({
  id: asMilestoneId('m1'),
  title: 'リリース',
  now: 1000,
  description: 'v1',
  date: 5000,
  requiresManualCheck: true,
  checkedAt: 6000,
  dependencies: [
    {
      from: { kind: 'task', id: asTaskId('t1') },
      type: 'finish-to-start',
      lagMs: 0,
    },
  ],
});

describe(taskToDoc, () => {
  test('writes a missing value as null in the type, too', () => {
    expectType<TaskDoc['dueDate'], number | null>('=');

    expectType<TaskDoc['startedAt'], number | null>('=');

    expectType<TaskDoc['completedAt'], number | null>('=');

    expectType<TaskDoc['estimateHours'], number | null>('=');

    expectType<MilestoneDoc['date'], number | null>('=');

    expectType<MilestoneDoc['checkedAt'], number | null>('=');

    expectType<keyof TaskDoc, StrictExclude<keyof Task, 'id'>>('=');

    expectType<keyof MilestoneDoc, StrictExclude<keyof Milestone, 'id'>>('=');

    assert.notProperty(writtenTask(emptyTask), 'id');
  });

  test('drops the id, which is the document id', () => {
    assert.notProperty(writtenTask(fullTask), 'id');
  });

  test('writes a missing value as null, never as undefined', () => {
    const doc = writtenTask(emptyTask);

    assert.isNull(doc.dueDate);

    assert.isNull(doc.startedAt);

    assert.isNull(doc.completedAt);

    assert.isNull(doc.estimateHours);

    const values: readonly unknown[] = Object.values(doc);

    assert.isFalse(values.includes(undefined));
  });

  test('writes a dependency on a milestone without a type', () => {
    assert.deepStrictEqual(writtenTask(fullTask).dependencies[1], {
      from: { kind: 'milestone', id: asMilestoneId('m0') },
      lagMs: 0,
    });
  });
});

describe('what is written', () => {
  test('a task carrying fields the domain does not know, at any depth, leaves them out', () => {
    const strayTask = {
      ...fullTask,
      projectId: 'p',
      dependencies: [
        {
          from: { kind: 'task', id: asTaskId('t0'), title: 'T0' },
          type: 'start-to-start',
          lagMs: 3_600_000,
          note: 'x',
        },
        // A dependency on a milestone has no type, not even a stray one.
        {
          from: { kind: 'milestone', id: asMilestoneId('m0') },
          type: 'finish-to-start',
          lagMs: 0,
        },
      ],
    } as const;

    const task: Task = strayTask;

    assert.deepStrictEqual(writtenTask(task), writtenTask(fullTask));

    assert.deepStrictEqual(Object.keys(writtenTask(task)), [
      'title',
      'description',
      'progress',
      'priority',
      'dueDate',
      'createdAt',
      'updatedAt',
      'startedAt',
      'completedAt',
      'labels',
      'estimateHours',
      'assignees',
      'reviewers',
      'dependencies',
    ]);
  });

  test('a milestone carrying fields the domain does not know leaves them out', () => {
    const strayMilestone = {
      ...fullMilestone,
      reached: true,
      dependencies: [
        {
          from: { kind: 'task', id: asTaskId('t1'), extra: 1 },
          type: 'finish-to-start',
          lagMs: 0,
          note: 'x',
        },
      ],
    } as const;

    const milestone: Milestone = strayMilestone;

    assert.deepStrictEqual(
      writtenMilestone(milestone),
      writtenMilestone(fullMilestone),
    );

    assert.notProperty(writtenMilestone(milestone), 'reached');

    assert.notProperty(writtenMilestone(milestone), 'id');
  });

  test('a layout whose points carry more than a position leaves the rest out', () => {
    const node = {
      x: 24,
      y: -8,
      width: 184,
      height: 56,
      kind: 'task',
    } as const;

    const layout: DagLayout = {
      direction: 'down',
      positions: new Map([['task:a', node]]),
    } as const;

    const strayLayout = { ...layout, zoom: 2 } as const;

    assert.deepStrictEqual(writtenLayout(strayLayout, 1234), {
      direction: 'down',
      positions: { 'task:a': { x: 24, y: -8 } },
      updatedAt: 1234,
    });
  });
});

describe(taskFromDoc, () => {
  test('round-trips a task with every field set', () => {
    assert.deepStrictEqual(
      taskFromDoc('t1', writtenTask(fullTask)),
      Result.ok(fullTask),
    );
  });

  test('round-trips a task with every optional field missing', () => {
    assert.deepStrictEqual(
      taskFromDoc('t2', writtenTask(emptyTask)),
      Result.ok(emptyTask),
    );
  });

  test('round-trips through a structured clone, as the wire does', () => {
    assert.deepStrictEqual(
      taskFromDoc('t1', structuredClone(writtenTask(fullTask))),
      Result.ok(fullTask),
    );
  });

  test('ignores fields it does not know, which a newer version may write', () => {
    assert.deepStrictEqual(
      taskFromDoc('t2', { ...writtenTask(emptyTask), projectId: 'p' }),
      Result.ok(emptyTask),
    );
  });

  test('rejects an empty id', () => {
    assert.isTrue(Result.isErr(taskFromDoc('', writtenTask(emptyTask))));
  });

  test('ignores fields it does not know inside a dependency too', () => {
    const doc = writtenTask(fullTask);

    assert.deepStrictEqual(
      taskFromDoc('t1', {
        ...doc,
        dependencies: doc.dependencies.map((dependency) => ({
          ...dependency,
          note: 'x',
          from: { ...dependency.from, projectId: 'p' },
        })),
      }),
      Result.ok(fullTask),
    );
  });

  test('takes the id from the document id, not from a field', () => {
    assert.deepStrictEqual(
      taskFromDoc('t2', { ...writtenTask(emptyTask), id: 'other' }),
      Result.ok(emptyTask),
    );
  });

  test('needs a lag on a dependency on a milestone, but no type', () => {
    const doc = writtenTask(fullTask);

    assert.isTrue(
      Result.isErr(
        taskFromDoc('t1', {
          ...doc,
          dependencies: [{ from: { kind: 'milestone', id: 'm0' } }],
        }),
      ),
    );

    assert.isTrue(
      Result.isOk(
        taskFromDoc('t1', {
          ...doc,
          dependencies: [{ from: { kind: 'milestone', id: 'm0' }, lagMs: 0 }],
        }),
      ),
    );
  });

  test('rejects what is not a task', () => {
    const doc = writtenTask(fullTask);

    for (const broken of [
      undefined,
      'task',
      { ...doc, title: 1 },
      { ...doc, progress: 'blocked' },
      { ...doc, priority: 0 },
      { ...doc, priority: '1' },
      { ...doc, dueDate: undefined },
      { ...doc, dueDate: Number.NaN },
      { ...doc, labels: 'docs' },
      {
        ...doc,
        dependencies: [{ from: { kind: 'task', id: 't0' }, lagMs: 0 }],
      },
      {
        ...doc,
        dependencies: [
          { from: { kind: 'project', id: 'p' }, type: null, lagMs: 0 },
        ],
      },
      {
        ...doc,
        dependencies: [{ from: { kind: 'milestone', id: '' }, lagMs: 0 }],
      },
    ]) {
      assert.isTrue(Result.isErr(taskFromDoc('t1', broken)));
    }
  });
});

describe(milestoneFromDoc, () => {
  test('round-trips a milestone with every field set', () => {
    assert.deepStrictEqual(
      milestoneFromDoc('m1', writtenMilestone(fullMilestone)),
      Result.ok(fullMilestone),
    );
  });

  test('round-trips a milestone with every optional field missing', () => {
    const milestone = createMilestone({
      id: asMilestoneId('m2'),
      title: 'M',
      now: 0,
    });

    const doc = writtenMilestone(milestone);

    assert.isNull(doc.date);

    assert.isNull(doc.checkedAt);

    assert.deepStrictEqual(milestoneFromDoc('m2', doc), Result.ok(milestone));
  });

  test('rejects what is not a milestone', () => {
    const doc = writtenMilestone(fullMilestone);

    for (const broken of [
      null,
      { ...doc, requiresManualCheck: 'yes' },
      { ...doc, date: '2026-10-09' },
      { ...doc, createdAt: undefined },
    ]) {
      assert.isTrue(Result.isErr(milestoneFromDoc('m1', broken)));
    }
  });
});

describe(personalProjectDoc, () => {
  test('is owned by, and has as its only member, the user it is for', () => {
    assert.deepStrictEqual(personalProjectDoc('uid-1', 1234), {
      name: 'マイプロジェクト',
      ownerUid: 'uid-1',
      memberUids: ['uid-1'],
      createdAt: 1234,
    });
  });
});

describe(dagLayoutToDoc, () => {
  const layout: DagLayout = {
    direction: 'down',
    positions: new Map([
      ['task:a', { x: 24, y: -8 }],
      ['milestone:m', { x: 300.5, y: 40 }],
    ]),
  } as const;

  test('writes the positions as a map keyed by node id', () => {
    assert.deepStrictEqual(writtenLayout(layout, 1234), {
      direction: 'down',
      positions: {
        'task:a': { x: 24, y: -8 },
        'milestone:m': { x: 300.5, y: 40 },
      },
      updatedAt: 1234,
    });
  });

  test('round-trips, through a structured clone as the wire does', () => {
    assert.deepStrictEqual(
      dagLayoutFromDoc(structuredClone(writtenLayout(layout, 1234))),
      Result.ok(layout),
    );
  });

  test('round-trips a layout with no positions', () => {
    const empty: DagLayout = {
      direction: 'right',
      positions: new Map(),
    } as const;

    assert.deepStrictEqual(
      dagLayoutFromDoc(writtenLayout(empty, 0)),
      Result.ok(empty),
    );
  });
});

describe(dagLayoutFromDoc, () => {
  const doc = {
    direction: 'right',
    positions: { 'task:a': { x: 1, y: 2 } },
    updatedAt: 0,
  } as const;

  test('ignores fields it does not know', () => {
    assert.isTrue(
      Result.isOk(dagLayoutFromDoc({ ...doc, zoom: 2, extra: 'x' })),
    );
  });

  test('rejects what is not a layout', () => {
    for (const broken of [
      undefined,
      null,
      'layout',
      { ...doc, direction: 'left' },
      { ...doc, direction: 'RIGHT' },
      { ...doc, positions: [] },
      { ...doc, positions: { 'task:a': { x: 1 } } },
      { ...doc, positions: { 'task:a': { x: '1', y: 2 } } },
      { ...doc, positions: { 'task:a': { x: Number.NaN, y: 2 } } },
      { ...doc, positions: { project: { x: 1, y: 2 } } },
      { ...doc, positions: { 'task:': { x: 1, y: 2 } } },
      { ...doc, updatedAt: null },
    ]) {
      assert.isTrue(Result.isErr(dagLayoutFromDoc(broken)));
    }
  });
});
