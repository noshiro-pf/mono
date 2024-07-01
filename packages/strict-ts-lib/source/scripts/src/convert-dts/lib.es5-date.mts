import {
  composeMonoTypeFns,
  isNotUndefined,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { closeBraceRegexp, type ConverterOptions } from './common.mjs';

export const convertLibEs5_Date = ({
  brandedNumber,
}: ConverterOptions): MonoTypeFunction<string> =>
  composeMonoTypeFns(
    replaceWithNoMatchCheckBetweenRegexp({
      startRegexp: 'interface Date {',
      endRegexp: closeBraceRegexp,
      mapFn: composeMonoTypeFns(
        ...(
          [
            ['valueOf', brandedNumber.SafeUint],
            ['getTime', brandedNumber.SafeUint],
            ['getFullYear', brandedNumber.YearEnum],
            ['getUTCFullYear', brandedNumber.YearEnum],
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
            ['getTimezoneOffset', brandedNumber.SafeInt],
          ] as const
        )
          .filter(isNotUndefined)
          .map(([dateGetMethod, type]) =>
            replaceWithNoMatchCheck(
              `${dateGetMethod}(): number;`,
              `${dateGetMethod}(): ${type};`,
            ),
          ),
      ),
    }),
    replaceWithNoMatchCheckBetweenRegexp({
      startRegexp: 'interface DateConstructor {',
      endRegexp: closeBraceRegexp,
      mapFn: composeMonoTypeFns(
        replaceWithNoMatchCheck(
          'parse(s: string): number;',
          `parse(s: string): ${brandedNumber.SafeUint};`,
        ),
        replaceWithNoMatchCheck(
          //
          'now(): number;',
          `now(): ${brandedNumber.SafeUint};`,
        ),
        replaceWithNoMatchCheck(
          'new (year: number, monthIndex: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number): Date',
          `new (year: ${brandedNumber.YearEnum}, monthIndex: MonthIndexEnum, date?: DateEnum, hours?: HoursEnum, minutes?: MinutesEnum, seconds?: SecondsEnum, ms?: MillisecondsEnum): Date`,
        ),
        replaceWithNoMatchCheck(
          'UTC(year: number, monthIndex: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number): number',
          `UTC(year: ${brandedNumber.YearEnum}, monthIndex: MonthIndexEnum, date?: DateEnum, hours?: HoursEnum, minutes?: MinutesEnum, seconds?: SecondsEnum, ms?: MillisecondsEnum): ${brandedNumber.SafeUint}`,
        ),
      ),
    }),
  );
