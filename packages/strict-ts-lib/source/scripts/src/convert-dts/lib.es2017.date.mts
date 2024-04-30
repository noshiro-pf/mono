import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { NumberType, closeBraceRegexp } from './common.mjs';

export const convertLibEs2017Date = (source: string): string =>
  pipe(source).chain(
    replaceWithNoMatchCheckBetweenRegexp({
      startRegexp: 'interface DateConstructor {',
      endRegexp: closeBraceRegexp,
      mapFn: (slice) =>
        pipe(slice)
          .chain(
            replaceWithNoMatchCheck(
              //
              'year: number',
              'year: YearEnum',
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'monthIndex?: number',
              'monthIndex?: MonthIndexEnum',
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              //
              'date?: number',
              'date?: DateEnum',
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              //
              'hours?: number',
              'hours?: HoursEnum',
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'minutes?: number',
              'minutes?: MinutesEnum',
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'seconds?: number',
              'seconds?: SecondsEnum',
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              //
              'ms?: number',
              'ms?: MillisecondsEnum',
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              //
              '): number;',
              `): ${NumberType.SafeUint};`,
            ),
          ).value,
    }),
  ).value;
