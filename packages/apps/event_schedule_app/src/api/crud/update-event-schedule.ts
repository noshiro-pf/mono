import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { Result, Str } from '@noshiro/ts-utils';
import { doc, setDoc } from 'firebase/firestore';
import { dbEvents } from '../../initialize-firebase';

export const updateEventSchedule = (
  eventId: string,
  ev: EventSchedule
): Promise<Result<void, string>> =>
  Result.fromPromise(setDoc(doc(dbEvents, eventId), ev)).then(
    Result.fold(() => undefined, Str.from)
  );
