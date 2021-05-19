import { dbEvents } from '../../initialize-firebase';
import type { IEventSchedule } from '../../types';

export const updateEventSchedule = async (
  eventId: string,
  ev: IEventSchedule
): Promise<void> => {
  await dbEvents.doc(eventId).set(ev.toJS());
};
