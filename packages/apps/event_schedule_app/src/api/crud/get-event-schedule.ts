import { dbEvents } from '../../initialize-firebase';
import {
  fillEventSchedule,
  IEventSchedule,
} from '../../types/record/event-schedule';

export const getEventSchedule = async (id: string): Promise<IEventSchedule> => {
  const res = await dbEvents.doc(id).get();
  return fillEventSchedule(res.data() as any);
};
