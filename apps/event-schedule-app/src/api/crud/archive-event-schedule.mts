import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { Result, expectType, unknownToString } from 'ts-data-forge';
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

export const unarchiveEventSchedule =
  ({ firestoreEvents }: FirebaseHandles) =>
  (eventId: string, user: User): Promise<Result<void, string>> =>
    Result.fromPromise(
      updateDoc(doc(firestoreEvents, eventId), {
        archivedBy: arrayRemove(user),
      }),
    ).then(Result.fold(() => undefined, unknownToString));
