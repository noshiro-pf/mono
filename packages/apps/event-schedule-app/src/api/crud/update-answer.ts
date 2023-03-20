import { firestorePaths } from '@noshiro/event-schedule-app-shared';
import { doc, setDoc } from 'firebase/firestore';
import { firestoreEvents } from '../../initialize-firebase';

export const updateAnswer = (
  eventId: string,
  answerId: Answer['id'],
  answer: Answer
): Promise<Result<void, string>> =>
  Result.fromPromise(
    setDoc(
      doc(firestoreEvents, eventId, firestorePaths.answers, answerId),
      answer
    )
  ).then((a) => Result.fold(a, () => undefined, Str.from));
