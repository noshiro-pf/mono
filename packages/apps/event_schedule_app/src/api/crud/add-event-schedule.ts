import { dbEvents } from '../../initialize-firebase';
import type { IEventSchedule } from '../../types';

export const addEventSchedule = async (ev: IEventSchedule): Promise<string> => {
  const docRef = await dbEvents.add(ev.toJS());
  return docRef.id;
};
