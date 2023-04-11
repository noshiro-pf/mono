import { isRecord, Obj } from '@noshiro/ts-utils';
import {
  compareHm,
  fillHoursMinutes,
  hoursMinutesDefaultValue,
  isHoursMinutes,
  type HoursMinutes,
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
  isRecord(a) &&
  Obj.hasKeyValue(a, 'start', isHoursMinutes) &&
  Obj.hasKeyValue(a, 'end', isHoursMinutes);

const d = timeRangeDefaultValue;

export const fillTimeRange = (a?: unknown): TimeRange =>
  a === undefined || !isRecord(a)
    ? d
    : {
        start: Object.hasOwn(a, 'start') ? fillHoursMinutes(a.start) : d.start,
        end: Object.hasOwn(a, 'end') ? fillHoursMinutes(a.end) : d.end,
      };

export const compareTimeRange = (a: TimeRange, b: TimeRange): number => {
  const compareStartHmResult = compareHm(a.start, b.start);
  if (compareStartHmResult !== 0) return compareStartHmResult;
  const compareEndHmResult = compareHm(a.end, b.end);
  if (compareEndHmResult !== 0) return compareEndHmResult;
  return 0;
};
