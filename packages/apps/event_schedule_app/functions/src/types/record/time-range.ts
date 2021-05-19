import type { HoursMinutesType } from './base';

export type TimeRangeJsType = Readonly<{
  start: HoursMinutesType;
  end: HoursMinutesType;
}>;
