import { IRecord, isRecord } from '@noshiro/ts-utils';
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
  isRecord(a) &&
  IRecord.hasKeyValue(a, 'start', isHoursMinutes) &&
  IRecord.hasKeyValue(a, 'end', isHoursMinutes);

const d = timeRangeDefaultValue;

export const fillTimeRange = (a?: unknown): TimeRange =>
  a === undefined || !isRecord(a)
    ? d
    : {
        start: IRecord.hasKey(a, 'start') ? fillHoursMinutes(a.start) : d.start,
        end: IRecord.hasKey(a, 'end') ? fillHoursMinutes(a.end) : d.end,
      };

export const compareTimeRange = (a: TimeRange, b: TimeRange): number => {
  const compareStartHmResult = compareHm(a.start, b.start);
  if (compareStartHmResult !== 0) return compareStartHmResult;
  const compareEndHmResult = compareHm(a.end, b.end);
  if (compareEndHmResult !== 0) return compareEndHmResult;
  return 0;
};
