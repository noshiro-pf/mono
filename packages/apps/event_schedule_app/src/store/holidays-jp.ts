import { ymdFromDate } from '@noshiro/event-schedule-app-shared';
import { fetchHolidaysJson, ymdFromKey, ymdToKey } from '../functions';

export const holidaysJpDefinition$: InitializedObservable<
  IMapMapped<YearMonthDate, string, YmdKey>
> = fromPromise(fetchHolidaysJson())
  .chain(unwrapResultOk())
  .chain(filter(isNotUndefined))
  .chain(
    map((record) =>
      IMapMapped.new(
        IRecord.entries(record).map(([key, value]) => [
          ymdFromDate(IDate.from(key)),
          value,
        ]),
        ymdToKey,
        ymdFromKey
      )
    )
  )
  .chain(withInitialValue(IMapMapped.new([], ymdToKey, ymdFromKey)));
