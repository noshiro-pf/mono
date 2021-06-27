import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { dbEvents } from '../../initialize-firebase';

export const addEventSchedule = async (ev: EventSchedule): Promise<string> => {
  const docRef = await dbEvents.add(ev);
  return docRef.id;
};
