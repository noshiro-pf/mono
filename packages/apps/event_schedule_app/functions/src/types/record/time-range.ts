import { HoursMinutesType } from './base/hours-minutes';

export type TimeRangeJsType = Readonly<{
  start: HoursMinutesType;
  end: HoursMinutesType;
}>;
