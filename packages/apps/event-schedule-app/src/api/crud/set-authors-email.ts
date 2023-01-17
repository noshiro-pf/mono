import { firestorePaths } from '@noshiro/event-schedule-app-shared';
import { doc, setDoc } from 'firebase/firestore';
import { firestoreEvents } from '../../initialize-firebase';

export const setAuthorsEmail = (
  eventId: string,
  email: string
): Promise<Result<void, string>> =>
  Result.fromPromise(
    setDoc(
      doc(
        firestoreEvents,
        eventId,
        firestorePaths.internal,
        firestorePaths.values
      ),
      {
        [firestorePaths.email]: email,
      }
    )
  ).then(Result.fold(() => undefined, Str.from));
