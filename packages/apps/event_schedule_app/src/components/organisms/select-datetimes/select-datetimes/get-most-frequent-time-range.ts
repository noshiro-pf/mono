import { IDatetimeRangeType } from '../../../../types/record/datetime-range';
import {
  ITimeRange,
  ITimeRangeType,
} from '../../../../types/record/time-range';
import { IList } from '../../../../utils/immutable';

export const getMostFrequentTimeRange = (
  datetimeList: IList<IDatetimeRangeType>
): ITimeRangeType => {
  const startMaxFreq = datetimeList
    .groupBy((e) => e.timeRange.start)
    .maxBy((v) => v.count())
    ?.get(0)?.timeRange.start;

  const endMaxFreq = datetimeList
    .groupBy((e) => e.timeRange.end)
    .maxBy((v) => v.count())
    ?.get(0)?.timeRange.end;

  return ITimeRange({
    start: startMaxFreq,
    end: endMaxFreq,
  });
};
