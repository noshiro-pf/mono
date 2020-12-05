import { dbEvents } from '../../index';
import { IAnswer } from '../../types/record/answer';
import { firestorePaths } from './collection-name';

export const deleteAnswer = async (
  eventId: string,
  answerId: IAnswer['id']
): Promise<void> => {
  await dbEvents
    .doc(eventId)
    .collection(firestorePaths.answers)
    .doc(answerId)
    .delete();
};
