import { pipe } from './common.mjs';

const marker = {
  start: 'interface Date {',
  end: 'declare const Date: DateConstructor;',
};

/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs5_Date = (from) => {
  const slice = from.slice(
    from.indexOf(marker.start),
    from.indexOf(marker.end),
  );

  return from.replaceAll(
    slice,
    pipe(slice).chain((str) => {
      for (const [dateGetMethod, type] of [
        ['valueOf', 'SafeUint'],
        ['getTime', 'SafeUint'],
        ['getFullYear', 'YearEnum'],
        ['getUTCFullYear', 'YearEnum'],
        ['getMonth', 'MonthIndexEnum'],
        ['getUTCMonth', 'MonthIndexEnum'],
        ['getDate', 'DateEnum'],
        ['getUTCDate', 'DateEnum'],
        ['getDay', 'DayOfWeekIndex'],
        ['getUTCDay', 'DayOfWeekIndex'],
        ['getHours', 'HoursEnum'],
        ['getUTCHours', 'HoursEnum'],
        ['getMinutes', 'MinutesEnum'],
        ['getUTCMinutes', 'MinutesEnum'],
        ['getSeconds', 'SecondsEnum'],
        ['getUTCSeconds', 'SecondsEnum'],
        ['getMilliseconds', 'MillisecondsEnum'],
        ['getUTCMilliseconds', 'MillisecondsEnum'],
        ['getTimezoneOffset', 'SafeInt'],
      ]) {
        str = str.replaceAll(
          `${dateGetMethod}(): number;`,
          `${dateGetMethod}(): ${type};`,
        );
      }
      str = str.replaceAll(
        'setTime(time: number): number;',
        'setTime(time: SafeUint): SafeUint;',
      );
      for (const a of ['setMilliseconds', 'setUTCMilliseconds']) {
        str = str.replaceAll(
          `${a}(ms: number): number;`,
          `${a}(ms: MillisecondsEnum): SafeUint;`,
        );
      }
      for (const a of ['setSeconds', 'setUTCSeconds']) {
        str = str.replaceAll(
          `${a}(sec: number, ms?: number): number;`,
          `${a}(sec: SecondsEnum, ms?: MillisecondsEnum): SafeUint;`,
        );
      }
      for (const a of ['setMinutes', 'setUTCMinutes']) {
        str = str.replaceAll(
          `${a}(min: number, sec?: number, ms?: number): number;`,
          `${a}(min: MinutesEnum, sec?: SecondsEnum, ms?: MillisecondsEnum): SafeUint;`,
        );
      }
      for (const a of ['setHours', 'setUTCHours']) {
        str = str.replaceAll(
          `${a}(hours: number, min?: number, sec?: number, ms?: number): number;`,
          `${a}(hours: HoursEnum, min?: MinutesEnum, sec?: SecondsEnum, ms?: MillisecondsEnum): SafeUint;`,
        );
      }
      for (const a of ['setDate', 'setUTCDate']) {
        str = str.replaceAll(
          `${a}(date: number): number;`,
          `${a}(date: DateEnum): SafeUint;`,
        );
      }
      for (const a of ['setMonth', 'setUTCMonth']) {
        str = str.replaceAll(
          `${a}(month: number, date?: number): number;`,
          `${a}(month: MonthIndexEnum, date?: DateEnum): SafeUint;`,
        );
      }
      for (const a of ['setFullYear', 'setUTCFullYear']) {
        str = str.replaceAll(
          `${a}(year: number, month?: number, date?: number): number;`,
          `${a}(year: YearEnum, month?: MonthIndexEnum, date?: DateEnum): SafeUint;`,
        );
      }
      str = str.replaceAll(
        [
          '  new (',
          '    year: number,',
          '    monthIndex: number,',
          '    date?: number,',
          '    hours?: number,',
          '    minutes?: number,',
          '    seconds?: number,',
          '    ms?: number,',
          '  ): Date;',
        ].join('\n'),
        [
          '  new (',
          '    year: YearEnum,',
          '    monthIndex: MonthIndexEnum,',
          '    date?: DateEnum,',
          '    hours?: HoursEnum,',
          '    minutes?: MinutesEnum,',
          '    seconds?: SecondsEnum,',
          '    ms?: MillisecondsEnum,',
          '  ): Date;',
        ].join('\n'),
      );
      str = str.replaceAll(
        [
          '  UTC(',
          '    year: number,',
          '    monthIndex: number,',
          '    date?: number,',
          '    hours?: number,',
          '    minutes?: number,',
          '    seconds?: number,',
          '    ms?: number,',
          '  ): number;',
        ].join('\n'),
        [
          '  UTC(',
          '    year: YearEnum,',
          '    monthIndex: MonthIndexEnum,',
          '    date?: DateEnum,',
          '    hours?: HoursEnum,',
          '    minutes?: MinutesEnum,',
          '    seconds?: SecondsEnum,',
          '    ms?: MillisecondsEnum,',
          '  ): SafeUint;',
        ].join('\n'),
      );
      str = str.replaceAll(
        'parse(s: string): number;',
        'parse(s: string): SafeUint;',
      );
      str = str.replaceAll('now(): number;', 'now(): SafeUint;');

      return str;
    }).value,
  );
};
