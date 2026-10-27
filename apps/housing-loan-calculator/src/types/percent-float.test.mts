import { PercentFloat } from './percent-float.mjs';

describe('PercentFloat', () => {
  test('accepts values in 0-100', () => {
    expect(PercentFloat.cast(0)).toBe(0);

    expect(PercentFloat.cast(0.5)).toBe(0.5);

    expect(PercentFloat.cast(100)).toBe(100);
  });

  test('rejects values outside 0-100', () => {
    expect(() => PercentFloat.cast(-1)).toThrow();

    expect(() => PercentFloat.cast(101)).toThrow();
  });

  test('rejects NaN', () => {
    expect(() => PercentFloat.cast(Number.NaN)).toThrow();
  });
});
