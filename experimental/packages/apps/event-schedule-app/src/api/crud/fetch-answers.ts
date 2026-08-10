import {
  ANSWER_KEY_CREATED_AT,
  Answer,
  firestorePaths,
} from '@noshiro/event-schedule-app-shared';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { firestoreEvents } from '../../initialize-firebase';

export const fetchAnswers = (
  eventId: string,
): Promise<
  Result<readonly Answer[], Readonly<{ type: 'others'; message: string }>>
> =>
  Result.fromPromise(
    getDocs(
      query(
        collection(firestoreEvents, eventId, firestorePaths.answers),
        orderBy(ANSWER_KEY_CREATED_AT, 'asc'),
      ),
    ),
  ).then((a) =>
    Result.fold(
      a,
      (querySnapshot) =>
        querySnapshot.docs.map((d) => Answer.fill({ ...d.data(), id: d.id })),
      (message) => ({ type: 'others', message: Str.from(message) }) as const,
    ),
  );
