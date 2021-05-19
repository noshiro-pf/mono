import { firestorePaths } from '../../constants';
import { dbEvents } from '../../initialize-firebase';
import type { IAnswer } from '../../types';

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
