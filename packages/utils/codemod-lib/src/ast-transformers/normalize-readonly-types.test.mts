/* eslint-disable vitest/expect-expect */
import { codeFromStringLines, testPreprocess } from '../utils/index.mjs';
import { normalizeReadonlyTypes } from './normalize-readonly-types.mjs';

describe('normalizeReadonlyTypes', () => {
  describe('ReadonlyArray', () => {
    test.each([
      {
        name: 'Local types within function',
        source: codeFromStringLines(
          'function foo() {',
          '  type Foo = ReadonlyArray<string>;',
          '  type Bar = Array<string>;',
          '}',
        ),
        expected: codeFromStringLines(
          'function foo() {',
          '  type Foo = readonly string[];',
          '  type Bar = Array<string>;',
          '}',
        ),
      },
      {
        name: 'Type literal elements with a readonly modifier in an array',
        source:
          'type foo = ReadonlyArray<{ readonly type: string, readonly code: string }>;',
        expected:
          'type foo = readonly Readonly<{ type: string, code: string }>[];',
      },
    ])('$name', testFn);
  });

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
        source: 'type T = Readonly<Readonly<Readonly<{ x: 2 }>>>;',
        expected: 'type T = Readonly<{ x: 2 }>;',
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

  describe('Readonly wrapper edge cases', () => {
    test.each([
      {
        name: 'Readonly wrapper on Promise<T[]>',
        source: codeFromStringLines(
          'type Test1 = Readonly<Promise<string[]>>; ',
          'type Test2 = Readonly<Promise<readonly number[]>>',
        ),
        expected: codeFromStringLines(
          'type Test1 = Readonly<Promise<string[]>>; ',
          'type Test2 = Readonly<Promise<readonly number[]>>',
        ),
      },
      {
        name: 'Readonly wrapper on CustomGeneric<T[]>',
        source: codeFromStringLines(
          'type Wrapper<T> = { data: T };',
          'type Test3 = Readonly<Wrapper<Map<string, number[]>>>;',
        ),
        expected: codeFromStringLines(
          'type Wrapper<T> = { data: T };',
          'type Test3 = Readonly<Wrapper<Map<string, number[]>>>;',
        ),
      },
      {
        name: 'Nested Readonly simplification with Promise',
        source: 'type Test4 = Readonly<Readonly<Promise<string[]>>>;',
        expected: 'type Test4 = Readonly<Promise<string[]>>;',
      },
    ])('$name', testFn);
  });

  describe('Union and intersection types', () => {
    test.each([
      {
        name: 'Union of arrays',
        source: 'type UnionArr = string[] | readonly number[];',
        expected: 'type UnionArr = string[] | readonly number[];',
      },
      {
        name: 'Union of objects',
        source: 'type UnionObj = { a: string[] } | { b: readonly number[] };',
        expected: 'type UnionObj = { a: string[] } | { b: readonly number[] };',
      },
      {
        name: 'Union including non-object/array',
        source:
          'type UnionMixed = { a: readonly string[] } | readonly number[];',
        expected:
          'type UnionMixed = { a: readonly string[] } | readonly number[];',
      },
      {
        name: 'Union where only some become Readonly<*>',
        source: 'type UnionPartialReadonly = Readonly<string[]> | number[];',
        expected: 'type UnionPartialReadonly = readonly string[] | number[];',
      },
      {
        name: 'Union of Readonly objects',
        source:
          'type UnionObj = Readonly<{ a: string[] }> | Readonly<{ b: readonly number[] }>;',
        expected:
          'type UnionObj = Readonly<{ a: string[] } | { b: readonly number[] }>;',
      },
      {
        name: 'Intersection of arrays (less common)',
        source: 'type IntersectArr = string[] & readonly number[];',
        expected: 'type IntersectArr = string[] & readonly number[];',
      },
      {
        name: 'Intersection of objects',
        source:
          'type IntersectObj = { a: readonly string[] } & { b: number[] };',
        expected:
          'type IntersectObj = { a: readonly string[] } & { b: number[] };',
      },
      {
        name: 'Intersection including non-object/array',
        source:
          'type IntersectMixed = { a: readonly string[] } & readonly string[];',
        expected:
          'type IntersectMixed = { a: readonly string[] } & readonly string[];',
      },
      {
        name: 'Intersection where only some become Readonly<*>',
        source:
          'type IntersectionPartialReadonly = Readonly<string[]> & number[];',
        expected:
          'type IntersectionPartialReadonly = readonly string[] & number[];',
      },
      {
        name: 'Intersection of Readonly objects',
        source:
          'type IntersectionObj = Readonly<{ a: string[] }> & Readonly<{ b: readonly number[] }>;',
        expected:
          'type IntersectionObj = Readonly<{ a: string[] } & { b: readonly number[] }>;',
      },
      {
        name: 'Nested union/intersection',
        source:
          'type Nested = (string[] | Readonly<{ x: Map<string, number[]> }>) & Readonly<{ y: Set<boolean[]> }>;',
        expected:
          'type Nested = (string[] | Readonly<{ x: Map<string, number[]> }>) & Readonly<{ y: Set<boolean[]> }>;',
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
        expected: 'type ParenObj = { a: number[] };',
      },
      {
        name: 'Parenthesized type with union/intersection',
        source: 'type Paren = ({ a: string[] } | { b: number[] })[];',
        expected: 'type Paren = ({ a: string[] } | { b: number[] })[]',
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
