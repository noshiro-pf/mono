import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';

const marker = {
  start: 'interface Date {',
  end: 'declare const Date: DateConstructor;',
};

/**
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs5_Date = (from) => {
  const slice = from.slice(
    from.indexOf(marker.start),
    from.indexOf(marker.end),
  );

  return pipe(from).chain(
    replaceWithNoMatchCheck(
      slice,
      pipe(slice).chain((str) => {
        let mut_str = str;

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
          mut_str = pipe(mut_str).chain(
            replaceWithNoMatchCheck(
              `${dateGetMethod}(): number;`,
              `${dateGetMethod}(): ${type};`,
            ),
          ).value;
        }

        mut_str = pipe(mut_str).chain(
          replaceWithNoMatchCheck(
            'setTime(time: number): number;',
            'setTime(time: SafeUint): SafeUint;',
          ),
        ).value;

        for (const a of ['setMilliseconds', 'setUTCMilliseconds']) {
          mut_str = pipe(mut_str).chain(
            replaceWithNoMatchCheck(
              `${a}(ms: number): number;`,
              `${a}(ms: MillisecondsEnum): SafeUint;`,
            ),
          ).value;
        }

        for (const a of ['setSeconds', 'setUTCSeconds']) {
          mut_str = pipe(mut_str).chain(
            replaceWithNoMatchCheck(
              `${a}(sec: number, ms?: number): number;`,
              `${a}(sec: SecondsEnum, ms?: MillisecondsEnum): SafeUint;`,
            ),
          ).value;
        }

        for (const a of ['setMinutes', 'setUTCMinutes']) {
          mut_str = pipe(mut_str).chain(
            replaceWithNoMatchCheck(
              `${a}(min: number, sec?: number, ms?: number): number;`,
              `${a}(min: MinutesEnum, sec?: SecondsEnum, ms?: MillisecondsEnum): SafeUint;`,
            ),
          ).value;
        }

        for (const a of ['setHours', 'setUTCHours']) {
          mut_str = pipe(mut_str).chain(
            replaceWithNoMatchCheck(
              `${a}(hours: number, min?: number, sec?: number, ms?: number): number;`,
              `${a}(hours: HoursEnum, min?: MinutesEnum, sec?: SecondsEnum, ms?: MillisecondsEnum): SafeUint;`,
            ),
          ).value;
        }

        for (const a of ['setDate', 'setUTCDate']) {
          mut_str = pipe(mut_str).chain(
            replaceWithNoMatchCheck(
              `${a}(date: number): number;`,
              `${a}(date: DateEnum): SafeUint;`,
            ),
          ).value;
        }

        for (const a of ['setMonth', 'setUTCMonth']) {
          mut_str = pipe(mut_str).chain(
            replaceWithNoMatchCheck(
              `${a}(month: number, date?: number): number;`,
              `${a}(month: MonthIndexEnum, date?: DateEnum): SafeUint;`,
            ),
          ).value;
        }

        for (const a of ['setFullYear', 'setUTCFullYear']) {
          mut_str = pipe(mut_str).chain(
            replaceWithNoMatchCheck(
              `${a}(year: number, month?: number, date?: number): number;`,
              `${a}(year: YearEnum, month?: MonthIndexEnum, date?: DateEnum): SafeUint;`,
            ),
          ).value;
        }

        mut_str = pipe(mut_str)
          .chain(
            replaceWithNoMatchCheck(
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
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
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
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'parse(s: string): number;',
              'parse(s: string): SafeUint;',
            ),
          )
          .chain(
            replaceWithNoMatchCheck('now(): number;', 'now(): SafeUint;'),
          ).value;

        return mut_str;
      }).value,
    ),
  ).value;
};
