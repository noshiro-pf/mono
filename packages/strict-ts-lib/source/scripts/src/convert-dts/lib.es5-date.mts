import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { NumberType, closeBraceRegexp } from './common.mjs';

export const convertLibEs5_Date = (source: string): string =>
  pipe(source)
    .chain(
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface Date {',
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice).chainMonoTypeFns(
            (
              [
                ['valueOf', NumberType.SafeUint],
                ['getTime', NumberType.SafeUint],
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
                ['getTimezoneOffset', NumberType.int],
              ] as const
            ).map(([dateGetMethod, type]) =>
              replaceWithNoMatchCheck(
                `${dateGetMethod}(): number;`,
                `${dateGetMethod}(): ${type};`,
              ),
            ),
          ).value,
      }),
    )
    .chain(
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface DateConstructor {',
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice)
            .chain(
              replaceWithNoMatchCheck(
                'parse(s: string): number;',
                `parse(s: string): ${NumberType.SafeUint};`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                'now(): number;',
                `now(): ${NumberType.SafeUint};`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                'new (year: number, monthIndex: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number): Date',
                'new (year: YearEnum, monthIndex: MonthIndexEnum, date?: DateEnum, hours?: HoursEnum, minutes?: MinutesEnum, seconds?: SecondsEnum, ms?: MillisecondsEnum): Date',
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                'UTC(year: number, monthIndex: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number): number',
                `UTC(year: YearEnum, monthIndex: MonthIndexEnum, date?: DateEnum, hours?: HoursEnum, minutes?: MinutesEnum, seconds?: SecondsEnum, ms?: MillisecondsEnum): ${NumberType.SafeUint}`,
              ),
            ).value,
      }),
    ).value;
