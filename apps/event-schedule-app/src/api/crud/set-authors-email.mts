import { firestorePaths } from 'event-schedule-app-shared';
import { doc, setDoc } from 'firebase/firestore';
import { Result, unknownToString } from 'ts-data-forge';
import type { FirebaseHandles } from '../firebase.mjs';

export const setAuthorsEmail =
  ({ firestoreEvents }: FirebaseHandles) =>
  (eventId: string, email: string): Promise<Result<void, string>> =>
    Result.fromPromise(
      setDoc(
        doc(
          firestoreEvents,
          eventId,
          firestorePaths.internal,
          firestorePaths.values,
        ),
        { [firestorePaths.email]: email },
      ),
    ).then(Result.fold(() => undefined, unknownToString));
