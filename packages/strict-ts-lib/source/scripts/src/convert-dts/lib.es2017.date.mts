import {
  composeMonoTypeFns,
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { closeBraceRegexp, type ConverterOptions } from './common.mjs';

export const convertLibEs2017Date =
  ({ brandedNumber }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).chainMonoTypeFns(
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface DateConstructor {',
        endRegexp: closeBraceRegexp,
        mapFn: composeMonoTypeFns(
          replaceWithNoMatchCheck(
            //
            'year: number',
            `year: ${brandedNumber.YearEnum}`,
          ),
          replaceWithNoMatchCheck(
            'monthIndex?: number',
            'monthIndex?: MonthIndexEnum',
          ),
          replaceWithNoMatchCheck(
            //
            'date?: number',
            'date?: DateEnum',
          ),
          replaceWithNoMatchCheck(
            //
            'hours?: number',
            'hours?: HoursEnum',
          ),
          replaceWithNoMatchCheck('minutes?: number', 'minutes?: MinutesEnum'),
          replaceWithNoMatchCheck('seconds?: number', 'seconds?: SecondsEnum'),
          replaceWithNoMatchCheck(
            //
            'ms?: number',
            'ms?: MillisecondsEnum',
          ),
          replaceWithNoMatchCheck(
            //
            '): number;',
            `): ${brandedNumber.SafeUint};`,
          ),
        ),
      }),
    ).value;
