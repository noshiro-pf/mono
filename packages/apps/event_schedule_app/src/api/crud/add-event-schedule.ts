import { dbEvents } from '../../index';
import { IEventSchedule } from '../../types/record/event-schedule';

export const addEventSchedule = async (ev: IEventSchedule): Promise<string> => {
  const docRef = await dbEvents.add(ev.toJS());
  return docRef.id;
};
