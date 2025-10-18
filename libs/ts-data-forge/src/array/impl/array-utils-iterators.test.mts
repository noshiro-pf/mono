import { expectType } from '../../expect-type.mjs';
import { entries, indices, values } from './array-utils-iterators.mjs';

describe('entries', () => {
  test('should return array of index-value pairs', () => {
    const fruits = ['apple', 'banana', 'cherry'];
    const es = Array.from(entries(fruits));
    expect(es).toStrictEqual([
      [0, 'apple'],
      [1, 'banana'],
      [2, 'cherry'],
    ]);
  });

  test('should work with tuples', () => {
    const tuple = [10, 20, 30] as const;
    const es = Array.from(entries(tuple));
    expectType<typeof es, (readonly [Uint32, 10 | 20 | 30])[]>('=');
    expect(es).toStrictEqual([
      [0, 10],
      [1, 20],
      [2, 30],
    ]);
  });

  test('should work with empty array', () => {
    const empty: string[] = [];
    const es = Array.from(entries(empty));
    expect(es).toStrictEqual([]);
  });

  test('should preserve mixed types', () => {
    const mixed = [1, 'hello', true] as const;
    const es = Array.from(entries(mixed));
    expectType<typeof es, (readonly [Uint32, 1 | 'hello' | true])[]>('=');
    expect(es).toStrictEqual([
      [0, 1],
      [1, 'hello'],
      [2, true],
    ]);
  });
});

describe('values', () => {
  test('should return copy of array values', () => {
    const numbers = [1, 2, 3];
    const vs = Array.from(values(numbers));
    expect(vs).toStrictEqual([1, 2, 3]);
    expect(vs).not.toBe(numbers); // Should be a copy
  });

  test('should work with tuples', () => {
    const tuple = ['a', 'b', 'c'] as const;
    const vs = Array.from(values(tuple));
    expectType<typeof vs, ('a' | 'b' | 'c')[]>('=');
    expect(vs).toStrictEqual(['a', 'b', 'c']);
  });

  test('should work with empty array', () => {
    const empty: number[] = [];
    const vs = Array.from(values(empty));
    expect(vs).toStrictEqual([]);
  });

  test('should preserve mixed types', () => {
    const mixed = [1, 'hello', null] as const;
    const vs = Array.from(values(mixed));
    expectType<typeof vs, (1 | 'hello' | null)[]>('=');
    expect(vs).toStrictEqual([1, 'hello', null]);
  });
});

describe('indices', () => {
  test('should return array of indices', () => {
    const fruits = ['apple', 'banana', 'cherry'];
    const ks = Array.from(indices(fruits));
    expect(ks).toStrictEqual([0, 1, 2]);
  });

  test('should work with tuples', () => {
    const tuple = ['a', 'b'] as const;
    const ks = Array.from(indices(tuple));
    expectType<typeof ks, Uint32[]>('=');
    expect(ks).toStrictEqual([0, 1]);
  });

  test('should work with empty array', () => {
    const empty: string[] = [];
    const ks = Array.from(indices(empty));
    expect(ks).toStrictEqual([]);
  });

  test('should work with larger arrays', () => {
    const large = Array.from({ length: 5 }, () => 'x');
    const ks = Array.from(indices(large));
    expect(ks).toStrictEqual([0, 1, 2, 3, 4]);
  });
});
