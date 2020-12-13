import { firestorePaths } from '../../constants/firestore-paths';
import { dbEvents } from '../../initialize-firebase';
import { fillAnswer, IAnswer } from '../../types/record/answer';
import { IList } from '../../utils/immutable';

export const getAnswers = async (eventId: string): Promise<IList<IAnswer>> => {
  const querySnapshot = await dbEvents
    .doc(eventId)
    .collection(firestorePaths.answers)
    .orderBy('createdAt', 'asc')
    .get();
  return IList<IAnswer>(
    querySnapshot.docs.map((d) => fillAnswer({ ...d.data(), id: d.id }))
  );
};
