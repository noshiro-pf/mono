import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { dbEvents } from '../../initialize-firebase';

type KeyType = 'archivedBy';
const key: KeyType = 'archivedBy';

assertType<TypeExtends<KeyType, keyof EventSchedule>>();
assertType<TypeEq<User, EventSchedule[KeyType][number]>>();

export const archiveEventSchedule = (
  eventId: string,
  user: User
): Promise<Result<void, string>> =>
  Result.fromPromise(
    updateDoc(doc(dbEvents, eventId), {
      [key]: arrayUnion(user),
    })
  ).then(Result.fold(() => undefined, Str.from));

export const unarchiveEventSchedule = (
  eventId: string,
  user: User
): Promise<Result<void, string>> =>
  Result.fromPromise(
    updateDoc(doc(dbEvents, eventId), {
      archivedBy: arrayRemove(user),
    })
  ).then(Result.fold(() => undefined, Str.from));
