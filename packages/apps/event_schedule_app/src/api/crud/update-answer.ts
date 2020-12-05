import { dbEvents } from '../../index';
import { IAnswer } from '../../types/record/answer';
import { firestorePaths } from './collection-name';

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
