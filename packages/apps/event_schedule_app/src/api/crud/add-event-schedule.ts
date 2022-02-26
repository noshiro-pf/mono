import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { Result } from '@noshiro/ts-utils';
import { addDoc } from 'firebase/firestore';
import { dbEvents } from '../../initialize-firebase';

export const addEventSchedule = (
  ev: EventSchedule
): Promise<Result<string, string>> =>
  Result.fromPromise(addDoc(dbEvents, ev)).then(
    Result.fold((docRef) => docRef.id, String)
  );
