import { isNotUndefined, pipe } from 'ts-data-forge';
import type { MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithinInterface,
} from '../functions/utils/node-utils.mjs';
import type { ConverterOptions } from './common.mjs';

export const convertLibEs5_Date =
  ({
    brandedNumber,
    config: { useBrandedNumber },
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        replaceWithinInterface({
          name: 'Date',
          mapFn: composeMonoTypeFns(
            ...(
              [
                ['valueOf', brandedNumber.SafeInt],
                ['getTime', brandedNumber.SafeInt],
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
        replaceWithinInterface({
          name: 'DateConstructor',
          mapFn: composeMonoTypeFns(
            replaceWithNoMatchCheck(
              'parse(s: string): number;',
              `parse(s: string): ${useBrandedNumber ? `${brandedNumber.SafeInt} | ${brandedNumber.NaNType}` : 'number'};`,
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
            // The branded return type leaves `NaNType` out, as those of the
            // `Date` methods above do: the arguments are assumed to describe a
            // valid date, so those that make `Date.UTC` return `NaN` (an
            // instant outside the +-8.64e15 ms time range, an explicit
            // `undefined`) are the caller's to rule out. `parse` keeps
            // `NaNType` because `NaN` is how it reports a string it cannot
            // read. The ES2017 overload, in `lib.es2017.date.mts`, returns the
            // same type.
            replaceWithNoMatchCheck(
              'UTC(year: number, monthIndex: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number): number',
              `UTC(year: ${brandedNumber.YearEnum}, monthIndex: MonthIndexEnum, date?: DateEnum, hours?: HoursEnum, minutes?: MinutesEnum, seconds?: SecondsEnum, ms?: MillisecondsEnum): ${brandedNumber.SafeInt}`,
            ),
          ),
        }),
      ),
    ).value;
