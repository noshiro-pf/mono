/**
 * The model: tasks and milestones (the nodes), and the dependencies between
 * them (the edges). Every timestamp is epoch milliseconds, and nothing here
 * reads the clock: functions that depend on the time take `now`.
 */

import * as t from 'ts-fortress';
import { type Brand } from 'ts-type-forge';

/**
 * A task's id: any non-empty string. The codec's `is` is the guard, and
 * {@link asTaskId} brands a string that must be one.
 */
export const TaskIdCodec = t.brandedString({
  typeName: 'TaskId',
  defaultValue: '-',
  is: (s): s is Brand<string, 'TaskId'> => s !== '',
});

/**
 * Brands `s` as a {@link TaskId}. Not `TaskIdCodec.cast`, which throws a
 * plain `Error`.
 *
 * @throws {TypeError} When `s` is empty.
 */
export const asTaskId = (s: string): TaskId => {
  if (TaskIdCodec.is(s)) {
    return s;
  }

  throw new TypeError('A TaskId must be a non-empty string');
};

/** A milestone's id: any non-empty string, as a {@link TaskId} is. */
export const MilestoneIdCodec = t.brandedString({
  typeName: 'MilestoneId',
  defaultValue: '-',
  is: (s): s is Brand<string, 'MilestoneId'> => s !== '',
});

/**
 * Brands `s` as a {@link MilestoneId}.
 *
 * @throws {TypeError} When `s` is empty.
 */
export const asMilestoneId = (s: string): MilestoneId => {
  if (MilestoneIdCodec.is(s)) {
    return s;
  }

  throw new TypeError('A MilestoneId must be a non-empty string');
};

/** Whether `dependency` is on a task, and so has a type. */
export const isTaskDependency = (
  dependency: Dependency,
): dependency is TaskDependency => dependency.from.kind === 'task';

export type TaskId = t.TypeOf<typeof TaskIdCodec>;

export type MilestoneId = t.TypeOf<typeof MilestoneIdCodec>;

/** A node of the dependency graph. */
export type NodeRef =
  t.TypeOf<typeof TaskRefCodec> | t.TypeOf<typeof MilestoneRefCodec>;

/**
 * How far a task has got, as set by hand (through `setProgress`, which keeps
 * `startedAt` and `completedAt` in step), in workflow order. Whether a task
 * that has not started is ready or blocked is not stored: it is derived from
 * its dependencies (see `displayStatus`).
 */
export const progresses = [
  'not-started',
  'in-progress',
  'in-review',
  'done',
] as const;

export const ProgressCodec = t.enumType(progresses);

export type Progress = t.TypeOf<typeof ProgressCodec>;

/**
 * The status a task is shown with: its {@link Progress}, with `not-started`
 * split into `ready` and `blocked`. Sorting by status follows this order.
 */
export const displayStatuses = [
  'ready',
  'blocked',
  'in-progress',
  'in-review',
  'done',
] as const;

export const DisplayStatusCodec = t.enumType(displayStatuses);

export type DisplayStatus = t.TypeOf<typeof DisplayStatusCodec>;

/** `1` is the highest priority and `5` the lowest. */
export const priorities = [1, 2, 3, 4, 5] as const;

export const PriorityCodec = t.enumType(priorities);

export type Priority = t.TypeOf<typeof PriorityCodec>;

/**
 * What a dependency on a task waits for: `finish-to-start` for the task to be
 * done, `start-to-start` for it to have started.
 */
export const dependencyTypes = ['finish-to-start', 'start-to-start'] as const;

export const DependencyTypeCodec = t.enumType(dependencyTypes);

export type DependencyType = t.TypeOf<typeof DependencyTypeCodec>;

/**
 * A number that is neither `NaN` nor infinite: every timestamp, lag and
 * estimate. The type stays `number`; only the codecs check it.
 */
export const FiniteNumberCodec = t.refine({
  baseType: t.number(),
  is: (n: number): n is number => Number.isFinite(n),
  defaultValue: 0,
  typeName: 'finite number',
});

/** A timestamp or an amount that may be missing. */
const OptionalFiniteNumberCodec = t.nullable(FiniteNumberCodec);

export const TaskRefCodec = t.record({
  kind: t.literal('task'),
  id: TaskIdCodec,
});

export const MilestoneRefCodec = t.record({
  kind: t.literal('milestone'),
  id: MilestoneIdCodec,
});

/*
 * The two kinds of dependency go unnamed: a union whose members' names are
 * short enough to list reports only that list for a value that matches
 * none, while the structural names that `record` makes up are long enough
 * for it to report how the closest member failed instead.
 */

export const TaskDependencyCodec = t.record({
  from: TaskRefCodec,
  type: DependencyTypeCodec,
  lagMs: FiniteNumberCodec,
});

export const MilestoneDependencyCodec = t.record({
  from: MilestoneRefCodec,
  lagMs: FiniteNumberCodec,
});

/** One of the two, told apart by `from.kind`. */
export const DependencyCodec = t.union([
  TaskDependencyCodec,
  MilestoneDependencyCodec,
]);

export const TaskCodec = t.record(
  {
    id: TaskIdCodec,
    title: t.string(),
    description: t.string(),
    progress: ProgressCodec,
    priority: PriorityCodec,
    dueDate: OptionalFiniteNumberCodec,
    createdAt: FiniteNumberCodec,
    updatedAt: FiniteNumberCodec,
    /** When the task started, while its progress is past `not-started`. */
    startedAt: OptionalFiniteNumberCodec,
    /** When the task was done, while its progress is `done`. */
    completedAt: OptionalFiniteNumberCodec,
    labels: t.array(t.string()),
    estimateHours: OptionalFiniteNumberCodec,
    assignees: t.array(t.string()),
    reviewers: t.array(t.string()),
    /** All of them must hold before the task can be worked on. */
    dependencies: t.array(DependencyCodec),
  },
  { typeName: 'Task' },
);

export const MilestoneCodec = t.record(
  {
    id: MilestoneIdCodec,
    title: t.string(),
    description: t.string(),
    createdAt: FiniteNumberCodec,
    updatedAt: FiniteNumberCodec,
    date: OptionalFiniteNumberCodec,
    requiresManualCheck: t.boolean(),
    /** Read only when `requiresManualCheck` is set. */
    checkedAt: OptionalFiniteNumberCodec,
    dependencies: t.array(DependencyCodec),
  },
  { typeName: 'Milestone' },
);

export const DomainStateCodec = t.record(
  {
    tasks: t.array(TaskCodec),
    milestones: t.array(MilestoneCodec),
  },
  { typeName: 'DomainState' },
);

/**
 * An edge of the dependency graph, held by the dependent node. It holds once
 * its source has got there (see `satisfiedSince`) and a further `lagMs` has
 * passed. A milestone has no duration, so a dependency on one has no type.
 */
export type Dependency = TaskDependency | MilestoneDependency;

export type TaskDependency = t.TypeOf<typeof TaskDependencyCodec>;

export type MilestoneDependency = t.TypeOf<typeof MilestoneDependencyCodec>;

/** A task; see {@link TaskCodec} for what its fields mean. */
export type Task = t.TypeOf<typeof TaskCodec>;

/**
 * A point that tasks can wait for, reached once every one of its components
 * is: a `date` (a date gate), a manual check (a blocker, resolved by setting
 * `checkedAt`), its `dependencies` (an aggregate) — or any combination. One
 * with none of them is reached when it is created.
 */
export type Milestone = t.TypeOf<typeof MilestoneCodec>;

/** Everything the domain stores. Ids are assumed to be unique per kind. */
export type DomainState = t.TypeOf<typeof DomainStateCodec>;
