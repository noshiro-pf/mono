/** A milestone as its form holds it while it is being edited; see `task-draft.mts`. */

import { Result } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import type { Milestone } from '../domain/index.mjs';
import { toDateTimeLocal } from './datetime-local.mjs';
import { optionalDateTime } from './task-draft.mjs';

export const milestoneToDraft = (
  milestone: Milestone,
  timeZone?: string,
): MilestoneDraft =>
  ({
    title: milestone.title,
    description: milestone.description,
    date:
      milestone.date === undefined
        ? ('' as const)
        : toDateTimeLocal(milestone.date, timeZone),
    requiresManualCheck: milestone.requiresManualCheck,
    checkedAt: milestone.checkedAt,
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
    return Result.err('タイトルを入力してください。');
  }

  const date = optionalDateTime(draft.date, timeZone);

  if (Result.isErr(date)) {
    return Result.err('日時が正しくありません。');
  }

  return Result.ok({
    ...milestone,
    title,
    description: draft.description,
    date: date.value,
    requiresManualCheck: draft.requiresManualCheck,
    checkedAt: draft.requiresManualCheck ? draft.checkedAt : undefined,
    updatedAt: now,
  });
};

export type MilestoneDraft = DeepReadonly<{
  title: string;
  description: string;
  /** As `<input type="datetime-local">` holds it; empty for none. */
  date: string;
  requiresManualCheck: boolean;
  /** Set by the 「解消」 button, cleared by 「未解消に戻す」. */
  checkedAt: number | undefined;
}>;
