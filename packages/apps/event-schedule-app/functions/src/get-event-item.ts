import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { firestorePaths } from '@noshiro/event-schedule-app-shared';
import { IRecord, isRecord, isString } from '@noshiro/ts-utils';
import type { firestore } from 'firebase-admin';
import { collectionPath } from './firestore-paths';
import { fillEventScheduleWithCheck } from './type-check';

export const getEventItem = async (
  db: firestore.Firestore,
  eventId: string
): Promise<EventSchedule | undefined> => {
  const res = await db.collection(collectionPath.events).doc(eventId).get();
  const data = res.data();
  return data === undefined ? undefined : fillEventScheduleWithCheck(data);
};

export const getEmail = async (
  db: firestore.Firestore,
  eventId: string
): Promise<string> => {
  const res = await db
    .collection(collectionPath.events)
    .doc(eventId)
    .collection(firestorePaths.internal)
    .doc(firestorePaths.values)
    .get();

  const data = res.data();
  if (
    isRecord(data) &&
    IRecord.hasKeyValue(data, firestorePaths.email, isString)
  ) {
    return data.email;
  }

  return '';
};
