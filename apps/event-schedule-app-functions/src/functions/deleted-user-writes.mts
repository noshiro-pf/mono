import { firestorePaths } from 'event-schedule-app-shared';

/**
 * The writes that take a deleted account off the events it made (`eventIds`)
 * and the answers it gave (`answerPaths`): each names the account by
 * {@link deletedUserId} from then on, and each event's `internal/values` — the
 * account's notification email — is deleted, so no more mail goes to it.
 */
export const deletedUserWrites = ({
  eventIds,
  answerPaths,
}: Readonly<{
  eventIds: readonly string[];
  answerPaths: readonly string[];
}>): readonly DeletedUserWrite[] =>
  [
    ...eventIds.flatMap(
      (eventId) =>
        [
          {
            type: 'set-user-id',
            path: `${firestorePaths.events}/${eventId}`,
            field: 'author.id',
          },
          {
            type: 'delete',
            path: `${firestorePaths.events}/${eventId}/${firestorePaths.internal}/${firestorePaths.values}`,
          },
        ] as const,
    ),
    ...answerPaths.map(
      (path) =>
        ({
          type: 'set-user-id',
          path,
          field: 'user.id',
        }) as const,
    ),
  ] as const;

/**
 * What `author.id` of an event and `user.id` of an answer become once that
 * account is deleted.
 *
 * Not `null`, which is what an event or answer made while signed out has and
 * which `firestore.rules` lets anyone with the URL edit. A Firebase Auth uid is
 * never empty, so `owns` in the rules matches no caller: what the deleted
 * account made stays readable, answers to its events are still taken, and no
 * one edits the event or those answers again.
 */
export const deletedUserId = '';

export type DeletedUserWrite = Readonly<
  | {
      type: 'set-user-id';
      path: string;
      field: 'author.id' | 'user.id';
    }
  | {
      type: 'delete';
      path: string;
    }
>;
