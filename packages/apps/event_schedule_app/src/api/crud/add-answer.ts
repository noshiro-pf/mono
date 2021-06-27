import type { Answer } from '@noshiro/event-schedule-app-shared';
import { firestorePaths } from '@noshiro/event-schedule-app-shared';
import { dbEvents } from '../../initialize-firebase';

export const addAnswer = async (
  eventId: string,
  answer: Answer
): Promise<string> => {
  const docRef = await dbEvents
    .doc(eventId)
    .collection(firestorePaths.answers)
    .add(answer);
  return docRef.id;
};
