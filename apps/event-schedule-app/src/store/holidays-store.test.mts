import { Optional } from 'ts-data-forge';
import { DateUtils, YearMonthDateFromDate } from 'ts-fortress-types';
import type { ReadonlyRecord } from 'ts-type-forge';
import { createHolidaysStore } from './holidays-store.mjs';

describe(createHolidaysStore, () => {
  test('asks for nothing until started', () => {
    const mut_fetched = { count: 0 };

    createHolidaysStore({
      fetchHolidaysJson: () => {
        mut_fetched.count += 1;

        return Promise.resolve({});
      },
    });

    assert.strictEqual(mut_fetched.count, 0);
  });

  test('knows no holiday until they arrive, then each by its date', async () => {
    const { promise, resolve } =
      Promise.withResolvers<ReadonlyRecord<string, string>>();

    const store = createHolidaysStore({ fetchHolidaysJson: () => promise });

    store.start();

    assert.strictEqual(store.holidaysJpDefinition$.getSnapshot().value.size, 0);

    resolve({ '2026-01-01': '元日', '2026-11-03': '文化の日' });

    await settle();

    const holidays = store.holidaysJpDefinition$.getSnapshot().value;

    assert.strictEqual(holidays.size, 2);

    assert.strictEqual(
      Optional.unwrap(
        holidays.get(YearMonthDateFromDate(DateUtils.from('2026-11-03'))),
      ),
      '文化の日',
    );
  });

  test('stays empty when they cannot be fetched', async () => {
    const store = createHolidaysStore({
      fetchHolidaysJson: () => Promise.reject(new Error('offline')),
    });

    store.start();

    await settle();

    assert.strictEqual(store.holidaysJpDefinition$.getSnapshot().value.size, 0);
  });

  test('drops an answer that arrives after stop', async () => {
    const { promise, resolve } =
      Promise.withResolvers<ReadonlyRecord<string, string>>();

    const store = createHolidaysStore({ fetchHolidaysJson: () => promise });

    const stopHolidays = store.start();

    stopHolidays();

    resolve({ '2026-01-01': '元日' });

    await settle();

    assert.strictEqual(store.holidaysJpDefinition$.getSnapshot().value.size, 0);
  });
});

const settle = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 10);
  });
};
