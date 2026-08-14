import { firestorePaths } from 'event-schedule-app-shared';
import { addDoc, collection } from 'firebase/firestore';
import { Result, unknownToString } from 'ts-data-forge';
import { firestoreEvents } from '../../initialize-firebase.mjs';

export const addAnswer = (
  eventId: string,
  answer: Answer,
): Promise<Result<string, string>> =>
  Result.fromPromise(
    addDoc(
      collection(firestoreEvents, eventId, firestorePaths.answers),
      answer,
    ),
  ).then(Result.fold((docRef) => docRef.id, unknownToString));
