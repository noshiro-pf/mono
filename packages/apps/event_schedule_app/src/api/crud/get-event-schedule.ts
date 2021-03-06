import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { fillEventSchedule } from '@noshiro/event-schedule-app-shared';
import { Result } from '@noshiro/ts-utils';
import { dbEvents } from '../../initialize-firebase';

export const getEventSchedule = async (
  id: string
): Promise<Result<EventSchedule, 'not-found' | 'others'>> => {
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
