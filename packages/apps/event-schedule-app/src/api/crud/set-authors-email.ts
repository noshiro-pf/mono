import { firestorePaths } from '@noshiro/event-schedule-app-shared';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { dbEvents } from '../../initialize-firebase';

export const setAuthorsEmail = (
  eventId: string,
  email: string
): Promise<Result<void, string>> =>
  Result.fromPromise(
    setDoc(
      doc(dbEvents, eventId, firestorePaths.internal, firestorePaths.values),
      {
        [firestorePaths.email]: email,
      }
    )
  ).then(Result.fold(() => undefined, Str.from));

export const updateAuthorsEmail = (
  eventId: string,
  email: string
): Promise<Result<void, string>> =>
  Result.fromPromise(
    updateDoc(
      doc(dbEvents, eventId, firestorePaths.internal, firestorePaths.values),
      {
        [firestorePaths.email]: email,
      }
    )
  ).then(Result.fold(() => undefined, Str.from));
