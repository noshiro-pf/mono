import { Arr, Optional, pipe } from 'ts-data-forge';
import { HoursMinutes } from 'ts-fortress-types';
import { timeRangeToMapKey } from '../map-key/index.mjs';

export const getMostFrequentTimeRange = (
  datetimeList: readonly DatetimeRange[],
): TimeRange => {
  const startMaxFreq = pipe(datetimeList)
    .map(Arr.groupBy((e) => timeRangeToMapKey(e.timeRange.start)))
    .map((groups) => groups.toValuesArray())
    .map((list) => Arr.maxBy(list, (g) => g.length))
    .map((list) => Optional.toNullable(list)?.[0]?.timeRange.start).value;

  const endMaxFreq = pipe(datetimeList)
    .map(Arr.groupBy((e) => timeRangeToMapKey(e.timeRange.end)))
    .map((groups) => groups.toValuesArray())
    .map((list) => Arr.maxBy(list, (g) => g.length))
    .map((list) => Optional.toNullable(list)?.[0]?.timeRange.end).value;

  return {
    start: startMaxFreq ?? HoursMinutes.defaultValue,
    end: endMaxFreq ?? HoursMinutes.defaultValue,
  };
};
