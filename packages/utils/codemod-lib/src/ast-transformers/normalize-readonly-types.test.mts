/* eslint-disable vitest/expect-expect */
import { codeFromStringLines, testPreprocess } from '../utils/index.mjs';
import { normalizeReadonlyTypes } from './normalize-readonly-types.mjs';

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

describe('normalizeReadonlyTypes', () => {
  describe('ReadonlyArray', () => {
    test.each([
      {
        name: 'Local types within function',
        source: codeFromStringLines(
          'function foo() {',
          '  type Foo = ReadonlyArray<string>;', // -> readonly string[]
          '  type Bar = Array<string>;', // -> Array<string> (As is)
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
        // ReadonlyArray -> readonly []
        // Inner { readonly T, readonly C } -> Readonly<{ T, C }>
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
        expected: 'type T = readonly 1[];', // Readonly<T[]> -> readonly T[]
      },
      {
        name: 'Readonly array type wrapped with `Readonly`',
        source: 'type T = Readonly<readonly 2[]>;',
        expected: 'type T = readonly 2[];', // Readonly<readonly T[]> -> readonly T[]
      },
      {
        name: 'Tuple type wrapped with `Readonly`',
        source: 'type T = Readonly<[1, 2]>;',
        expected: 'type T = readonly [1, 2];', // Readonly<[T]> -> readonly [T]
      },
      {
        name: 'Readonly tuple type wrapped with `Readonly`',
        source: 'type T = Readonly<readonly [1, 2, 3]>;',
        expected: 'type T = readonly [1, 2, 3];', // Readonly<readonly [T]> -> readonly [T]
      },
      {
        name: 'Nested Readonly wrapper',
        source: 'type T = Readonly<Readonly<{ x: 3 }>>;',
        expected: 'type T = Readonly<{ x: 3 }>;', // Readonly<Readonly<T>> -> Readonly<T>
      },
      {
        name: 'Deeply nested Readonly wrapper',
        source: 'type T = Readonly<Readonly<Readonly<{ x: 2 }>>>;',
        expected: 'type T = Readonly<{ x: 2 }>;',
      },
      {
        name: 'Deeply nested Readonly wrapper with array/parens',
        source: 'type T = Readonly<((Readonly<Readonly<(({ x: 4 })[])>>))>;',
        // Readonly<( (Readonly<Readonly<({ x: 4 }[])>>) )>
        // -> Readonly<Readonly<Readonly<({ x: 4 }[])>>>  (remove ParenthesizedTypeNode)
        // -> Readonly<Readonly<({ x: 4 }[])>>            (Readonly<Readonly<T>> -> Readonly<T>)
        // -> Readonly<({ x: 4 }[])>                      (Readonly<Readonly<T>> -> Readonly<T>)
        // -> readonly { x: 4 }[]                         (Readonly<T[]> -> readonly T[])
        expected: 'type T = readonly { x: 4 }[];',
      },
      {
        name: 'Intersection within readonly array',
        source:
          'type T = readonly (Readonly<{ x: 1 }> & Readonly<{ y: 2 }>)[];',
        // readonly (Readonly<A> & Readonly<B>)[]
        // -> readonly Readonly<A & B>[] (Inner Intersection Collapse)
        expected: 'type T = readonly Readonly<{ x: 1 } & { y: 2 }>[];',
      },
      {
        name: 'Union within readonly array',
        source:
          'type T = readonly (Readonly<{ x: 1 }> | Readonly<{ y: 2 }>)[];',
        // readonly (Readonly<A> | Readonly<B>)[]
        // -> readonly Readonly<A | B>[] (Inner Union Collapse)
        expected: 'type T = readonly Readonly<{ x: 1 } | { y: 2 }>[];',
      },
    ])('$name', testFn);
  });

  describe('Readonly wrapper edge cases', () => {
    test.each([
      {
        name: 'Readonly wrapper on Promise<T[]>',
        source: codeFromStringLines(
          'type Test1 = Readonly<Promise<string[]>>; ', // Promise<string[]> is not a normalization target
          'type Test2 = Readonly<Promise<readonly number[]>>', // Promise<readonly number[]> is also not a normalization target
        ),
        expected: codeFromStringLines(
          'type Test1 = Readonly<Promise<string[]>>; ', // As is
          'type Test2 = Readonly<Promise<readonly number[]>>', // As is
        ),
      },
      {
        name: 'Readonly wrapper on CustomGeneric<T[]>',
        source: codeFromStringLines(
          'type Wrapper<T> = { data: T };',
          'type Test3 = Readonly<Wrapper<Map<string, number[]>>>;', // Map and Array are not targets
        ),
        expected: codeFromStringLines(
          'type Wrapper<T> = { data: T };',
          'type Test3 = Readonly<Wrapper<Map<string, number[]>>>;', // As is
        ),
      },
      {
        name: 'Nested Readonly simplification with Promise',
        source: 'type Test4 = Readonly<Readonly<Promise<string[]>>>;',
        // Readonly<Readonly<T>> -> Readonly<T>
        expected: 'type Test4 = Readonly<Promise<string[]>>;',
      },
    ])('$name', testFn);
  });

  describe('Union and intersection types', () => {
    test.each([
      {
        name: 'Union of arrays',
        source: 'type UnionArr = string[] | readonly number[];',
        expected: 'type UnionArr = string[] | readonly number[];', // Unchanged
      },
      {
        name: 'Union of objects',
        source: 'type UnionObj = { a: string[] } | { b: readonly number[] };',
        expected: 'type UnionObj = { a: string[] } | { b: readonly number[] };', // Unchanged
      },
      {
        name: 'Union including non-object/array',
        source:
          'type UnionMixed = { a: readonly string[] } | readonly number[];',
        expected:
          'type UnionMixed = { a: readonly string[] } | readonly number[];', // Unchanged
      },
      {
        name: 'Union where only one part is normalized',
        source: 'type UnionPartialReadonly = Readonly<string[]> | number[];',
        expected: 'type UnionPartialReadonly = readonly string[] | number[];', // Only Readonly<string[]> is normalized
      },
      {
        name: 'Union of Readonly objects',
        source:
          'type UnionObj = Readonly<{ a: string[] }> | Readonly<{ b: readonly number[] }>;',
        // Readonly<A> | Readonly<B> -> Readonly<A | B> (Collapse)
        // Inner types are not normalized (string[], readonly number[])
        expected:
          'type UnionObj = Readonly<{ a: string[] } | { b: readonly number[] }>;',
      },
      {
        name: 'Union of generic and non-generic readonly objects',
        source:
          'type IntersectMixed = { readonly a: string[] } & Readonly<{ b: readonly number[] }>;',
        expected:
          'type IntersectMixed = Readonly<{ a: string[] } & { b: readonly number[] }>;',
      },
      {
        name: 'Intersection of readonly object and non-readonly object',
        source:
          'type IntersectMixed = { readonly a: string[] } & { b: readonly number[] };',
        expected:
          'type IntersectMixed = Readonly<{ a: string[] }> & { b: readonly number[] };',
      },
      {
        name: 'Intersection of arrays (less common)',
        source: 'type IntersectArr = string[] & readonly number[];',
        expected: 'type IntersectArr = string[] & readonly number[];', // Unchanged
      },
      {
        name: 'Intersection of objects',
        source:
          'type IntersectObj = { a: readonly string[] } & { b: number[] };',
        expected:
          'type IntersectObj = { a: readonly string[] } & { b: number[] };', // Unchanged
      },
      {
        name: 'Intersection including non-object/array',
        source:
          'type IntersectMixed = { a: readonly string[] } & readonly string[];',
        expected:
          'type IntersectMixed = { a: readonly string[] } & readonly string[];', // Unchanged
      },
      {
        name: 'Intersection where only one part is normalized',
        source:
          'type IntersectionPartialReadonly = Readonly<string[]> & number[];',
        expected:
          'type IntersectionPartialReadonly = readonly string[] & number[];', // Only Readonly<string[]> is normalized
      },
      {
        name: 'Intersection of Readonly objects',
        source:
          'type IntersectionObj = Readonly<{ a: string[] }> & Readonly<{ b: readonly number[] }>;',
        // Readonly<A> & Readonly<B> -> Readonly<A & B> (Collapse)
        // Inner types are not normalized (string[], readonly number[])
        expected:
          'type IntersectionObj = Readonly<{ a: string[] } & { b: readonly number[] }>;',
      },
      {
        name: 'Nested union/intersection',
        source:
          'type Nested = (string[] | Readonly<{ x: Map<string, number[]> }>) & Readonly<{ y: Set<boolean[]> }>;',
        // Each part is not a normalization target, so unchanged
        expected:
          'type Nested = (string[] | Readonly<{ x: Map<string, number[]> }>) & Readonly<{ y: Set<boolean[]> }>;',
      },
      {
        name: 'Union collapse with Array types',
        source: 'type UArr = Readonly<string[]> | Readonly<number[]>;',
        // Readonly<A[]> | Readonly<B[]> -> Readonly<A[] | B[]>
        expected: 'type UArr = readonly string[] | readonly number[];',
      },
      {
        name: 'Intersection collapse with Array types',
        source: 'type IArr = Readonly<string[]> & Readonly<number[]>;',
        // Readonly<A[]> & Readonly<B[]> -> Readonly<A[] & B[]>
        expected: 'type IArr = readonly string[] & readonly number[];',
      },
      {
        name: 'Union of readonly arrays in Readonly',
        source: 'type UArr = Readonly<readonly string[] | readonly number[]>;',
        expected: 'type UArr = readonly string[] | readonly number[];',
      },
      {
        name: 'Intersection of readonly arrays in Readonly',
        source: 'type IArr = Readonly<readonly string[] & readonly number[]>;',
        expected: 'type IArr = readonly string[] & readonly number[];',
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
        expected: 'type Paren = ({ a: string[] } | { b: number[] })[]', // Unchanged
      },
      {
        name: 'Nested Parentheses Removal',
        source: 'type NestedParen = ((readonly number[]));',
        // ((readonly T[])) -> (readonly T[]) -> readonly T[]
        expected: 'type NestedParen = readonly number[];',
      },
      {
        name: 'Parentheses around primitive',
        source: 'type ParenPrim = (number);',
        expected: 'type ParenPrim = number;', // Parentheses removed
      },
      {
        name: 'Parentheses around Readonly<T>',
        source: 'type ParenReadonly = (Readonly<{ a: number }>);',
        // (Readonly<T>) -> Readonly<T> (Parentheses removed because inner type is TypeReference)
        expected: 'type ParenReadonly = Readonly<{ a: number }>;',
      },
    ])('$name', testFn);
  });

  describe('Type literals', () => {
    test.each([
      {
        name: 'Type literal with one readonly member (unchanged)',
        source: 'type T = { readonly a: number; b: string };',
        expected: 'type T = { readonly a: number; b: string };', // Unchanged (normalization only)
      },
      {
        name: 'Type literal with no readonly members (unchanged)',
        source: 'type T = { a: number; b: string };',
        expected: 'type T = { a: number; b: string };', // Unchanged (normalization only)
      },
      {
        name: 'Type literal with all members readonly (normalized)',
        source: 'type T = { readonly a: number; readonly b: string };',
        // All members readonly -> Normalized to Readonly<{...}> (inner readonly removed)
        expected: 'type T = Readonly<{ a: number; b: string }>;',
      },
      {
        name: 'Readonly type literal (canonical form, unchanged)',
        source: 'type T = Readonly<{ a: number; b: string }>;',
        expected: 'type T = Readonly<{ a: number; b: string }>;', // Unchanged (already canonical form)
      },
    ])('$name', testFn);
  });

  describe('Canonical readonly forms are stable', () => {
    // Verify canonical forms are stable
    test.each([
      {
        name: 'readonly T[] is unchanged',
        source: 'type T = readonly string[];',
        expected: 'type T = readonly string[];',
      },
      {
        name: 'readonly [T1, T2] is unchanged',
        source: 'type T = readonly [string, number];',
        expected: 'type T = readonly [string, number];',
      },
      {
        name: 'readonly [T1, ...T2[]] is unchanged',
        source: 'type T = readonly [string, ...number[]];',
        expected: 'type T = readonly [string, ...number[]];',
      },
      {
        name: 'ReadonlySet<T> is unchanged',
        source: 'type T = ReadonlySet<number>;',
        expected: 'type T = ReadonlySet<number>;',
      },
      {
        name: 'ReadonlyMap<K, V> is unchanged',
        source: 'type T = ReadonlyMap<string, boolean>;',
        expected: 'type T = ReadonlyMap<string, boolean>;',
      },
      {
        name: 'Readonly<{ a: T }> is unchanged',
        source: 'type T = Readonly<{ a: string }>;',
        expected: 'type T = Readonly<{ a: string }>;',
      },
      {
        name: 'Interface with readonly member is unchanged', // Interface itself should not be transformed
        source: 'interface I { readonly prop: number; }',
        expected: 'interface I { readonly prop: number; }',
      },
      {
        name: 'Type literal with readonly member (not all readonly) is unchanged',
        source: 'type T = { readonly a: number; b: string };',
        expected: 'type T = { readonly a: number; b: string };',
      },
      {
        name: 'Complex nested readonly is unchanged',
        source:
          'type T = ReadonlyMap<string, readonly Readonly<{ p: readonly boolean[] }>[]>;',
        expected:
          'type T = ReadonlyMap<string, readonly Readonly<{ p: readonly boolean[] }>[]>;',
      },
    ])('$name', testFn);
  });

  describe('Non-readonly forms are unchanged', () => {
    // Verify non-readonly forms are unchanged
    test.each([
      {
        name: 'T[] is unchanged',
        source: 'type T = string[];',
        expected: 'type T = string[];',
      },
      {
        name: '[T1, T2] is unchanged',
        source: 'type T = [string, number];',
        expected: 'type T = [string, number];',
      },
      {
        name: 'Set<T> is unchanged',
        source: 'type T = Set<number>;',
        expected: 'type T = Set<number>;',
      },
      {
        name: 'Map<K, V> is unchanged',
        source: 'type T = Map<string, boolean>;',
        expected: 'type T = Map<string, boolean>;',
      },
      {
        name: '{ a: T } is unchanged',
        source: 'type T = { a: string };',
        expected: 'type T = { a: string };',
      },
      {
        name: 'Array<T> is unchanged',
        source: 'type T = Array<string>;',
        expected: 'type T = Array<string>;',
      },
      {
        name: 'Interface members without readonly are unchanged', // Interface itself should not be transformed
        source: 'interface I { prop: number[]; }',
        expected: 'interface I { prop: number[]; }',
      },
      {
        name: 'Class members without readonly are unchanged', // Class itself should not be transformed
        source: 'class C { prop: number[]; }',
        expected: 'class C { prop: number[]; }',
      },
    ])('$name', testFn);
  });

  // describe('test', () => {
  //   test.each([])('$name', testFn);
  // });
});
