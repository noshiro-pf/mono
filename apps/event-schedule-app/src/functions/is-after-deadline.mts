import { compareYmdhm } from 'ts-fortress-types';
import { now } from '../utils/index.mjs';

export const eventIsAfterDeadline = (
  eventSchedule: EventSchedule | undefined,
): boolean =>
  eventSchedule === undefined
    ? false
    : eventSchedule.answerDeadline !== 'none' &&
      compareYmdhm(now(), eventSchedule.answerDeadline) >= 0;
