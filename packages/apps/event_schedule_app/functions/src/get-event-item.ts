import * as admin from 'firebase-admin';
import { firestorePaths } from './constants/firestore-paths';
import type { EventScheduleJsType } from './types/record/event-schedule';

export const getEventItem = async (
  eventId: string
): Promise<EventScheduleJsType> => {
  const res = await admin
    .firestore()
    .collection(firestorePaths.events)
    .doc(eventId)
    .get();
  return res.data() as EventScheduleJsType;
};
