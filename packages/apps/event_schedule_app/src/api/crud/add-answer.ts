import type { Answer } from '@noshiro/event-schedule-app-shared';
import { firestorePaths } from '@noshiro/event-schedule-app-shared';
import { addDoc, collection } from 'firebase/firestore';
import { dbEvents } from '../../initialize-firebase';

export const addAnswer = async (
  eventId: string,
  answer: Answer
): Promise<string> => {
  const docRef = await addDoc(
    collection(dbEvents, eventId, firestorePaths.answers),
    answer
  );
  return docRef.id;
};
