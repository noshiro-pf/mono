import { createState, type InitializedObservable } from 'synstate';
import { Arr, IMapMapped, Num } from 'ts-data-forge';
import { YearMonthDate } from 'ts-fortress-types';
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
            Arr.generate(function* () {
              for (const [key, value] of Object.entries(record)) {
                const ymd = ymdFromHolidayKey(key);

                if (ymd !== undefined) {
                  yield [ymd, value] as const;
                }
              }
            }),
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

const holidayKeyPattern = /^\d{4}-\d{2}-\d{2}$/u;

/**
 * Reads a `"YYYY-MM-DD"` key as the calendar date it names. It does not go
 * through `Date`, which reads a date-only string as UTC midnight: read back in
 * local time, that is the day before wherever the offset is negative. A key of
 * any other shape is skipped.
 */
const ymdFromHolidayKey = (key: string): YearMonthDate | undefined => {
  const parts = key.split('-');

  if (!holidayKeyPattern.test(key) || !Arr.isFixedLengthTuple(3, parts)) {
    return undefined;
  }

  const ymd = {
    year: Num.from(parts[0]),
    month: Num.from(parts[1]),
    date: Num.from(parts[2]),
  } as const;

  return YearMonthDate.is(ymd) ? ymd : undefined;
};
