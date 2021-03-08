import { utils } from '../../../mylib/utilities';

export const to0000 = utils.date.toMidnightTimestamp;

// aligned to 00:00 and uniqued
export const uniq0000 = (datetimes: number[]): number[] =>
  utils.array.uniq(datetimes.map((e) => to0000(e))).sort();

export const getRemovedDates = (datesOld: number[], datesNew: number[]) =>
  uniq0000(datesOld).filter((e) => !uniq0000(datesNew).includes(e));

export const getAddedDates = (datesOld: number[], datesNew: number[]) =>
  uniq0000(datesNew).filter((e) => !uniq0000(datesOld).includes(e));
