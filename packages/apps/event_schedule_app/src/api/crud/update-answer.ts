import type { Answer } from '@noshiro/event-schedule-app-api';
import { firestorePaths } from '@noshiro/event-schedule-app-api';
import { dbEvents } from '../../initialize-firebase';

export const updateAnswer = async (
  eventId: string,
  answerId: Answer['id'],
  answer: Answer
): Promise<void> => {
  await dbEvents
    .doc(eventId)
    .collection(firestorePaths.answers)
    .doc(answerId)
    .set(answer);
};
