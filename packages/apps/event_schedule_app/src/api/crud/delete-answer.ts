import type { Answer } from '@noshiro/event-schedule-app-shared';
import { firestorePaths } from '@noshiro/event-schedule-app-shared';
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
