import {
  ANSWER_KEY_CREATED_AT,
  Answer,
  firestorePaths,
} from 'event-schedule-app-shared';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Result, unknownToString } from 'ts-data-forge';
import type { FirebaseHandles } from '../firebase.mjs';

export const fetchAnswers =
  ({ firestoreEvents }: FirebaseHandles) =>
  (
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
    ).then(
      Result.fold(
        (querySnapshot) =>
          querySnapshot.docs.map((d) => Answer.fill({ ...d.data(), id: d.id })),
        (message) =>
          ({ type: 'others', message: unknownToString(message) }) as const,
      ),
    );
