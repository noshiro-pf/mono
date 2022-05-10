import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { fillEventSchedule } from '@noshiro/event-schedule-app-shared';
import type { firestore } from 'firebase-admin';
import { https } from 'firebase-functions';
import { collectionPath } from './firestore-paths';
import { removeEmailFromEventSchedule } from './remove-email';

export const fetchEventOfIdImpl = async (
  db: firestore.Firestore,
  eventId: string
): Promise<EventSchedule> => {
  const res = await db.doc(`${collectionPath.events}/${eventId}`).get();

  if (!res.exists) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new https.HttpsError(
      'not-found',
      `event of id "${eventId}" not-found`
    );
  }

  return removeEmailFromEventSchedule(fillEventSchedule(res.data()));
};
