import { Result } from '@noshiro/ts-utils';
import { dbEvents } from '../../initialize-firebase';
import type { IEventSchedule } from '../../types/record/event-schedule';
import { fillEventSchedule } from '../../types/record/event-schedule';

export const getEventSchedule = async (
  id: string
): Promise<Result<IEventSchedule, 'not-found' | 'others'>> => {
  try {
    const res = await dbEvents.doc(id).get();
    if (!res.exists) {
      console.log(`event of id "${id}" not-found`);
      return Result.err('not-found');
    }
    return Result.ok(fillEventSchedule(res.data()));
  } catch (e: unknown) {
    console.log(e);
    return Result.err('others');
  }
};
