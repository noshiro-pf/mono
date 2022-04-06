import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { fillEventSchedule } from '@noshiro/event-schedule-app-shared';
import { Result, Str } from '@noshiro/ts-utils';
import { doc, getDoc } from 'firebase/firestore';
import { dbEvents } from '../../initialize-firebase';

export const getEventSchedule = async (
  id: string
): Promise<
  Result<
    EventSchedule,
    Readonly<{ type: 'not-found' | 'others'; message: string }>
  >
> => {
  try {
    const res = await getDoc(doc(dbEvents, id));
    if (!res.exists()) {
      return Result.err({
        type: 'not-found' as const,
        message: `event of id "${id}" not-found`,
      });
    }
    return Result.ok(fillEventSchedule(res.data()));
  } catch (error: unknown) {
    return Result.err({ type: 'others' as const, message: Str.from(error) });
  }
};
