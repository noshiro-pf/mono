import { dbEvents } from '../../index';
import { IAnswer } from '../../types/record/answer';
import { firestorePaths } from './collection-name';

export const addAnswer = async (
  eventId: string,
  answer: IAnswer
): Promise<string> => {
  const docRef = await dbEvents
    .doc(eventId)
    .collection(firestorePaths.answers)
    .add(answer.toJS());
  return docRef.id;
};
