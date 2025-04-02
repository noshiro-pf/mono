/* eslint-disable vitest/expect-expect */
import { codeFromStringLines, testPreprocess } from '../utils/index.mjs';
import { normalizeReadonlyTypes } from './normalize-readonly-types.mjs';

describe('normalizeReadonlyTypes', () => {
  describe('Normalize `Readonly` wrappers', () => {
    test.each([
      {
        name: 'Array type wrapped with `Readonly`',
        source: 'type T = Readonly<1[]>;',
        expected: 'type T = readonly 1[];',
      },
      {
        name: 'Readonly array type wrapped with `Readonly`',
        source: 'type T = Readonly<readonly 2[]>;',
        expected: 'type T = readonly 2[];',
      },
      {
        name: 'Readonly tuple type wrapped with `Readonly`',
        source: 'type T = Readonly<readonly [1, 2, 3]>;',
        expected: 'type T = readonly [1, 2, 3];',
      },
      {
        name: 'Nested Readonly wrapper',
        source: 'type T = Readonly<Readonly<{ x: 3 }>>;',
        expected: 'type T = Readonly<{ x: 3 }>;',
      },
      {
        name: 'Deeply nested Readonly wrapper',
        source: 'type T = Readonly<((Readonly<Readonly<(({ x: 4 })[])>>))>;',
        expected: 'type T = readonly { x: 4 }[];',
      },
      {
        name: 'Intersection within readonly array',
        source:
          'type T = readonly (Readonly<{ x: 1 }> & Readonly<{ y: 2 }>)[];',
        expected: 'type T = readonly Readonly<{ x: 1 } & { y: 2 }>[];',
      },
      {
        name: 'Union within readonly array',
        source:
          'type T = readonly (Readonly<{ x: 1 }> | Readonly<{ y: 2 }>)[];',
        expected: 'type T = readonly Readonly<{ x: 1 } | { y: 2 }>[];',
      },
    ])('$name', testFn);
  });

  describe.only('Readonly wrapper edge cases', () => {
    test.each([
      {
        name: 'Readonly wrapper on Promise<T[]>',
        source: codeFromStringLines(
          'type Test1 = Readonly<Promise<string[]>>; ',
          'type Test2 = Readonly<Promise<readonly number[]>>',
        ),
        expected: codeFromStringLines(
          'type Test1 = Readonly<Promise<readonly string[]>>; ',
          'type Test2 = Readonly<Promise<readonly number[]>>',
        ),
        debug: true,
      },
      {
        name: 'Readonly wrapper on CustomGeneric<T[]>',
        source: codeFromStringLines(
          'type Wrapper<T> = { data: T };',
          'type Test3 = Readonly<Wrapper<Map<string, number[]>>>;',
        ),
        expected: codeFromStringLines(
          'type Wrapper<T> = Readonly<{ data: T }>;',
          'type Test3 = Readonly<Wrapper<ReadonlyMap<string, readonly number[]>>>;',
        ),
      },
      {
        name: 'Nested Readonly simplification with Promise',
        source: 'type Test4 = Readonly<Readonly<Promise<string[]>>>;',
        expected: 'type Test4 = Readonly<Promise<readonly string[]>>;',
      },
    ])('$name', testFn);
  });

  describe('Union and intersection types', () => {
    test.each([
      {
        name: 'Union of arrays',
        source: 'type UnionArr = string[] | number[];',
        expected: 'type UnionArr = readonly string[] | readonly number[];',
      },
      {
        name: 'Union of objects',
        source: 'type UnionObj = { a: string[] } | { b: number[] };',
        expected:
          'type UnionObj = Readonly<{ a: readonly string[] } | { b: readonly number[] }>;',
      },
      {
        name: 'Union including non-object/array',
        source: 'type UnionMixed = { a: string[] } | number[];',
        expected:
          'type UnionMixed = Readonly<{ a: readonly string[] }> | readonly number[];',
      },
      {
        name: 'Union where only some become Readonly<*>',
        source: 'type UnionPartialReadonly = Readonly<string[]> | number[];',
        expected:
          'type UnionPartialReadonly = readonly string[] | readonly number[];',
      },
      {
        name: 'Intersection of arrays (less common)',
        source: 'type IntersectArr = string[] & number[];',
        expected: 'type IntersectArr = readonly string[] & readonly number[];',
      },
      {
        name: 'Intersection of objects',
        source: 'type IntersectObj = { a: string[] } & { b: number[] };',
        expected:
          'type IntersectObj = Readonly<{ a: readonly string[] } & { b: readonly number[] }>;',
      },
      {
        name: 'Intersection including non-object/array',
        source: 'type IntersectMixed = { a: string[] } & string[];',
        expected:
          'type IntersectMixed = Readonly<{ a: readonly string[] }> & readonly string[];',
      },
      {
        name: 'Intersection where only some become Readonly<*>',
        source:
          'type IntersectPartialReadonly = Readonly<{ a: 1 }> & { b: number[] };',
        expected:
          'type IntersectPartialReadonly = Readonly<{ a: 1 } & { b: readonly number[] }>;',
      },
      {
        name: 'Nested union/intersection',
        source:
          'type Nested = (string[] | { x: Map<string, number[]> }) & { y: Set<boolean[]> };',
        expected:
          'type Nested = (readonly string[] | Readonly<{ x: ReadonlyMap<string, readonly number[]> }>) & Readonly<{ y: ReadonlySet<readonly boolean[]> }>;',
      },
      {
        name: 'Union collapse with Array types',
        source: 'type UArr = Readonly<string[]> | Readonly<number[]>;',
        expected: 'type UArr = readonly string[] | readonly number[];',
      },
      {
        name: 'Intersection collapse with Array types',
        source: 'type IArr = Readonly<string[]> & Readonly<number[]>;',
        expected: 'type IArr = readonly string[] & readonly number[];',
      },
      {
        name: 'Union of readonly arrays in Readonly',
        source: 'type UArr = Readonly<readonly string[] | readonly number[]>;',
        expected: 'type UArr = readonly string[] | readonly number[];',
      },
      {
        name: 'Intersection of readonly arrays in Readonly',
        source: 'type UArr = Readonly<readonly string[] & readonly number[]>;',
        expected: 'type UArr = readonly string[] & readonly number[];',
      },
    ])('$name', testFn);
  });

  describe('Parenthesized types', () => {
    test.each([
      {
        name: 'Parenthesized readonly array',
        source: 'type ParenReadonlyArr = (readonly string[]);',
        expected: 'type ParenReadonlyArr = readonly string[];',
      },
      {
        name: 'Parenthesized readonly tuple',
        source: 'type ParenReadonlyTup = (readonly [string, number]);',
        expected: 'type ParenReadonlyTup = readonly [string, number];',
      },
      {
        name: 'Parenthesized type literal',
        source: 'type ParenObj = ({ a: number[] });',
        expected: 'type ParenObj = Readonly<{ a: readonly number[] }>;',
      },
      {
        name: 'Parenthesized type with union/intersection',
        source: 'type Paren = ({ a: string[] } | { b: number[] })[];',
        expected:
          'type Paren = readonly Readonly<{ a: readonly string[] } | { b: readonly number[] }>[]',
      },
    ])('$name', testFn);
  });

  // describe('test', () => {
  //   test.each([])('$name', testFn);
  // });
});

const testFn = ({
  source,
  expected,
  debug,
}: Readonly<{
  source: string;
  expected: string;
  debug?: boolean;
}>): void => {
  const { expectedFormatted, result } = testPreprocess(
    normalizeReadonlyTypes,
    source,
    expected,
    debug ?? false,
  );

  expect(result).toBe(expectedFormatted);
};
