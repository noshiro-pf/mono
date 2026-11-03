import { answerDeadlineMillis } from 'event-schedule-app-shared';
import type { Ymdhm } from 'ts-fortress-types';
import type { MinutesEnum } from 'ts-type-forge';

/**
 * Whether the deadline, read in the event's own zone (`timezoneOffsetMinutes`)
 * as `firestore.rules` reads it, passed in the `minutes` that end at
 * `nowMillis`: after the run before, up to and including this one. Runs every
 * `minutes` apart therefore see each deadline once.
 */
export const deadlinePassed = (
  answerDeadline: Ymdhm,
  timezoneOffsetMinutes: number,
  minutes: MinutesEnum,
  nowMillis: number,
): boolean => {
  const msecDiff: number =
    nowMillis - answerDeadlineMillis(answerDeadline, timezoneOffsetMinutes);

  return 0 <= msecDiff && msecDiff < minutes * 60 * 1000;
};
