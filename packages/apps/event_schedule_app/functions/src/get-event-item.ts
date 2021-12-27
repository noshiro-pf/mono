import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { firestorePaths } from '@noshiro/event-schedule-app-shared';
import * as admin from 'firebase-admin';
import { fillEventScheduleWithCheck } from './type-check';

export const getEventItem = async (
  eventId: string
): Promise<EventSchedule | undefined> => {
  const res = await admin
    .firestore()
    .collection(firestorePaths.events)
    .doc(eventId)
    .get();
  const data = res.data();
  return data === undefined ? undefined : fillEventScheduleWithCheck(data);
};
