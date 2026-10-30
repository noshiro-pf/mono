import { firestorePaths } from 'event-schedule-app-shared';
import { doc, setDoc } from 'firebase/firestore';
import { Result, unknownToString } from 'ts-data-forge';
import type { FirebaseHandles } from '../firebase.mjs';

export const updateAnswer =
  ({ firestoreEvents }: FirebaseHandles) =>
  (
    eventId: string,
    answerId: Answer['id'],
    answer: Answer,
  ): Promise<Result<void, string>> =>
    Result.fromPromise(
      setDoc(
        doc(firestoreEvents, eventId, firestorePaths.answers, answerId),
        answer,
      ),
    ).then(Result.fold(() => undefined, unknownToString));
