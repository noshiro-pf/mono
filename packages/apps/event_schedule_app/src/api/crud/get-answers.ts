import type { Answer } from '@noshiro/event-schedule-app-shared';
import {
  ANSWER_KEY_CREATED_AT,
  createAnswerId,
  fillAnswer,
  firestorePaths,
} from '@noshiro/event-schedule-app-shared';
import { Result } from '@noshiro/ts-utils';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { dbEvents } from '../../initialize-firebase';

export const getAnswers = (
  eventId: string
): Promise<
  Result<readonly Answer[], Readonly<{ type: 'others'; message: string }>>
> =>
  Result.fromPromise(
    getDocs(
      query(
        collection(dbEvents, eventId, firestorePaths.answers),
        orderBy(ANSWER_KEY_CREATED_AT, 'asc')
      )
    )
  ).then(
    Result.fold(
      (querySnapshot) =>
        querySnapshot.docs.map((d) =>
          fillAnswer({ ...d.data(), id: createAnswerId(d.id) })
        ),
      (message) => ({ type: 'others', message: String(message) })
    )
  );
