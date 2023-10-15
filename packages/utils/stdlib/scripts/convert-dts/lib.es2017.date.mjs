/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2017Date = (from) => {
  let ret = from;

  ret = ret.replaceAll(
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
  );

  return ret;
};
