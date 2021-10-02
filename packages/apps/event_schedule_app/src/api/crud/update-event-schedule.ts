import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { doc, setDoc } from 'firebase/firestore';
import { dbEvents } from '../../initialize-firebase';

export const updateEventSchedule = async (
  eventId: string,
  ev: EventSchedule
): Promise<void> => {
  await setDoc(doc(dbEvents, eventId), ev);
};
