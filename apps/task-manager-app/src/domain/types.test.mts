import { expectType } from 'ts-data-forge';
import { type Brand, type DeepReadonly } from 'ts-type-forge';
import {
  asMilestoneId,
  asTaskId,
  DependencyCodec,
  DependencyTypeCodec,
  dependencyTypes,
  DisplayStatusCodec,
  displayStatuses,
  DomainStateCodec,
  MilestoneIdCodec,
  priorities,
  PriorityCodec,
  ProgressCodec,
  progresses,
  TaskIdCodec,
  type Dependency,
  type DependencyType,
  type DisplayStatus,
  type DomainState,
  type Milestone,
  type MilestoneDependency,
  type MilestoneId,
  type NodeRef,
  type Priority,
  type Progress,
  type Task,
  type TaskDependency,
  type TaskId,
} from './types.mjs';

describe('task ids', () => {
  test('TaskIdCodec accepts a non-empty string only', () => {
    assert.isTrue(TaskIdCodec.is('a'));

    assert.isFalse(TaskIdCodec.is(''));

    assert.isFalse(TaskIdCodec.is(1));
  });

  test('asTaskId brands a non-empty string', () => {
    const id = asTaskId('task-1');

    expectType<typeof id, TaskId>('=');

    expectType<TaskId, Brand<string, 'TaskId'>>('=');

    assert.strictEqual(id, 'task-1');
  });

  test('asTaskId throws on the empty string', () => {
    expect(() => asTaskId('')).toThrow(TypeError);
  });
});

describe('milestone ids', () => {
  test('MilestoneIdCodec accepts a non-empty string only', () => {
    assert.isTrue(MilestoneIdCodec.is('m'));

    assert.isFalse(MilestoneIdCodec.is(''));

    assert.isFalse(MilestoneIdCodec.is(null));
  });

  test('asMilestoneId brands a non-empty string, distinct from TaskId', () => {
    const id = asMilestoneId('milestone-1');

    expectType<typeof id, MilestoneId>('=');

    expectType<MilestoneId, Brand<string, 'MilestoneId'>>('=');

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

describe('the codecs of the choice lists', () => {
  test('accept every member of their list and nothing else', () => {
    for (const [codec, members, outsider] of [
      [ProgressCodec, progresses, 'blocked'],
      [DisplayStatusCodec, displayStatuses, 'not-started'],
      [PriorityCodec, priorities, 0],
      [DependencyTypeCodec, dependencyTypes, 'finish-to-finish'],
    ] as const) {
      assert.isTrue(members.every((member) => codec.is(member)));

      assert.isFalse(codec.is(outsider));

      assert.isFalse(codec.is(undefined));
    }
  });

  test('default to the first member of their list', () => {
    assert.strictEqual(ProgressCodec.defaultValue, 'not-started');

    assert.strictEqual(PriorityCodec.defaultValue, 1);
  });
});

describe('the record types', () => {
  test('are the deeply readonly records they were written as by hand', () => {
    expectType<
      NodeRef,
      DeepReadonly<
        { kind: 'task'; id: TaskId } | { kind: 'milestone'; id: MilestoneId }
      >
    >('=');

    expectType<
      TaskDependency,
      DeepReadonly<{
        from: { kind: 'task'; id: TaskId };
        type: DependencyType;
        lagMs: number;
      }>
    >('=');

    expectType<
      MilestoneDependency,
      DeepReadonly<{
        from: { kind: 'milestone'; id: MilestoneId };
        lagMs: number;
      }>
    >('=');

    expectType<
      Task,
      DeepReadonly<{
        id: TaskId;
        title: string;
        description: string;
        progress: Progress;
        priority: Priority;
        dueDate: number | undefined;
        createdAt: number;
        updatedAt: number;
        startedAt: number | undefined;
        completedAt: number | undefined;
        labels: string[];
        estimateHours: number | undefined;
        assignees: string[];
        reviewers: string[];
        dependencies: Dependency[];
      }>
    >('=');

    expectType<
      Milestone,
      DeepReadonly<{
        id: MilestoneId;
        title: string;
        description: string;
        createdAt: number;
        updatedAt: number;
        date: number | undefined;
        requiresManualCheck: boolean;
        checkedAt: number | undefined;
        dependencies: Dependency[];
      }>
    >('=');

    expectType<
      DomainState,
      DeepReadonly<{ tasks: Task[]; milestones: Milestone[] }>
    >('=');

    assert.isTrue(DomainStateCodec.is({ tasks: [], milestones: [] }));
  });
});

describe(DependencyCodec.is, () => {
  const taskId = asTaskId('t');

  const milestoneId = asMilestoneId('m');

  test('accepts a dependency on a task, which has a type', () => {
    assert.isTrue(
      DependencyCodec.is({
        from: { kind: 'task', id: taskId },
        type: 'start-to-start',
        lagMs: 60_000,
      }),
    );

    assert.isFalse(
      DependencyCodec.is({ from: { kind: 'task', id: taskId }, lagMs: 0 }),
    );
  });

  test('accepts a dependency on a milestone, which needs no type', () => {
    assert.isTrue(
      DependencyCodec.is({
        from: { kind: 'milestone', id: milestoneId },
        lagMs: 0,
      }),
    );
  });

  test('rejects another kind, an empty id or a lag that is not finite', () => {
    for (const broken of [
      { from: { kind: 'project', id: 'p' }, lagMs: 0 },
      { from: { kind: 'milestone', id: '' }, lagMs: 0 },
      { from: { kind: 'milestone', id: 'm' }, lagMs: Number.NaN },
      {
        from: { kind: 'task', id: 't' },
        type: 'finish-to-start',
        lagMs: Number.POSITIVE_INFINITY,
      },
    ]) {
      assert.isFalse(DependencyCodec.is(broken));
    }
  });
});
