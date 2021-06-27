import type { EventSchedule } from '@noshiro/event-schedule-app-api';
import { dbEvents } from '../../initialize-firebase';

export const updateEventSchedule = async (
  eventId: string,
  ev: EventSchedule
): Promise<void> => {
  await dbEvents.doc(eventId).set(ev);
};
