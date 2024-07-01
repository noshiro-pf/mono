import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';

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
