import { firestorePaths, type EventSchedule } from 'event-schedule-app-shared';
import type { DocumentData, Firestore } from 'firebase-admin/firestore';
import type { DeepReadonly } from 'ts-type-forge';
import { fillEventScheduleWithCheck, isEmailData } from './types/index.mjs';

export const getEventItem = async (
  db: Firestore,
  eventId: string,
): Promise<EventSchedule | undefined> => {
  const res = await db.collection(firestorePaths.events).doc(eventId).get();

  return eventOf(res.data());
};

/** The event in the data of its document, `undefined` when there is none. */
export const eventOf = (
  data: DeepReadonly<DocumentData> | undefined,
): EventSchedule | undefined =>
  data === undefined ? undefined : fillEventScheduleWithCheck(data);

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

  return emailOf(res.data());
};

/** The email in the data of an event's `internal/values`, `''` when none. */
export const emailOf = (
  data: DeepReadonly<DocumentData> | undefined,
): string => (isEmailData(data) ? data.email : '');
