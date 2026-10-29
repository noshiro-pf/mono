import { createState, type InitializedObservable } from 'synstate';
import { IMapMapped } from 'ts-data-forge';
import { DateUtils, YearMonthDateFromDate } from 'ts-fortress-types';
import type { ReadonlyRecord } from 'ts-type-forge';
import { ymdFromKey, ymdToKey } from '../functions/index.mjs';

export type HolidaysDeps = Readonly<{
  /** The holidays of Japan, as `{ "YYYY-MM-DD": name }`. */
  fetchHolidaysJson: () => Promise<ReadonlyRecord<string, string>>;
}>;

/**
 * The holidays of Japan, empty until they arrive, and still empty if they
 * cannot be fetched. Asked for when started.
 */
export const createHolidaysStore = (deps: HolidaysDeps): HolidaysStore => {
  const [holidaysJpDefinition$, setHolidaysJpDefinition] = createState<
    IMapMapped<YearMonthDate, string, YmdKey>
  >(IMapMapped.create([], ymdToKey, ymdFromKey));

  const start = (): (() => void) => {
    const mut_run = { stopped: false };

    deps
      .fetchHolidaysJson()
      .then((record) => {
        if (mut_run.stopped) {
          return;
        }

        setHolidaysJpDefinition(
          IMapMapped.create(
            Object.entries(record).map(([key, value]) => [
              YearMonthDateFromDate(DateUtils.from(key)),
              value,
            ]),
            ymdToKey,
            ymdFromKey,
          ),
        );
      })
      .catch(() => undefined);

    return () => {
      mut_run.stopped = true;
    };
  };

  return { holidaysJpDefinition$, start } as const;
};

export type HolidaysStore = Readonly<{
  holidaysJpDefinition$: InitializedObservable<
    IMapMapped<YearMonthDate, string, YmdKey>
  >;
  /** Fetches the holidays; returns what drops an answer still to come. */
  start: () => () => void;
}>;
