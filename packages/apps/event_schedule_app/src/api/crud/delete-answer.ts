import type { Answer } from '@noshiro/event-schedule-app-api';
import { firestorePaths } from '@noshiro/event-schedule-app-api';
import { dbEvents } from '../../initialize-firebase';

export const deleteAnswer = async (
  eventId: string,
  answerId: Answer['id']
): Promise<void> => {
  await dbEvents
    .doc(eventId)
    .collection(firestorePaths.answers)
    .doc(answerId)
    .delete();
};
