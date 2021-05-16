import { createIHoursMinutes } from '../../../../types/record/base/hours-minutes';
import type { IDatetimeRange } from '../../../../types/record/datetime-range';
import type { ITimeRange } from '../../../../types/record/time-range';
import { createITimeRange } from '../../../../types/record/time-range';
import type { IList } from '../../../../utils/immutable';

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
