import type { Answer } from 'event-schedule-app-shared';
import { fastDeepEqual } from 'ts-data-forge';

/**
 * Whether `after` is `before` with nothing changed but `user.id` cleared to
 * `null`, which is what `onUserDelete` writes once the answerer's account is
 * deleted. That is not an edit of the answer, so the event's author is not
 * mailed about it.
 */
export const isOnlyUserIdCleared = (before: Answer, after: Answer): boolean =>
  before.user.id !== null &&
  after.user.id === null &&
  fastDeepEqual({ ...before, user: { ...before.user, id: null } }, after);
