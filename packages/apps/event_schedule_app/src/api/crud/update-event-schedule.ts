import { dbEvents } from '../../initialize-firebase';
import type { IEventSchedule } from '../../types/record/event-schedule';

export const updateEventSchedule = async (
  eventId: string,
  ev: IEventSchedule
): Promise<void> => {
  await dbEvents.doc(eventId).set(ev.toJS());
};
