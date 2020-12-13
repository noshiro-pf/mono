import { dbEvents } from '../../initialize-firebase';
import { IEventSchedule } from '../../types/record/event-schedule';

export const addEventSchedule = async (ev: IEventSchedule): Promise<string> => {
  const docRef = await dbEvents.add(ev.toJS());
  return docRef.id;
};
