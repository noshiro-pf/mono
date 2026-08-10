import { firestorePaths } from '@noshiro/event-schedule-app-shared';
import { deleteDoc, doc } from 'firebase/firestore';
import { firestoreEvents } from '../../initialize-firebase';

export const deleteAnswer = (
  eventId: string,
  answerId: Answer['id'],
): Promise<Result<void, string>> =>
  Result.fromPromise(
    deleteDoc(doc(firestoreEvents, eventId, firestorePaths.answers, answerId)),
  ).then((a) => Result.fold(a, () => undefined, Str.from));
