import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { addDoc } from 'firebase/firestore';
import { dbEvents } from '../../initialize-firebase';

export const addEventSchedule = async (ev: EventSchedule): Promise<string> => {
  const docRef = await addDoc(dbEvents, ev);
  return docRef.id;
};
