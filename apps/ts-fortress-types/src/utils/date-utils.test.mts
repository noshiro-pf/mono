// cspell:ignore unstub
import { asSafeUint } from 'ts-data-forge';
import type { DateEnum, FixedLengthTuple, MonthEnum } from 'ts-type-forge';
import { DateUtils } from './date-utils.mjs';

const addOneMonth = DateUtils.updateLocaleMonth(
  // 12 + 1 is 13, which `Date#setMonth` carries into January of the next year,
  // as the "1 month later" deadline shortcut relies on.
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  (m) => (m + 1) as MonthEnum,
);

const subtractOneMonth = DateUtils.updateLocaleMonth(
  // 1 - 1 is 0, which `Date#setMonth` carries into December of the year before.
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  (m) => (m - 1) as MonthEnum,
);

const ymd = (date: Date): FixedLengthTuple<3, number> =>
  [date.getFullYear(), date.getMonth() + 1, date.getDate()] as const;

describe('DateUtils.updateLocaleMonth', () => {
  test.each([
    [
      [2027, 1, 31],
      [2027, 2, 28],
    ],
    [
      [2028, 1, 31],
      [2028, 2, 29],
    ],
    [
      [2026, 10, 31],
      [2026, 11, 30],
    ],
    [
      [2026, 3, 31],
      [2026, 4, 30],
    ],
    [
      [2026, 5, 15],
      [2026, 6, 15],
    ],
    [
      [2026, 12, 31],
      [2027, 1, 31],
    ],
  ] as const satisfies readonly (readonly [
    readonly [number, MonthEnum, DateEnum],
    FixedLengthTuple<3, number>,
  ])[])('%j plus one month is %j', ([y, m, d], expected) => {
    assert.deepStrictEqual(
      ymd(addOneMonth(DateUtils.create(asSafeUint(y), m, d, 23, 59))),
      expected,
    );
  });

  test.each([
    [
      [2026, 1, 31],
      [2025, 12, 31],
    ],
    [
      [2026, 3, 31],
      [2026, 2, 28],
    ],
  ] as const satisfies readonly (readonly [
    readonly [number, MonthEnum, DateEnum],
    FixedLengthTuple<3, number>,
  ])[])('%j minus one month is %j', ([y, m, d], expected) => {
    assert.deepStrictEqual(
      ymd(subtractOneMonth(DateUtils.create(asSafeUint(y), m, d, 23, 59))),
      expected,
    );
  });

  test('does not pass through a daylight-saving gap on the 1st', () => {
    // Daylight saving started at 00:00 on 1 October 2023 in Asunción.
    vi.stubEnv('TZ', 'America/Asuncion');

    onTestFinished(() => {
      vi.unstubAllEnvs();
    });

    // The zone took effect: 00:30 on 1 October does not exist there.
    assert.strictEqual(
      DateUtils.create(asSafeUint(2023), 10, 1, 0, 30).getHours(),
      1,
    );

    const next = addOneMonth(DateUtils.create(asSafeUint(2023), 9, 15, 0, 30));

    assert.deepStrictEqual(
      [...ymd(next), next.getHours(), next.getMinutes()],
      [2023, 10, 15, 0, 30],
    );
  });

  test('keeps the time of day', () => {
    const next = addOneMonth(DateUtils.create(asSafeUint(2027), 1, 31, 23, 59));

    assert.deepStrictEqual([next.getHours(), next.getMinutes()], [23, 59]);
  });
});
