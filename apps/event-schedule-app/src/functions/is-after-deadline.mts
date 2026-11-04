import { isAfterAnswerDeadline } from 'event-schedule-app-shared';
import { DateUtils } from 'ts-fortress-types';

/**
 * Whether answers to the event are closed now: read in the event's own zone, as
 * `firestore.rules` reads it, rather than the viewer's.
 */
export const eventIsAfterDeadline = (
  eventSchedule: EventSchedule | undefined,
): boolean =>
  eventSchedule !== undefined &&
  isAfterAnswerDeadline(eventSchedule, DateUtils.now());
