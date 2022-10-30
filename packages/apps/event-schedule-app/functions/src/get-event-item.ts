import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { firestorePaths } from '@noshiro/event-schedule-app-shared';
import { mapOptional } from '@noshiro/ts-utils';
import type { firestore } from 'firebase-admin';
import { collectionPath } from './constants';
import { fillEventScheduleWithCheck, isEmailData } from './types';

export const getEventItem = async (
  db: firestore.Firestore,
  eventId: string
): Promise<EventSchedule | undefined> => {
  const res = await db.collection(collectionPath.events).doc(eventId).get();
  const data = res.data();
  return mapOptional(data, fillEventScheduleWithCheck);
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
  if (isEmailData(data)) {
    return data.email;
  }

  return '';
};
