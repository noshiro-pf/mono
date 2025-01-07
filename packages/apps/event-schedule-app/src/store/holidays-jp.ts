import { YearMonthDateFromDate } from '@noshiro/io-ts-types';
import { fetchHolidaysJson, ymdFromKey, ymdToKey } from '../functions';

export const holidaysJpDefinition$: InitializedObservable<
  IMapMapped<YearMonthDate, string, YmdKey>
> = fromPromise(fetchHolidaysJson())
  .chain(unwrapResultOk())
  .chain(filter(isNotUndefined))
  .chain(
    map((record) =>
      IMapMapped.new(
        Object.entries(record).map(([key, value]) => [
          YearMonthDateFromDate(DateUtils.from(key)),
          value,
        ]),
        ymdToKey,
        ymdFromKey,
      ),
    ),
  )
  .chain(setInitialValue(IMapMapped.new([], ymdToKey, ymdFromKey)));
