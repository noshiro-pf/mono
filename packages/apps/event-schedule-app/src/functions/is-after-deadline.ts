import { compareYmdhm } from '@noshiro/event-schedule-app-shared';
import { now } from './today';

export const eventIsAfterDeadline = (
  eventSchedule: EventSchedule | undefined
): boolean =>
  eventSchedule === undefined
    ? false
    : eventSchedule.answerDeadline !== 'none' &&
      compareYmdhm(now(), eventSchedule.answerDeadline) >= 0;