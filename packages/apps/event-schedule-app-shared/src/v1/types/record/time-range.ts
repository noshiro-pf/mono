import {
  compareHm,
  defaultHoursMinutes,
  fillHoursMinutes,
  type HoursMinutes,
  type PartialHoursMinutes,
} from './base';

export type TimeRange = Readonly<{
  start: HoursMinutes;
  end: HoursMinutes;
}>;

export type PartialTimeRange = Partial<
  Readonly<{
    start: PartialHoursMinutes;
    end: PartialHoursMinutes;
  }>
>;

export const defaultTimeRange: TimeRange = {
  start: defaultHoursMinutes,
  end: defaultHoursMinutes,
} as const;

const d = defaultTimeRange;
export const fillTimeRange = (p?: PartialTimeRange): TimeRange => ({
  start: fillHoursMinutes(p?.start ?? d.start),
  end: fillHoursMinutes(p?.end ?? d.end),
});

export const compareTimeRange = (a: TimeRange, b: TimeRange): number => {
  const compareStartHmResult = compareHm(a.start, b.start);
  if (compareStartHmResult !== 0) return compareStartHmResult;
  const compareEndHmResult = compareHm(a.end, b.end);
  if (compareEndHmResult !== 0) return compareEndHmResult;
  return 0;
};
