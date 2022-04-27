import { hasKey, hasKeyValue, isNonNullObject } from '@noshiro/ts-utils';
import type { HoursMinutes } from './base';
import {
  compareHm,
  fillHoursMinutes,
  hoursMinutesDefaultValue,
  isHoursMinutes,
} from './base';

export type TimeRange = Readonly<{
  start: HoursMinutes;
  end: HoursMinutes;
}>;

export const timeRangeDefaultValue: TimeRange = {
  start: hoursMinutesDefaultValue,
  end: hoursMinutesDefaultValue,
} as const;

export const isTimeRange = (a: unknown): a is TimeRange =>
  isNonNullObject(a) &&
  hasKeyValue(a, 'start', isHoursMinutes) &&
  hasKeyValue(a, 'end', isHoursMinutes);

const d = timeRangeDefaultValue;

export const fillTimeRange = (a?: unknown): TimeRange =>
  !isNonNullObject(a)
    ? d
    : {
        start: hasKey(a, 'start') ? fillHoursMinutes(a.start) : d.start,
        end: hasKey(a, 'end') ? fillHoursMinutes(a.end) : d.end,
      };

export const compareTimeRange = (a: TimeRange, b: TimeRange): number => {
  const compareStartHmResult = compareHm(a.start, b.start);
  if (compareStartHmResult !== 0) return compareStartHmResult;
  const compareEndHmResult = compareHm(a.end, b.end);
  if (compareEndHmResult !== 0) return compareEndHmResult;
  return 0;
};
