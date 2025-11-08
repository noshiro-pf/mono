import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import { int8 } from './int8.mjs';

describe(int8, () => {
  const t0 = int8();
  type T0 = TypeOf<typeof t0>;
  expectType<T0, Int8>('=');

  test('defaultValue', () => {
    expect(t0.defaultValue).toBe(0);
  });

  test('valid boundaries', () => {
    expect(Result.isOk(t0.validate(-128))).toBe(true);
    expect(Result.isOk(t0.validate(127))).toBe(true);
  });

  test('exclusive end', () => {
    const t = int8(10);

    expect(Result.isErr(t.validate(128))).toBe(true);
    expect(t.fill(999)).toBe(10);
    expect(t.fill(0)).toBe(0);
  });
});
