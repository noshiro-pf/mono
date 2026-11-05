// cspell:ignore unstub
import { asSafeUint } from 'ts-data-forge';
import type {
  DateEnum,
  FixedLengthTuple,
  IntWithSmallInt,
  MonthEnum,
} from 'ts-type-forge';
import { DateUtils } from './date-utils.mjs';

type YMD = readonly [number, MonthEnum, DateEnum];

const ymd = (date: Date): FixedLengthTuple<3, number> =>
  [date.getFullYear(), date.getMonth() + 1, date.getDate()] as const;

const at2359 = ([y, m, d]: YMD): Date =>
  DateUtils.create(asSafeUint(y), m, d, 23, 59);

describe('DateUtils.addLocaleMonths', () => {
  test.each([
    [[2027, 1, 31], 1, [2027, 2, 28]],
    [[2028, 1, 31], 1, [2028, 2, 29]],
    [[2028, 2, 29], 12, [2029, 2, 28]],
    [[2026, 10, 31], 1, [2026, 11, 30]],
    [[2026, 3, 31], 1, [2026, 4, 30]],
    [[2026, 5, 15], 1, [2026, 6, 15]],
    [[2026, 12, 31], 1, [2027, 1, 31]],
    [[2026, 1, 31], -1, [2025, 12, 31]],
    [[2026, 3, 31], -1, [2026, 2, 28]],
    [[2026, 3, 31], -13, [2025, 2, 28]],
    [[2026, 8, 31], 18, [2028, 2, 29]],
    [[2026, 5, 15], 0, [2026, 5, 15]],
  ] as const satisfies readonly (readonly [
    YMD,
    IntWithSmallInt,
    FixedLengthTuple<3, number>,
  ])[])('%j plus %i months is %j', (from, n, expected) => {
    assert.deepStrictEqual(
      ymd(DateUtils.addLocaleMonths(n)(at2359(from))),
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

    const next = DateUtils.addLocaleMonths(1)(
      DateUtils.create(asSafeUint(2023), 9, 15, 0, 30),
    );

    assert.deepStrictEqual(
      [...ymd(next), next.getHours(), next.getMinutes()],
      [2023, 10, 15, 0, 30],
    );
  });

  test('keeps the time of day', () => {
    const next = DateUtils.addLocaleMonths(1)(at2359([2027, 1, 31]));

    assert.deepStrictEqual([next.getHours(), next.getMinutes()], [23, 59]);
  });
});

describe('DateUtils.setLocaleMonth', () => {
  test.each([
    [[2027, 1, 31], 2, [2027, 2, 28]],
    [[2028, 1, 31], 2, [2028, 2, 29]],
    [[2028, 2, 29], 12, [2028, 12, 29]],
    [[2027, 3, 31], 4, [2027, 4, 30]],
    [[2027, 12, 31], 1, [2027, 1, 31]],
    [[2027, 5, 15], 5, [2027, 5, 15]],
  ] as const satisfies readonly (readonly [
    YMD,
    MonthEnum,
    FixedLengthTuple<3, number>,
  ])[])('%j with the month set to %i is %j', (from, month, expected) => {
    assert.deepStrictEqual(
      ymd(DateUtils.setLocaleMonth(month)(at2359(from))),
      expected,
    );
  });

  test('keeps the time of day', () => {
    const next = DateUtils.setLocaleMonth(2)(at2359([2027, 1, 31]));

    assert.deepStrictEqual([next.getHours(), next.getMinutes()], [23, 59]);
  });
});

describe('DateUtils.updateLocaleYear', () => {
  test.each([
    [[2028, 2, 29], 1, [2029, 2, 28]],
    [[2028, 2, 29], 4, [2032, 2, 29]],
    [[2028, 2, 29], -1, [2027, 2, 28]],
    [[2027, 1, 31], 1, [2028, 1, 31]],
    [[2027, 2, 28], 1, [2028, 2, 28]],
  ] as const satisfies readonly (readonly [
    YMD,
    number,
    FixedLengthTuple<3, number>,
  ])[])('%j plus %i years is %j', (from, n, expected) => {
    assert.deepStrictEqual(
      ymd(DateUtils.updateLocaleYear((y) => asSafeUint(y + n))(at2359(from))),
      expected,
    );
  });

  test('keeps the time of day', () => {
    const next = DateUtils.updateLocaleYear((y) => asSafeUint(y + 1))(
      at2359([2028, 2, 29]),
    );

    assert.deepStrictEqual([next.getHours(), next.getMinutes()], [23, 59]);
  });

  test("the date pickers' maximum on 29 February is late December", () => {
    // As `tenYearsLater` in react-blueprintjs-utils builds it.
    const max = DateUtils.setLocaleMonth(12)(
      DateUtils.updateLocaleYear((y) => asSafeUint(y + 99))(
        at2359([2028, 2, 29]),
      ),
    );

    assert.deepStrictEqual(ymd(max), [2127, 12, 28]);
  });
});
