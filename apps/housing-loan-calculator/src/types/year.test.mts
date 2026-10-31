import { expectType } from 'ts-data-forge';
import type { UintRangeInclusive } from 'ts-type-forge';
import { Year } from './year.mjs';

expectType<Year, UintRangeInclusive<1, 100>>('=');

describe('Year', () => {
  test('accepts whole years in 1-100', () => {
    expect(Year.cast(1)).toBe(1);

    expect(Year.cast(35)).toBe(35);

    expect(Year.cast(100)).toBe(100);
  });

  test('rejects periods outside 1-100', () => {
    expect(() => Year.cast(0)).toThrow();

    expect(() => Year.cast(101)).toThrow();
  });

  test('rejects a period that is not a whole year', () => {
    expect(() => Year.cast(1.5)).toThrow();

    expect(() => Year.cast(Number.NaN)).toThrow();
  });
});
