import * as t from '@noshiro/io-ts';
import { compareHm, hoursMinutesTypeDef } from './base/index.mjs';

export const timeRangeTypeDef = t.record({
  start: hoursMinutesTypeDef,
  end: hoursMinutesTypeDef,
});

export type TimeRange = t.TypeOf<typeof timeRangeTypeDef>;

export const timeRangeDefaultValue = timeRangeTypeDef.defaultValue;

export const isTimeRange = timeRangeTypeDef.is;

export const fillTimeRange = timeRangeTypeDef.fill;

export const compareTimeRange = (a: TimeRange, b: TimeRange): number => {
  const compareStartHmResult = compareHm(a.start, b.start);
  if (compareStartHmResult !== 0) return compareStartHmResult;
  const compareEndHmResult = compareHm(a.end, b.end);
  if (compareEndHmResult !== 0) return compareEndHmResult;
  return 0;
};
