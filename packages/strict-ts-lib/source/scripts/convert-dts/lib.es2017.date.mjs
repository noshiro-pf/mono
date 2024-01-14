import { pipe } from '@noshiro/mono-scripts/ts-utils/pipe.mjs';
import { replaceWithNoMatchCheck } from '@noshiro/mono-scripts/ts-utils/replace-with-no-match-check.mjs';

/**
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2017Date = (from) =>
  pipe(from).chain(
    replaceWithNoMatchCheck(
      [
        '  UTC(',
        '    year: number,',
        '    monthIndex?: number,',
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
        '    monthIndex?: MonthIndexEnum,',
        '    date?: DateEnum,',
        '    hours?: HoursEnum,',
        '    minutes?: MinutesEnum,',
        '    seconds?: SecondsEnum,',
        '    ms?: MillisecondsEnum,',
        '  ): SafeUint;',
      ].join('\n'),
    ),
  ).value;
