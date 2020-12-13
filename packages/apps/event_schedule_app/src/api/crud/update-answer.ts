import { firestorePaths } from '../../constants/firestore-paths';
import { dbEvents } from '../../initialize-firebase';
import { IAnswer } from '../../types/record/answer';

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
