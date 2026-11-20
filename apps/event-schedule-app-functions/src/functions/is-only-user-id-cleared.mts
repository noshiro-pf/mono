import type { Answer } from 'event-schedule-app-shared';
import { fastDeepEqual } from 'ts-data-forge';
import { deletedUserId } from './deleted-user-writes.mjs';

/**
 * Whether `after` is `before` with nothing changed but `user.id` cleared, which
 * is what `onUserDelete` writes once the answerer's account is deleted: to
 * {@link deletedUserId}, or to `null` as it did before. That is not an edit of
 * the answer, so the event's author is not mailed about it.
 */
export const isOnlyUserIdCleared = (before: Answer, after: Answer): boolean =>
  before.user.id !== null &&
  before.user.id !== deletedUserId &&
  (after.user.id === null || after.user.id === deletedUserId) &&
  fastDeepEqual(
    { ...before, user: { ...before.user, id: after.user.id } },
    after,
  );
