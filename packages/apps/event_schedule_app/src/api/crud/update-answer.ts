import { firestorePaths } from '../../constants';
import { dbEvents } from '../../initialize-firebase';
import type { IAnswer } from '../../types';

export const updateAnswer = async (
  eventId: string,
  answerId: IAnswer['id'],
  answer: IAnswer
): Promise<void> => {
  await dbEvents
    .doc(eventId)
    .collection(firestorePaths.answers)
    .doc(answerId)
    .set(answer.toJS());
};
