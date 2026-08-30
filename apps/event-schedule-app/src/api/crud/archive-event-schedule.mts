import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { Result, expectType, unknownToString } from 'ts-data-forge';
import { firestoreEvents } from '../../initialize-firebase.mjs';

type KeyT = 'archivedBy';

const key: KeyT = 'archivedBy';

expectType<KeyT, keyof EventSchedule>('<=');

expectType<User, EventSchedule[KeyT][number]>('=');

export const archiveEventSchedule = (
  eventId: string,
  user: User,
): Promise<Result<void, string>> =>
  Result.fromPromise(
    updateDoc(doc(firestoreEvents, eventId), { [key]: arrayUnion(user) }),
  ).then(Result.fold(() => undefined, unknownToString));

export const unarchiveEventSchedule = (
  eventId: string,
  user: User,
): Promise<Result<void, string>> =>
  Result.fromPromise(
    updateDoc(doc(firestoreEvents, eventId), { archivedBy: arrayRemove(user) }),
  ).then(Result.fold(() => undefined, unknownToString));
