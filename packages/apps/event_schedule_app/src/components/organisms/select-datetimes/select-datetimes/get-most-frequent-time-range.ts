import type { IDatetimeRange, ITimeRange } from '../../../../types';
import { createIHoursMinutes, createITimeRange } from '../../../../types';
import type { IList } from '../../../../utils';

export const getMostFrequentTimeRange = (
  datetimeList: IList<IDatetimeRange>
): ITimeRange => {
  const startMaxFreq = datetimeList
    .groupBy((e) => e.timeRange.start)
    .maxBy((v) => v.count())
    ?.get(0)?.timeRange.start;

  const endMaxFreq = datetimeList
    .groupBy((e) => e.timeRange.end)
    .maxBy((v) => v.count())
    ?.get(0)?.timeRange.end;

  return createITimeRange({
    start: startMaxFreq ?? createIHoursMinutes(),
    end: endMaxFreq ?? createIHoursMinutes(),
  });
};
