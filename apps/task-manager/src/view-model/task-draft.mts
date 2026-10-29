/**
 * A task as its form holds it while it is being edited — every field a
 * string the way an input gives it back — and the task that results when the
 * form is saved. Nothing is written until then. The dependencies are not
 * part of it: the dialog holds them as rows (`dependency-edit.mts`).
 */

import { Num, Result } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import {
  GroupIdCodec,
  setProgress,
  type GroupId,
  type Priority,
  type Progress,
  type Task,
} from '../domain/index.mjs';
import { m } from '../i18n/index.mjs';
import { dateField, draftedDate } from './date-draft.mjs';
import { formatLabels, parseLabels } from './labels.mjs';

export const taskToDraft = (task: Task, timeZone?: string): TaskDraft =>
  ({
    title: task.title,
    description: task.description,
    progress: task.progress,
    priority: task.priority,
    dueDate: dateField(task.dueDate, task.dueAllDay, timeZone),
    dueAllDay: task.dueAllDay,
    labels: formatLabels(task.labels),
    estimateHours:
      task.estimateHours === undefined
        ? ('' as const)
        : task.estimateHours.toString(),
    groupId: task.groupId ?? '',
  }) as const;

/**
 * `task` with the draft applied at `now`, or a message saying which field is
 * wrong. The progress goes through `setProgress`, so starting and finishing
 * stamp their times; `updatedAt` becomes `now`. The dependencies are left
 * as they are on `task`.
 */
export const applyTaskDraft = (
  task: Task,
  draft: TaskDraft,
  now: number,
  timeZone?: string,
): Result<Task, string> => {
  const title = draft.title.trim();

  if (title === '') {
    return Result.err(m.drafts.titleRequired);
  }

  const dueDate = draftedDate(
    draft.dueDate,
    draft.dueAllDay,
    { at: task.dueDate, allDay: task.dueAllDay },
    'end',
    timeZone,
  );

  if (Result.isErr(dueDate)) {
    return Result.err(m.drafts.invalidDue);
  }

  const estimateHours = optionalNonNegativeNumber(draft.estimateHours);

  if (Result.isErr(estimateHours)) {
    return Result.err(m.drafts.invalidEstimate);
  }

  return Result.ok({
    ...setProgress(task, draft.progress, now),
    title,
    description: draft.description,
    priority: draft.priority,
    dueDate: dueDate.value.at,
    dueAllDay: dueDate.value.allDay,
    labels: parseLabels(draft.labels),
    estimateHours: estimateHours.value,
    groupId: groupIdOfDraft(draft.groupId),
    updatedAt: now,
  });
};

export type TaskDraft = DeepReadonly<{
  title: string;
  description: string;
  progress: Progress;
  priority: Priority;
  /**
   * As `<input type="datetime-local">` holds it — `YYYY-MM-DD` alone while
   * `dueAllDay` — and empty for none.
   */
  dueDate: string;
  /** Whether the due date is a day, ending with it. */
  dueAllDay: boolean;
  /** Comma-separated. */
  labels: string;
  /** Empty for none. */
  estimateHours: string;
  /** The id of the group the task is in; empty for none. */
  groupId: string;
}>;

/** The group a draft's `groupId` field names; none for an empty one. */
export const groupIdOfDraft = (value: string): GroupId | undefined =>
  GroupIdCodec.is(value) ? value : undefined;

const optionalNonNegativeNumber = (
  value: string,
): Result<number | undefined, undefined> => {
  if (value.trim() === '') {
    return Result.ok(undefined);
  }

  const parsed = Num.safeParseFloat(value.trim());

  return Result.isOk(parsed) && parsed.value >= 0
    ? Result.ok(parsed.value)
    : Result.err(undefined);
};
