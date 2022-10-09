import { firestorePaths } from '@noshiro/event-schedule-app-shared';
import { addDoc, collection } from 'firebase/firestore';
import { firestoreEvents } from '../../initialize-firebase';

export const addAnswer = (
  eventId: string,
  answer: Answer
): Promise<Result<string, string>> =>
  Result.fromPromise(
    addDoc(collection(firestoreEvents, eventId, firestorePaths.answers), answer)
  ).then(Result.fold((docRef) => docRef.id, Str.from));
