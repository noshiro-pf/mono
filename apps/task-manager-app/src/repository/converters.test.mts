import { Result } from 'ts-data-forge';
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
  dagLayoutFromDoc,
  dagLayoutToDoc,
  milestoneFromDoc,
  milestoneToDoc,
  personalProjectDoc,
  taskFromDoc,
  taskToDoc,
} from './converters.mjs';

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
  test('drops the id, which is the document id', () => {
    assert.notProperty(taskToDoc(fullTask), 'id');
  });

  test('writes a missing value as null, never as undefined', () => {
    const doc = taskToDoc(emptyTask);

    assert.isNull(doc.dueDate);

    assert.isNull(doc.startedAt);

    assert.isNull(doc.completedAt);

    assert.isNull(doc.estimateHours);

    const values: readonly unknown[] = Object.values(doc);

    assert.isFalse(values.includes(undefined));
  });

  test('writes a dependency on a milestone without a type', () => {
    assert.deepStrictEqual(taskToDoc(fullTask).dependencies[1], {
      from: { kind: 'milestone', id: 'm0' },
      lagMs: 0,
    });
  });
});

describe(taskFromDoc, () => {
  test('round-trips a task with every field set', () => {
    assert.deepStrictEqual(
      taskFromDoc('t1', taskToDoc(fullTask)),
      Result.ok(fullTask),
    );
  });

  test('round-trips a task with every optional field missing', () => {
    assert.deepStrictEqual(
      taskFromDoc('t2', taskToDoc(emptyTask)),
      Result.ok(emptyTask),
    );
  });

  test('round-trips through a structured clone, as the wire does', () => {
    assert.deepStrictEqual(
      taskFromDoc('t1', structuredClone(taskToDoc(fullTask))),
      Result.ok(fullTask),
    );
  });

  test('ignores fields it does not know, which a newer version may write', () => {
    assert.deepStrictEqual(
      taskFromDoc('t2', { ...taskToDoc(emptyTask), projectId: 'p' }),
      Result.ok(emptyTask),
    );
  });

  test('rejects an empty id', () => {
    assert.isTrue(Result.isErr(taskFromDoc('', taskToDoc(emptyTask))));
  });

  test('rejects what is not a task', () => {
    const doc = taskToDoc(fullTask);

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
      milestoneFromDoc('m1', milestoneToDoc(fullMilestone)),
      Result.ok(fullMilestone),
    );
  });

  test('round-trips a milestone with every optional field missing', () => {
    const milestone = createMilestone({
      id: asMilestoneId('m2'),
      title: 'M',
      now: 0,
    });

    const doc = milestoneToDoc(milestone);

    assert.isNull(doc.date);

    assert.isNull(doc.checkedAt);

    assert.deepStrictEqual(milestoneFromDoc('m2', doc), Result.ok(milestone));
  });

  test('rejects what is not a milestone', () => {
    const doc = milestoneToDoc(fullMilestone);

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
    assert.deepStrictEqual(dagLayoutToDoc(layout, 1234), {
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
      dagLayoutFromDoc(structuredClone(dagLayoutToDoc(layout, 1234))),
      Result.ok(layout),
    );
  });

  test('round-trips a layout with no positions', () => {
    const empty: DagLayout = {
      direction: 'right',
      positions: new Map(),
    } as const;

    assert.deepStrictEqual(
      dagLayoutFromDoc(dagLayoutToDoc(empty, 0)),
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
