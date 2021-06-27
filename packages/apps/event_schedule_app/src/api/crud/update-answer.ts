import type { Answer } from '@noshiro/event-schedule-app-shared';
import { firestorePaths } from '@noshiro/event-schedule-app-shared';
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
