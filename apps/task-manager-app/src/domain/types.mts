/**
 * The model: tasks and milestones (the nodes), and the dependencies between
 * them (the edges). Every timestamp is epoch milliseconds, and nothing here
 * reads the clock: functions that depend on the time take `now`.
 */

import type { Brand, DeepReadonly } from 'ts-type-forge';

/** Whether `s` can be a {@link TaskId}: any non-empty string. */
export const isTaskId = (s: string): s is TaskId => s !== '';

/**
 * Brands `s` as a {@link TaskId}.
 *
 * @throws {TypeError} When `s` is empty.
 */
export const asTaskId = (s: string): TaskId => {
  if (isTaskId(s)) {
    return s;
  }

  throw new TypeError('A TaskId must be a non-empty string');
};

/** Whether `s` can be a {@link MilestoneId}: any non-empty string. */
export const isMilestoneId = (s: string): s is MilestoneId => s !== '';

/**
 * Brands `s` as a {@link MilestoneId}.
 *
 * @throws {TypeError} When `s` is empty.
 */
export const asMilestoneId = (s: string): MilestoneId => {
  if (isMilestoneId(s)) {
    return s;
  }

  throw new TypeError('A MilestoneId must be a non-empty string');
};

/** Whether `dependency` is on a task, and so has a type. */
export const isTaskDependency = (
  dependency: Dependency,
): dependency is TaskDependency => dependency.from.kind === 'task';

export type TaskId = Brand<string, 'TaskId'>;

export type MilestoneId = Brand<string, 'MilestoneId'>;

/** A node of the dependency graph. */
export type NodeRef = DeepReadonly<
  { kind: 'task'; id: TaskId } | { kind: 'milestone'; id: MilestoneId }
>;

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

export type Progress = (typeof progresses)[number];

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

export type DisplayStatus = (typeof displayStatuses)[number];

/** `1` is the highest priority and `5` the lowest. */
export const priorities = [1, 2, 3, 4, 5] as const;

export type Priority = (typeof priorities)[number];

/**
 * What a dependency on a task waits for: `finish-to-start` for the task to be
 * done, `start-to-start` for it to have started.
 */
export const dependencyTypes = ['finish-to-start', 'start-to-start'] as const;

export type DependencyType = (typeof dependencyTypes)[number];

/**
 * An edge of the dependency graph, held by the dependent node. It holds once
 * its source has got there (see `satisfiedSince`) and a further `lagMs` has
 * passed. A milestone has no duration, so a dependency on one has no type.
 */
export type Dependency = TaskDependency | MilestoneDependency;

export type TaskDependency = DeepReadonly<{
  from: { kind: 'task'; id: TaskId };
  type: DependencyType;
  lagMs: number;
}>;

export type MilestoneDependency = DeepReadonly<{
  from: { kind: 'milestone'; id: MilestoneId };
  lagMs: number;
}>;

export type Task = DeepReadonly<{
  id: TaskId;
  title: string;
  description: string;
  progress: Progress;
  priority: Priority;
  dueDate: number | undefined;
  createdAt: number;
  updatedAt: number;
  /** When the task started, while its progress is past `not-started`. */
  startedAt: number | undefined;
  /** When the task was done, while its progress is `done`. */
  completedAt: number | undefined;
  labels: string[];
  estimateHours: number | undefined;
  assignees: string[];
  reviewers: string[];
  /** All of them must hold before the task can be worked on. */
  dependencies: Dependency[];
}>;

/**
 * A point that tasks can wait for, reached once every one of its components
 * is: a `date` (a date gate), a manual check (a blocker, resolved by setting
 * `checkedAt`), its `dependencies` (an aggregate) — or any combination. One
 * with none of them is reached when it is created.
 */
export type Milestone = DeepReadonly<{
  id: MilestoneId;
  title: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  date: number | undefined;
  requiresManualCheck: boolean;
  /** Read only when `requiresManualCheck` is set. */
  checkedAt: number | undefined;
  dependencies: Dependency[];
}>;

/** Everything the domain stores. Ids are assumed to be unique per kind. */
export type DomainState = DeepReadonly<{
  tasks: Task[];
  milestones: Milestone[];
}>;
