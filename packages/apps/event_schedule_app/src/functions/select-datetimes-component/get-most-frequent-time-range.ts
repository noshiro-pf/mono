import { hoursMinutesDefaultValue } from '@noshiro/event-schedule-app-shared';
import { timeRangeToMapKey } from '../map-key';

export const getMostFrequentTimeRange = (
  datetimeList: readonly DatetimeRange[]
): TimeRange => {
  const startMaxFreq = pipe(datetimeList)
    .chain((list) =>
      IList.groupBy(list, (e) => timeRangeToMapKey(e.timeRange.start))
    )
    .chain((groups) => groups.toValuesArray())
    .chain((list) => IList.maxBy(list, (g) => g.length))
    .chain((list) => list?.[0]?.timeRange.start).value;

  const endMaxFreq = pipe(datetimeList)
    .chain((list) =>
      IList.groupBy(list, (e) => timeRangeToMapKey(e.timeRange.end))
    )
    .chain((groups) => groups.toValuesArray())
    .chain((list) => IList.maxBy(list, (g) => g.length))
    .chain((list) => list?.[0]?.timeRange.end).value;

  return {
    start: startMaxFreq ?? hoursMinutesDefaultValue,
    end: endMaxFreq ?? hoursMinutesDefaultValue,
  };
};
