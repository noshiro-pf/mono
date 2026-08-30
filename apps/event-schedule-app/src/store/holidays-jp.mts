import {
  type InitializedObservable,
  filter,
  fromPromise,
  map,
  unwrapResultOk,
  withInitialValue,
} from 'synstate';
import { IMapMapped, isNotUndefined } from 'ts-data-forge';
import { DateUtils, YearMonthDateFromDate } from 'ts-fortress-types';
import {
  fetchHolidaysJson,
  ymdFromKey,
  ymdToKey,
} from '../functions/index.mjs';

export const holidaysJpDefinition$: InitializedObservable<
  IMapMapped<YearMonthDate, string, YmdKey>
> = fromPromise(fetchHolidaysJson())
  .pipe(unwrapResultOk())
  .pipe(filter(isNotUndefined))
  .pipe(
    map((record) =>
      IMapMapped.create(
        Object.entries(record).map(([key, value]) => [
          YearMonthDateFromDate(DateUtils.from(key)),
          value,
        ]),
        ymdToKey,
        ymdFromKey,
      ),
    ),
  )
  .pipe(withInitialValue(IMapMapped.create([], ymdToKey, ymdFromKey)));
