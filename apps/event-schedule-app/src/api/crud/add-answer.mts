import { firestorePaths } from 'event-schedule-app-shared';
import { addDoc, collection } from 'firebase/firestore';
import { Result, unknownToString } from 'ts-data-forge';
import type { FirebaseHandles } from '../firebase.mjs';

export const addAnswer =
  ({ firestoreEvents }: FirebaseHandles) =>
  (eventId: string, answer: Answer): Promise<Result<string, string>> =>
    Result.fromPromise(
      addDoc(
        collection(firestoreEvents, eventId, firestorePaths.answers),
        answer,
      ),
    ).then(Result.fold((docRef) => docRef.id, unknownToString));
