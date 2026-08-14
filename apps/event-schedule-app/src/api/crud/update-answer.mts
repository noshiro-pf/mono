import { firestorePaths } from 'event-schedule-app-shared';
import { doc, setDoc } from 'firebase/firestore';
import { Result, unknownToString } from 'ts-data-forge';
import { firestoreEvents } from '../../initialize-firebase.mjs';

export const updateAnswer = (
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
