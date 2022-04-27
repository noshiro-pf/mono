import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { firestore } from 'firebase-admin';
import { collectionPath } from './firestore-paths';
import { fillEventScheduleWithCheck } from './type-check';

export const getEventItem = async (
  eventId: string
): Promise<EventSchedule | undefined> => {
  const res = await firestore()
    .collection(collectionPath.events)
    .doc(eventId)
    .get();
  const data = res.data();
  return data === undefined ? undefined : fillEventScheduleWithCheck(data);
};
