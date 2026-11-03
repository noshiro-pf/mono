import {
  utcMidnightMillis,
  wallClockInOffset,
} from 'event-schedule-app-shared';
import { asPositiveSafeInt, Num } from 'ts-data-forge';
import type { Ymdhm } from 'ts-fortress-types';
import type { PositiveSafeInt } from 'ts-type-forge';

/**
 * Whether the deadline's date is `n` days after today, both dates taken in the
 * event's own zone (`timezoneOffsetMinutes`) at `nowMillis`.
 */
export const todayIsNDaysBeforeDeadline = (
  n: 0 | 1 | 3 | 7 | 14 | 28,
  answerDeadline: Ymdhm,
  timezoneOffsetMinutes: number,
  nowMillis: number,
): boolean => {
  const daysDiff: number = Num.div(
    utcMidnightMillis(answerDeadline) -
      utcMidnightMillis(wallClockInOffset(nowMillis, timezoneOffsetMinutes)),
    millisecOfADay,
  );

  return daysDiff === n;
};

const millisecOfADay: PositiveSafeInt = asPositiveSafeInt(24 * 3600 * 1000);
