import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { firestoreEvents } from '../../initialize-firebase';

type KeyT = 'archivedBy';
const key: KeyT = 'archivedBy';

expectType<KeyT, keyof EventSchedule>('<=');
expectType<User, EventSchedule[KeyT][number]>('=');

export const archiveEventSchedule = (
  eventId: string,
  user: User,
): Promise<Result<void, string>> =>
  Result.fromPromise(
    updateDoc(doc(firestoreEvents, eventId), {
      [key]: arrayUnion(user),
    }),
  ).then((a) => Result.fold(a, () => undefined, Str.from));

export const unarchiveEventSchedule = (
  eventId: string,
  user: User,
): Promise<Result<void, string>> =>
  Result.fromPromise(
    updateDoc(doc(firestoreEvents, eventId), {
      archivedBy: arrayRemove(user),
    }),
  ).then((a) => Result.fold(a, () => undefined, Str.from));
