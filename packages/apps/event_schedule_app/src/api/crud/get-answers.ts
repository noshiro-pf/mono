import { Result } from '@noshiro/ts-utils';
import { firestorePaths } from '../../constants';
import { dbEvents } from '../../initialize-firebase';
import type { IAnswer } from '../../types';
import { answerId, ANSWER_KEY_CREATED_AT, fillAnswer } from '../../types';
import { IList } from '../../utils';

export const getAnswers = async (
  eventId: string
): Promise<Result<IList<IAnswer>, 'not-found' | 'others'>> => {
  try {
    const querySnapshot = await dbEvents
      .doc(eventId)
      .collection(firestorePaths.answers)
      .orderBy(ANSWER_KEY_CREATED_AT, 'asc')
      .get();

    return Result.ok(
      IList<IAnswer>(
        querySnapshot.docs.map((d) =>
          fillAnswer({ ...d.data(), id: answerId(d.id) })
        )
      )
    );
  } catch (e: unknown) {
    console.log(e);
    return Result.err('others');
  }
};
