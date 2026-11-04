import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  Arr,
  Result,
  expectType,
  fastDeepEqual,
  hasKey,
  isRecord,
  unknownToString,
} from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import type { FirebaseHandles } from '../firebase.mjs';

type KeyT = 'archivedBy';

const key: KeyT = 'archivedBy';

expectType<KeyT, keyof EventSchedule>('<=');

expectType<User, EventSchedule[KeyT][number]>('=');

export const archiveEventSchedule =
  ({ firestoreEvents }: FirebaseHandles) =>
  (eventId: string, user: User): Promise<Result<void, string>> =>
    Result.fromPromise(
      updateDoc(doc(firestoreEvents, eventId), { [key]: arrayUnion(user) }),
    ).then(Result.fold(() => undefined, unknownToString));

/**
 * Removes the caller's entries from `archivedBy`, matched by `user.id` alone.
 *
 * `arrayRemove` removes only an element equal in every field, and an entry
 * keeps the display name the user had when archiving, so `user` itself would
 * not match it after a rename. The entries are read from the database and each
 * distinct one is removed by its own `arrayRemove`: `isOwnArchiveToggle` in
 * `firestore.rules` admits a write that removes copies of one value only, so
 * entries left under two names (archived, renamed, archived again) take two
 * writes. The rules need no change for this.
 */
export const unarchiveEventSchedule =
  ({ firestoreEvents }: StrictPick<FirebaseHandles, 'firestoreEvents'>) =>
  async (eventId: string, user: User): Promise<Result<void, string>> => {
    if (user.id === null) {
      return Result.err('Only a signed-in user has archived events.');
    }

    const ref = doc(firestoreEvents, eventId);

    try {
      const snapshot = await getDoc(ref);

      if (!snapshot.exists()) {
        return Result.err(`event of id "${eventId}" not-found`);
      }

      // Each write is checked by the rules on its own, against the document as
      // it then is, so their order does not matter.
      await Promise.all(
        entriesToUnarchive(snapshot.get(key), user.id).map((entry) =>
          updateDoc(ref, { [key]: arrayRemove(entry) }),
        ),
      );

      return Result.ok(undefined);
    } catch (error: unknown) {
      return Result.err(unknownToString(error));
    }
  };

/**
 * The distinct elements of a stored `archivedBy` whose `id` is `userId`, as
 * stored, so that `arrayRemove` finds them.
 */
export const entriesToUnarchive = (
  archivedBy: unknown,
  userId: string,
): readonly unknown[] =>
  Arr.isArray(archivedBy)
    ? archivedBy
        .filter(
          (entry: unknown) =>
            isRecord(entry) && hasKey(entry, 'id') && entry.id === userId,
        )
        .filter(
          (entry, index, entries) =>
            entries.findIndex((e) => fastDeepEqual(e, entry)) === index,
        )
    : ([] as const);
