import type { Answer } from '@noshiro/event-schedule-app-shared';
import { firestorePaths } from '@noshiro/event-schedule-app-shared';
import { deleteDoc, doc } from 'firebase/firestore';
import { dbEvents } from '../../initialize-firebase';

export const deleteAnswer = (
  eventId: string,
  answerId: Answer['id']
): Promise<Result<void, string>> =>
  Result.fromPromise(
    deleteDoc(doc(dbEvents, eventId, firestorePaths.answers, answerId))
  ).then(Result.fold(() => undefined, Str.from));
