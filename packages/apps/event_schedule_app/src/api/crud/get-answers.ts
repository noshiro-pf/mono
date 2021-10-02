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

export const getAnswers = async (
  eventId: string
): Promise<Result<readonly Answer[], 'not-found' | 'others'>> => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(dbEvents, eventId, firestorePaths.answers),
        orderBy(ANSWER_KEY_CREATED_AT, 'asc')
      )
    );

    return Result.ok(
      querySnapshot.docs.map((d) =>
        fillAnswer({ ...d.data(), id: createAnswerId(d.id) })
      )
    );
  } catch (e: unknown) {
    console.log(e);
    return Result.err('others');
  }
};
