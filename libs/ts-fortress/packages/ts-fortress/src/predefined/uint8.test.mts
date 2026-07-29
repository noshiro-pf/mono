import { expectType, Result } from 'ts-data-forge';
import { type Uint8 } from 'ts-type-forge';
import { type TypeOf } from '../type.mjs';
import { uint8 } from './uint8.mjs';

describe(uint8, () => {
  const t0 = uint8();

  type T0 = TypeOf<typeof t0>;

  expectType<T0, Uint8>('=');

  test('defaultValue', () => {
    expect(t0.defaultValue).toBe(0);
  });

  test('valid boundaries', () => {
    assert.isTrue(Result.isOk(t0.validate(0)));

    assert.isTrue(Result.isOk(t0.validate(255)));
  });

  test('exclusive end', () => {
    const t = uint8(7);

    assert.isTrue(Result.isErr(t.validate(256)));

    expect(t.fill(999)).toBe(7);

    expect(t.fill(42)).toBe(42);
  });
});
