import { expectType } from '../../expect-type.mjs';
import { asUint32 } from '../../number/index.mjs';
import { entries, indices, values } from './array-utils-iterators.mjs';

describe(entries, () => {
  test('should return array of index-value pairs', () => {
    const fruits = ['apple', 'banana', 'cherry'];

    const es = Array.from(entries(fruits));

    assert.deepStrictEqual(es, [
      [asUint32(0), 'apple'],
      [asUint32(1), 'banana'],
      [asUint32(2), 'cherry'],
    ]);
  });

  test('should work with tuples', () => {
    const tuple = [10, 20, 30] as const;

    const es = Array.from(entries(tuple));

    expectType<typeof es, (readonly [Uint32, 10 | 20 | 30])[]>('=');

    assert.deepStrictEqual(es, [
      [asUint32(0), 10],
      [asUint32(1), 20],
      [asUint32(2), 30],
    ]);
  });

  test('should work with empty array', () => {
    const empty: string[] = [];

    const es = Array.from(entries(empty));

    assert.deepStrictEqual(es, []);
  });

  test('should preserve mixed types', () => {
    const mixed = [1, 'hello', true] as const;

    const es = Array.from(entries(mixed));

    expectType<typeof es, (readonly [Uint32, 1 | 'hello' | true])[]>('=');

    assert.deepStrictEqual(es, [
      [asUint32(0), 1],
      [asUint32(1), 'hello'],
      [asUint32(2), true],
    ]);
  });
});

describe(values, () => {
  test('should return copy of array values', () => {
    const numbers = [1, 2, 3];

    const vs = Array.from(values(numbers));

    assert.deepStrictEqual(vs, [1, 2, 3]);

    expect(vs).not.toBe(numbers); // Should be a copy
  });

  test('should work with tuples', () => {
    const tuple = ['a', 'b', 'c'] as const;

    const vs = Array.from(values(tuple));

    expectType<typeof vs, ('a' | 'b' | 'c')[]>('=');

    assert.deepStrictEqual(vs, ['a', 'b', 'c']);
  });

  test('should work with empty array', () => {
    const empty: number[] = [];

    const vs = Array.from(values(empty));

    assert.deepStrictEqual(vs, []);
  });

  test('should preserve mixed types', () => {
    const mixed = [1, 'hello', null] as const;

    const vs = Array.from(values(mixed));

    expectType<typeof vs, (1 | 'hello' | null)[]>('=');

    assert.deepStrictEqual(vs, [1, 'hello', null]);
  });
});

describe(indices, () => {
  test('should return array of indices', () => {
    const fruits = ['apple', 'banana', 'cherry'];

    const ks = Array.from(indices(fruits));

    assert.deepStrictEqual(ks, [asUint32(0), asUint32(1), asUint32(2)]);
  });

  test('should work with tuples', () => {
    const tuple = ['a', 'b'] as const;

    const ks = Array.from(indices(tuple));

    expectType<typeof ks, Uint32[]>('=');

    assert.deepStrictEqual(ks, [asUint32(0), asUint32(1)]);
  });

  test('should work with empty array', () => {
    const empty: string[] = [];

    const ks = Array.from(indices(empty));

    assert.deepStrictEqual(ks, []);
  });

  test('should work with larger arrays', () => {
    const large = Array.from({ length: 5 }, () => 'x');

    const ks = Array.from(indices(large));

    assert.deepStrictEqual(ks, [
      asUint32(0),
      asUint32(1),
      asUint32(2),
      asUint32(3),
      asUint32(4),
    ]);
  });
});
