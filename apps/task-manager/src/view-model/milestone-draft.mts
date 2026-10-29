/** A milestone as its form holds it while it is being edited; see `task-draft.mts`. */

import { Result } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import type { Milestone } from '../domain/index.mjs';
import { m } from '../i18n/index.mjs';
import { dateField, draftedDate } from './date-draft.mjs';
import { groupIdOfDraft } from './task-draft.mjs';

export const milestoneToDraft = (
  milestone: Milestone,
  timeZone?: string,
): MilestoneDraft =>
  ({
    title: milestone.title,
    description: milestone.description,
    date: dateField(milestone.date, milestone.dateAllDay, timeZone),
    dateAllDay: milestone.dateAllDay,
    requiresManualCheck: milestone.requiresManualCheck,
    checkedAt: milestone.checkedAt,
    groupId: milestone.groupId ?? '',
  }) as const;

/**
 * `milestone` with the draft applied at `now`, or a message saying which
 * field is wrong. A milestone that no longer needs a manual check loses the
 * one it had, so turning the requirement back on asks for a new one. The
 * dependencies are left as they are on `milestone`.
 */
export const applyMilestoneDraft = (
  milestone: Milestone,
  draft: MilestoneDraft,
  now: number,
  timeZone?: string,
): Result<Milestone, string> => {
  const title = draft.title.trim();

  if (title === '') {
    return Result.err(m.drafts.titleRequired);
  }

  const date = draftedDate(
    draft.date,
    draft.dateAllDay,
    { at: milestone.date, allDay: milestone.dateAllDay },
    'start',
    timeZone,
  );

  if (Result.isErr(date)) {
    return Result.err(m.drafts.invalidDate);
  }

  return Result.ok({
    ...milestone,
    title,
    description: draft.description,
    date: date.value.at,
    dateAllDay: date.value.allDay,
    requiresManualCheck: draft.requiresManualCheck,
    checkedAt: draft.requiresManualCheck ? draft.checkedAt : undefined,
    groupId: groupIdOfDraft(draft.groupId),
    updatedAt: now,
  });
};

export type MilestoneDraft = DeepReadonly<{
  title: string;
  description: string;
  /** As a task's `dueDate`. */
  date: string;
  /** Whether the date is a day, reached as it starts. */
  dateAllDay: boolean;
  requiresManualCheck: boolean;
  /** Set by the 「解消」 button, cleared by 「未解消に戻す」. */
  checkedAt: number | undefined;
  /** As a task's. */
  groupId: string;
}>;
