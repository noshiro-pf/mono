import * as t from '@noshiro/io-ts';
import { compareHm, HoursMinutes } from './hours-minutes.mjs';

export const TimeRange = t.record({
  start: HoursMinutes,
  end: HoursMinutes,
});

export type TimeRange = t.TypeOf<typeof TimeRange>;

export const compareTimeRange = (a: TimeRange, b: TimeRange): number => {
  const compareStartHmResult = compareHm(a.start, b.start);
  if (compareStartHmResult !== 0) return compareStartHmResult;
  const compareEndHmResult = compareHm(a.end, b.end);
  if (compareEndHmResult !== 0) return compareEndHmResult;
  return 0;
};
