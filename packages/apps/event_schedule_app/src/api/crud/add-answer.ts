import { firestorePaths } from '../../constants/firestore-paths';
import { dbEvents } from '../../initialize-firebase';
import { IAnswer } from '../../types/record/answer';

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
