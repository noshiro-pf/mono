import type { Answer } from '@noshiro/event-schedule-app-shared';
import { firestorePaths } from '@noshiro/event-schedule-app-shared';
import { doc, setDoc } from 'firebase/firestore';
import { dbEvents } from '../../initialize-firebase';

export const updateAnswer = (
  eventId: string,
  answerId: Answer['id'],
  answer: Answer
): Promise<Result<void, string>> =>
  Result.fromPromise(
    setDoc(doc(dbEvents, eventId, firestorePaths.answers, answerId), answer)
  ).then(Result.fold(() => undefined, Str.from));
