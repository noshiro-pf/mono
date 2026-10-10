import { firestorePaths, type EventSchedule } from 'event-schedule-app-shared';
import type { Firestore } from 'firebase-admin/firestore';
import { fillEventScheduleWithCheck, isEmailData } from './types/index.mjs';

export const getEventItem = async (
  db: Firestore,
  eventId: string,
): Promise<EventSchedule | undefined> => {
  const res = await db.collection(firestorePaths.events).doc(eventId).get();

  const data = res.data();

  return data === undefined ? undefined : fillEventScheduleWithCheck(data);
};

export const getEmail = async (
  db: Firestore,
  eventId: string,
): Promise<string> => {
  const res = await db
    .collection(firestorePaths.events)
    .doc(eventId)
    .collection(firestorePaths.internal)
    .doc(firestorePaths.values)
    .get();

  const data = res.data();

  return isEmailData(data) ? data.email : '';
};
