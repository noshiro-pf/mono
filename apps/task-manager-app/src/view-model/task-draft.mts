/**
 * A task as its form holds it while it is being edited — every field a
 * string the way an input gives it back — and the task that results when the
 * form is saved. Nothing is written until then. The dependencies are not
 * part of it: the dialog holds them as rows (`dependency-edit.mts`).
 */

import { Num, Result } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import {
  setProgress,
  type Priority,
  type Progress,
  type Task,
} from '../domain/index.mjs';
import { fromDateTimeLocal, toDateTimeLocal } from './datetime-local.mjs';
import { formatLabels, parseLabels } from './labels.mjs';

export const taskToDraft = (task: Task, timeZone?: string): TaskDraft =>
  ({
    title: task.title,
    description: task.description,
    progress: task.progress,
    priority: task.priority,
    dueDate:
      task.dueDate === undefined
        ? ('' as const)
        : toDateTimeLocal(task.dueDate, timeZone),
    labels: formatLabels(task.labels),
    estimateHours:
      task.estimateHours === undefined
        ? ('' as const)
        : String(task.estimateHours),
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
    return Result.err('タイトルを入力してください。');
  }

  const dueDate = optionalDateTime(draft.dueDate, timeZone);

  if (Result.isErr(dueDate)) {
    return Result.err('期限の日時が正しくありません。');
  }

  const estimateHours = optionalNonNegativeNumber(draft.estimateHours);

  if (Result.isErr(estimateHours)) {
    return Result.err('見積は 0 以上の数で入力してください。');
  }

  return Result.ok({
    ...setProgress(task, draft.progress, now),
    title,
    description: draft.description,
    priority: draft.priority,
    dueDate: dueDate.value,
    labels: parseLabels(draft.labels),
    estimateHours: estimateHours.value,
    updatedAt: now,
  });
};

export type TaskDraft = DeepReadonly<{
  title: string;
  description: string;
  progress: Progress;
  priority: Priority;
  /** As `<input type="datetime-local">` holds it; empty for none. */
  dueDate: string;
  /** Comma-separated. */
  labels: string;
  /** Empty for none. */
  estimateHours: string;
}>;

/** An empty field is `undefined`; anything else has to be a date and time. */
export const optionalDateTime = (
  value: string,
  timeZone: string | undefined,
): Result<number | undefined, undefined> => {
  if (value.trim() === '') {
    return Result.ok(undefined);
  }

  const epochMs = fromDateTimeLocal(value.trim(), timeZone);

  return epochMs === undefined ? Result.err(undefined) : Result.ok(epochMs);
};

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
