import { firestorePaths } from 'event-schedule-app-shared';
import { deleteDoc, doc } from 'firebase/firestore';
import { Result, unknownToString } from 'ts-data-forge';
import type { FirebaseHandles } from '../firebase.mjs';

export const deleteAnswer =
  ({ firestoreEvents }: FirebaseHandles) =>
  (eventId: string, answerId: Answer['id']): Promise<Result<void, string>> =>
    Result.fromPromise(
      deleteDoc(
        doc(firestoreEvents, eventId, firestorePaths.answers, answerId),
      ),
    ).then(Result.fold(() => undefined, unknownToString));
