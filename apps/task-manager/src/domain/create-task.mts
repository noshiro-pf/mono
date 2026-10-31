import type { StrictOmit } from 'ts-type-forge';
import type { Task, TaskId } from './types.mjs';

/**
 * A new task: `id`, `title` and the creation time are required, and every other
 * field defaults to an empty or neutral value — `not-started`, priority `3`, no
 * dates, no people, no dependencies, no group.
 */
export const createTask = ({
  id,
  title,
  now,
  ...fields
}: CreateTaskParams): Task =>
  ({
    ...defaults,
    ...fields,
    id,
    title,
    createdAt: now,
    updatedAt: now,
  }) as const;

export type CreateTaskParams = Readonly<{
  id: TaskId;
  title: string;
  /** Becomes both `createdAt` and `updatedAt`. */
  now: number;
}> &
  Partial<StrictOmit<Task, 'id' | 'title' | 'createdAt' | 'updatedAt'>>;

const defaults = {
  description: '',
  progress: 'not-started',
  priority: 3,
  dueDate: undefined,
  dueAllDay: false,
  startedAt: undefined,
  completedAt: undefined,
  labels: [],
  estimateHours: undefined,
  assignees: [],
  reviewers: [],
  dependencies: [],
  groupId: undefined,
} as const satisfies StrictOmit<
  Task,
  'id' | 'title' | 'createdAt' | 'updatedAt'
>;
