import type { YearMonthDate } from '@noshiro/event-schedule-app-shared';
import { ymdFromDate } from '@noshiro/event-schedule-app-shared';
import type { InitializedObservable } from '@noshiro/syncflow';
import {
  filter,
  fromPromise,
  map,
  unwrapResultOk,
  withInitialValue,
} from '@noshiro/syncflow';
import { IMapMapped, IRecord, isNotUndefined } from '@noshiro/ts-utils';
import type { YmdKey } from '../functions';
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
          ymdFromDate(new Date(key)),
          value,
        ]),
        ymdToKey,
        ymdFromKey
      )
    )
  )
  .chain(withInitialValue(IMapMapped.new([], ymdToKey, ymdFromKey)));
