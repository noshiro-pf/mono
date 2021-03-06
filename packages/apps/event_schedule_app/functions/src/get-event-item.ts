import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { firestorePaths } from '@noshiro/event-schedule-app-shared';
import * as admin from 'firebase-admin';

export const getEventItem = async (eventId: string): Promise<EventSchedule> => {
  const res = await admin
    .firestore()
    .collection(firestorePaths.events)
    .doc(eventId)
    .get();
  return res.data() as EventSchedule;
};
