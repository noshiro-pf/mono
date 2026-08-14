import { hasKey, isRecord } from 'ts-data-forge';
import { hasKeyValue } from '../../../utils/index.mjs';
import {
  compareHm,
  fillHoursMinutes,
  hoursMinutesDefaultValue,
  isHoursMinutes,
  type HoursMinutes,
} from './base/index.mjs';

export type TimeRange = Readonly<{
  start: HoursMinutes;
  end: HoursMinutes;
}>;

export const timeRangeDefaultValue = {
  start: hoursMinutesDefaultValue,
  end: hoursMinutesDefaultValue,
} as const satisfies TimeRange;

export const isTimeRange = (a: unknown): a is TimeRange =>
  isRecord(a) &&
  hasKeyValue(a, 'start', isHoursMinutes) &&
  hasKeyValue(a, 'end', isHoursMinutes);

const d = timeRangeDefaultValue;

export const fillTimeRange = (a?: unknown): TimeRange =>
  a === undefined || !isRecord(a)
    ? d
    : ({
        start: hasKey(a, 'start') ? fillHoursMinutes(a.start) : d.start,
        end: hasKey(a, 'end') ? fillHoursMinutes(a.end) : d.end,
      } as const);

export const compareTimeRange = (a: TimeRange, b: TimeRange): number => {
  const compareStartHmResult = compareHm(a.start, b.start);

  if (compareStartHmResult !== 0) return compareStartHmResult;

  const compareEndHmResult = compareHm(a.end, b.end);

  if (compareEndHmResult !== 0) return compareEndHmResult;

  return 0;
};
