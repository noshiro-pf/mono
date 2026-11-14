import { answerDeadlineMillis } from 'event-schedule-app-shared';
import type { Ymdhm } from 'ts-fortress-types';

/**
 * The instant of the deadline, read in the event's own zone
 * (`timezoneOffsetMinutes`) as `firestore.rules` reads it, when it passed in
 * the `lookbackMillis` that end at `nowMillis` — at `nowMillis` at the latest,
 * and less than `lookbackMillis` before it — and `undefined` otherwise.
 */
export const deadlinePassedWithin = (
  answerDeadline: Ymdhm,
  timezoneOffsetMinutes: number,
  lookbackMillis: number,
  nowMillis: number,
): number | undefined => {
  const deadlineMillis = answerDeadlineMillis(
    answerDeadline,
    timezoneOffsetMinutes,
  );

  const msecDiff: number = nowMillis - deadlineMillis;

  return 0 <= msecDiff && msecDiff < lookbackMillis
    ? deadlineMillis
    : undefined;
};
