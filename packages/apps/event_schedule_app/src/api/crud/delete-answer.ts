import type { Answer } from '@noshiro/event-schedule-app-shared';
import { firestorePaths } from '@noshiro/event-schedule-app-shared';
import { deleteDoc, doc } from 'firebase/firestore';
import { dbEvents } from '../../initialize-firebase';

export const deleteAnswer = async (
  eventId: string,
  answerId: Answer['id']
): Promise<void> => {
  await deleteDoc(doc(dbEvents, eventId, firestorePaths.answers, answerId));
};
