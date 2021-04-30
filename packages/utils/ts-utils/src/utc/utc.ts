import {
  DateEnum,
  HoursEnum,
  MillisecondsEnum,
  MinutesEnum,
  MonthEnum,
  SecondsEnum,
  WeekDayEnum,
  YearEnum,
} from '../date';
import { Phantomic, ReadonlyDate } from '../types';

export namespace utc {
  export type UTC = Phantomic<number, 'UTC'>;

  export const now = (): UTC => Date.now() as UTC;

  export const fromDate = (date: ReadonlyDate): UTC => date.getTime() as UTC;

  export const fromNumber = (n: number): UTC => n as UTC;

  export const from = ({
    year = 1970,
    month = 1,
    date = 1,
    minutes = 0,
    seconds = 0,
    milliseconds = 0,
  }: Readonly<{
    year: YearEnum;
    month: MonthEnum;
    date: DateEnum;
    hours: HoursEnum;
    minutes: MinutesEnum;
    seconds: SecondsEnum;
    milliseconds: MillisecondsEnum;
  }>): UTC =>
    new Date(
      year,
      month - 1,
      date,
      minutes,
      seconds,
      milliseconds
    ).getTime() as UTC;

  export const toDateObject = (u: UTC): Date => new Date(u);

  export const getLocale = (
    u: UTC
  ): {
    year: YearEnum;
    month: MonthEnum;
    date: DateEnum;
    hours: HoursEnum;
    minutes: MinutesEnum;
    seconds: SecondsEnum;
    milliseconds: MillisecondsEnum;
    weekday: WeekDayEnum;
  } => {
    const d = new Date(u);
    return {
      year: d.getFullYear() as YearEnum,
      month: d.getMonth() as MonthEnum,
      date: d.getDate() as DateEnum,
      hours: d.getHours() as HoursEnum,
      minutes: d.getMinutes() as MinutesEnum,
      seconds: d.getSeconds() as SecondsEnum,
      milliseconds: d.getMilliseconds() as MillisecondsEnum,
      weekday: d.getDay() as WeekDayEnum,
    };
  };

  export const getUTC = (
    u: UTC
  ): {
    year: YearEnum;
    month: MonthEnum;
    date: DateEnum;
    hours: HoursEnum;
    minutes: MinutesEnum;
    seconds: SecondsEnum;
    milliseconds: MillisecondsEnum;
    weekday: WeekDayEnum;
  } => {
    const d = new Date(u);
    return {
      year: d.getUTCFullYear() as YearEnum,
      month: d.getUTCMonth() as MonthEnum,
      date: d.getUTCDate() as DateEnum,
      hours: d.getUTCHours() as HoursEnum,
      minutes: d.getUTCMinutes() as MinutesEnum,
      seconds: d.getUTCSeconds() as SecondsEnum,
      milliseconds: d.getUTCMilliseconds() as MillisecondsEnum,
      weekday: d.getUTCDay() as WeekDayEnum,
    };
  };

  export const setLocale = ({
    year,
    month,
    date,
    hours,
    minutes,
    seconds,
    milliseconds,
  }: Readonly<{
    year?: YearEnum;
    month?: MonthEnum;
    date?: DateEnum;
    hours?: HoursEnum;
    minutes?: MinutesEnum;
    seconds?: SecondsEnum;
    milliseconds?: MillisecondsEnum;
  }>) => (u: UTC): UTC => {
    const d = new Date(u);
    if (year !== undefined) {
      d.setFullYear(year);
    }
    if (month !== undefined) {
      d.setMonth(month);
    }
    if (date !== undefined) {
      d.setDate(date);
    }
    if (hours !== undefined) {
      d.setHours(hours);
    }
    if (minutes !== undefined) {
      d.setMinutes(minutes);
    }
    if (seconds !== undefined) {
      d.setSeconds(seconds);
    }
    if (milliseconds !== undefined) {
      d.setMilliseconds(milliseconds);
    }
    return d.getTime() as UTC;
  };

  export const setUTC = ({
    year,
    month,
    date,
    hours,
    minutes,
    seconds,
    milliseconds,
  }: Readonly<{
    year?: YearEnum;
    month?: MonthEnum;
    date?: DateEnum;
    hours?: HoursEnum;
    minutes?: MinutesEnum;
    seconds?: SecondsEnum;
    milliseconds?: MillisecondsEnum;
  }>) => (u: UTC): UTC => {
    const d = new Date(u);
    if (year !== undefined) {
      d.setUTCFullYear(year);
    }
    if (month !== undefined) {
      d.setUTCMonth(month);
    }
    if (date !== undefined) {
      d.setUTCDate(date);
    }
    if (hours !== undefined) {
      d.setUTCHours(hours);
    }
    if (minutes !== undefined) {
      d.setUTCMinutes(minutes);
    }
    if (seconds !== undefined) {
      d.setUTCSeconds(seconds);
    }
    if (milliseconds !== undefined) {
      d.setUTCMilliseconds(milliseconds);
    }
    return d.getTime() as UTC;
  };

  export const updateLocale = ({
    updateYear,
    updateMonth,
    updateDate,
    updateHours,
    updateMinutes,
    updateSeconds,
    updateMilliseconds,
  }: Readonly<{
    updateYear?: (year: YearEnum) => YearEnum;
    updateMonth?: (month: MonthEnum) => MonthEnum;
    updateDate?: (date: DateEnum) => DateEnum;
    updateHours?: (hours: HoursEnum) => HoursEnum;
    updateMinutes?: (minutes: MinutesEnum) => MinutesEnum;
    updateSeconds?: (seconds: SecondsEnum) => SecondsEnum;
    updateMilliseconds?: (milliseconds: MillisecondsEnum) => MillisecondsEnum;
  }>) => (u: UTC): UTC => {
    const {
      year,
      month,
      date,
      hours,
      minutes,
      seconds,
      milliseconds,
    } = getLocale(u);

    return setLocale({
      year: updateYear === undefined ? undefined : updateYear(year),
      month: updateMonth === undefined ? undefined : updateMonth(month),
      date: updateDate === undefined ? undefined : updateDate(date),
      hours: updateHours === undefined ? undefined : updateHours(hours),
      minutes: updateMinutes === undefined ? undefined : updateMinutes(minutes),
      seconds: updateSeconds === undefined ? undefined : updateSeconds(seconds),
      milliseconds:
        updateMilliseconds === undefined
          ? undefined
          : updateMilliseconds(milliseconds),
    })(u);
  };

  export const updateUTC = ({
    updateYear,
    updateMonth,
    updateDate,
    updateHours,
    updateMinutes,
    updateSeconds,
    updateMilliseconds,
  }: Readonly<{
    updateYear?: (year: YearEnum) => YearEnum;
    updateMonth?: (month: MonthEnum) => MonthEnum;
    updateDate?: (date: DateEnum) => DateEnum;
    updateHours?: (hours: HoursEnum) => HoursEnum;
    updateMinutes?: (minutes: MinutesEnum) => MinutesEnum;
    updateSeconds?: (seconds: SecondsEnum) => SecondsEnum;
    updateMilliseconds?: (milliseconds: MillisecondsEnum) => MillisecondsEnum;
  }>) => (u: UTC): UTC => {
    const { year, month, date, hours, minutes, seconds, milliseconds } = getUTC(
      u
    );

    return setUTC({
      year: updateYear === undefined ? undefined : updateYear(year),
      month: updateMonth === undefined ? undefined : updateMonth(month),
      date: updateDate === undefined ? undefined : updateDate(date),
      hours: updateHours === undefined ? undefined : updateHours(hours),
      minutes: updateMinutes === undefined ? undefined : updateMinutes(minutes),
      seconds: updateSeconds === undefined ? undefined : updateSeconds(seconds),
      milliseconds:
        updateMilliseconds === undefined
          ? undefined
          : updateMilliseconds(milliseconds),
    })(u);
  };

  const pad2 = (str: number): string => str.toString().padStart(2, '0');

  export const toLocaleYMD = (delimiter: string = '/') => (u: UTC): string => {
    const { year, month, date } = getLocale(u);
    return [year, pad2(month), pad2(date)].join(delimiter);
  };
  export const toUTCYMD = (delimiter: string = '/') => (u: UTC): string => {
    const { year, month, date } = getUTC(u);
    return [year, pad2(month), pad2(date)].join(delimiter);
  };

  export const toLocaleHM = (delimiter: string = ':') => (u: UTC): string => {
    const { hours, minutes } = getLocale(u);
    return [pad2(hours), pad2(minutes)].join(delimiter);
  };
  export const toUTCHM = (delimiter: string = ':') => (u: UTC): string => {
    const { hours, minutes } = getUTC(u);
    return [pad2(hours), pad2(minutes)].join(delimiter);
  };

  export const toLocaleHMS = (delimiter: string = ':') => (u: UTC): string => {
    const { hours, minutes, seconds } = getLocale(u);
    return [pad2(hours), pad2(minutes), pad2(seconds)].join(delimiter);
  };
  export const toUTCHMS = (delimiter: string = ':') => (u: UTC): string => {
    const { hours, minutes, seconds } = getUTC(u);
    return [pad2(hours), pad2(minutes), pad2(seconds)].join(delimiter);
  };

  export const toLocaleYMDHM = (
    YMDdelimiter: string = '/',
    HMdelimiter: string = ':'
  ) => (u: UTC): string =>
    [toLocaleYMD(YMDdelimiter)(u), toLocaleHM(HMdelimiter)(u)].join(' ');

  export const toUTCYMDHM = (
    YMDdelimiter: string = '/',
    HMdelimiter: string = ':'
  ) => (u: UTC): string =>
    [toUTCYMD(YMDdelimiter)(u), toUTCHM(HMdelimiter)(u)].join(' ');

  export const toLocaleYMDHMS = (
    YMDdelimiter: string = '/',
    HMSdelimiter: string = ':'
  ) => (u: UTC): string =>
    [toLocaleYMD(YMDdelimiter)(u), toLocaleHMS(HMSdelimiter)(u)].join(' ');

  export const toUTCYMDHMS = (
    YMDdelimiter: string = '/',
    HMSdelimiter: string = ':'
  ) => (u: UTC): string =>
    [toUTCYMD(YMDdelimiter)(u), toUTCHMS(HMSdelimiter)(u)].join(' ');

  export const toLocaleMidnight = setLocale({
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
  export const toUTCMidnight = setUTC({
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });

  export const toLocaleTomorrow = updateLocale({
    updateDate: (d) => (d + 1) as DateEnum,
  });
  export const toUTCTomorrow = updateUTC({
    updateDate: (d) => (d + 1) as DateEnum,
  });

  export const toLocaleYesterday = updateLocale({
    updateDate: (d) => (d - 1) as DateEnum,
  });
  export const toUTCYesterday = updateUTC({
    updateDate: (d) => (d - 1) as DateEnum,
  });

  export const weekNumberLocale = (u: UTC): 0 | 1 | 2 | 3 | 4 | 5 => {
    const { date, weekday } = getLocale(u);
    const date0Saturday = date - 1 + (6 - weekday); // 同じ週の土曜日
    return Math.floor(date0Saturday / 7) as 0 | 1 | 2 | 3 | 4 | 5;
  };
  export const weekNumberUTC = (u: UTC): 0 | 1 | 2 | 3 | 4 | 5 => {
    const { date, weekday } = getUTC(u);
    const date0Saturday = date - 1 + (6 - weekday); // 同じ週の土曜日
    return Math.floor(date0Saturday / 7) as 0 | 1 | 2 | 3 | 4 | 5;
  };
}
