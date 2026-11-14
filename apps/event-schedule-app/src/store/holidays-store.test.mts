// cspell:ignore unstub
import { asSafeUint, Optional } from 'ts-data-forge';
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
    // West of UTC, a "YYYY-MM-DD" read as UTC midnight is the day before.
    vi.stubEnv('TZ', 'America/New_York');

    onTestFinished(() => {
      vi.unstubAllEnvs();
    });

    // The zone took effect: there, UTC midnight of 3 November is the 2nd.
    const utcMidnight = new Date('2026-11-03T00:00:00Z');

    assert.strictEqual(utcMidnight.getDate(), 2);

    const { promise, resolve } =
      Promise.withResolvers<ReadonlyRecord<string, string>>();

    const store = createHolidaysStore({ fetchHolidaysJson: () => promise });

    store.start();

    assert.strictEqual(
      Optional.unwrap(store.holidaysJpDefinition$.getSnapshot()).size,
      0,
    );

    resolve({ '2026-01-01': '元日', '2026-11-03': '文化の日' });

    await settle();

    const holidays = Optional.unwrap(store.holidaysJpDefinition$.getSnapshot());

    assert.strictEqual(holidays.size, 2);

    assert.strictEqual(
      Optional.unwrap(
        holidays.get({ year: asSafeUint(2026), month: 11, date: 3 }),
      ),
      '文化の日',
    );
  });

  test('skips a key that is not a date', async () => {
    const store = createHolidaysStore({
      fetchHolidaysJson: () =>
        Promise.resolve({
          '2026-11-03': '文化の日',
          'not-a-date': '?',
          '2026-13-01': '?',
          '2026-1e1-03': '?',
          '-11-03': '?',
        }),
    });

    store.start();

    await settle();

    const holidays = Optional.unwrap(store.holidaysJpDefinition$.getSnapshot());

    assert.strictEqual(holidays.size, 1);

    assert.strictEqual(
      Optional.unwrap(
        holidays.get({ year: asSafeUint(2026), month: 11, date: 3 }),
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

    assert.strictEqual(
      Optional.unwrap(store.holidaysJpDefinition$.getSnapshot()).size,
      0,
    );
  });

  test('drops an answer that arrives after stop', async () => {
    const { promise, resolve } =
      Promise.withResolvers<ReadonlyRecord<string, string>>();

    const store = createHolidaysStore({ fetchHolidaysJson: () => promise });

    const stopHolidays = store.start();

    stopHolidays();

    resolve({ '2026-01-01': '元日' });

    await settle();

    assert.strictEqual(
      Optional.unwrap(store.holidaysJpDefinition$.getSnapshot()).size,
      0,
    );
  });
});

const settle = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 10);
  });
};
