import { expectType } from '../expect-type.mjs';
import { Optional } from './optional/index.mjs';
import { pipe } from './pipe.mjs';

describe(pipe, () => {
  test('basic pipe operations', () => {
    const result = pipe(5)
      .map((x) => x * 2)
      .map((x) => x + 1).value;

    expect(result).toBe(11);

    expectType<typeof result, number>('=');
  });

  test('pipe with string operations', () => {
    const result = pipe('hello')
      .map((s) => s.toUpperCase())
      .map((s) => `${s}!`).value;

    expect(result).toBe('HELLO!');

    expectType<typeof result, string>('=');
  });

  test('pipe with array operations', () => {
    const result = pipe([1, 2, 3])
      .map((arr) => arr.map((x) => x * 2))
      .map((arr) => arr.length).value;

    expect(result).toBe(3);

    expectType<typeof result, number>('=');
  });

  test('mapNullable with non-null value', () => {
    const result = pipe(5 as number | null).mapNullable((x) => x * 2).value;

    expect(result).toBe(10);

    expectType<typeof result, number | undefined>('=');
  });

  test('mapNullable with null value', () => {
    const result = pipe(null as number | null).mapNullable((x) => x * 2).value;

    expect(result).toBeUndefined();

    expectType<typeof result, number | undefined>('=');
  });

  test('mapNullable with undefined value', () => {
    const result = pipe(undefined as number | undefined).mapNullable(
      (x) => x * 2,
    ).value;

    expect(result).toBeUndefined();

    expectType<typeof result, number | undefined>('=');
  });

  test('mapOptional with Some value', () => {
    const optional = Optional.some(42);

    const result = pipe(optional).mapOptional((x) => x * 2).value;

    expect(Optional.isSome(result)).toBe(true);

    if (Optional.isSome(result)) {
      expect(result.value).toBe(84);
    }

    expectType<typeof result, Optional<number>>('=');
  });

  test('mapOptional with None value', () => {
    const optional: Optional<number> = Optional.none;

    const result = pipe(optional).mapOptional((x) => x * 2).value;

    expect(Optional.isNone(result)).toBe(true);

    expectType<typeof result, Optional<number>>('=');
  });

  test('chaining multiple operations', () => {
    const result = pipe('5')
      .map((s) => Number.parseInt(s, 10))
      .map((n) => n * 3)
      .map((n) => n.toString())
      .map((s) => `${s} items`).value;

    expect(result).toBe('15 items');

    expectType<typeof result, string>('=');
  });
});
