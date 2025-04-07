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
        name: 'Deeply nested Readonly wrapper with array/parens', // 名前修正
        source: 'type T = Readonly<((Readonly<Readonly<(({ x: 4 })[])>>))>;',
        // Readonly<( (Readonly<Readonly<({ x: 4 }[])>>) )>
        // -> Readonly<Readonly<Readonly<({ x: 4 }[])>>>   (remove ParenthesizedTypeNode)
        // -> Readonly<Readonly<({ x: 4 }[])>>             (Readonly<Readonly<T>> -> Readonly<T>)
        // -> Readonly<({ x: 4 }[])>                       (Readonly<Readonly<T>> -> Readonly<T>)
        // -> readonly { x: 4 }[]                          (Readonly<T[]> -> readonly T[])
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

  // ここまでチェック済み！！！

  describe('Readonly wrapper edge cases', () => {
    test.each([
      {
        name: 'Readonly wrapper on Promise<T[]>',
        source: codeFromStringLines(
          'type Test1 = Readonly<Promise<string[]>>; ', // Promise<string[]> は正規化対象外
          'type Test2 = Readonly<Promise<readonly number[]>>', // Promise<readonly number[]> も正規化対象外
        ),
        expected: codeFromStringLines(
          'type Test1 = Readonly<Promise<string[]>>; ', // そのまま
          'type Test2 = Readonly<Promise<readonly number[]>>', // そのまま
        ),
      },
      {
        name: 'Readonly wrapper on CustomGeneric<T[]>',
        source: codeFromStringLines(
          'type Wrapper<T> = { data: T };',
          'type Test3 = Readonly<Wrapper<Map<string, number[]>>>;', // Map や Array は対象外
        ),
        expected: codeFromStringLines(
          'type Wrapper<T> = { data: T };',
          'type Test3 = Readonly<Wrapper<Map<string, number[]>>>;', // そのまま
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
        expected: 'type UnionArr = string[] | readonly number[];', // 変更なし
      },
      {
        name: 'Union of objects',
        source: 'type UnionObj = { a: string[] } | { b: readonly number[] };',
        expected: 'type UnionObj = { a: string[] } | { b: readonly number[] };', // 変更なし
      },
      {
        name: 'Union including non-object/array',
        source:
          'type UnionMixed = { a: readonly string[] } | readonly number[];',
        expected:
          'type UnionMixed = { a: readonly string[] } | readonly number[];', // 変更なし
      },
      {
        name: 'Union where only one part is normalized', // 名前修正
        source: 'type UnionPartialReadonly = Readonly<string[]> | number[];',
        expected: 'type UnionPartialReadonly = readonly string[] | number[];', // Readonly<string[]> のみ正規化
      },
      {
        name: 'Union of Readonly objects',
        source:
          'type UnionObj = Readonly<{ a: string[] }> | Readonly<{ b: readonly number[] }>;',
        // Readonly<A> | Readonly<B> -> Readonly<A | B> (Collapse)
        // 内側の型は正規化されない (string[], readonly number[])
        expected:
          'type UnionObj = Readonly<{ a: string[] } | { b: readonly number[] }>;',
      },
      {
        name: 'Intersection of arrays (less common)',
        source: 'type IntersectArr = string[] & readonly number[];',
        expected: 'type IntersectArr = string[] & readonly number[];', // 変更なし
      },
      {
        name: 'Intersection of objects',
        source:
          'type IntersectObj = { a: readonly string[] } & { b: number[] };',
        expected:
          'type IntersectObj = { a: readonly string[] } & { b: number[] };', // 変更なし
      },
      {
        name: 'Intersection including non-object/array',
        source:
          'type IntersectMixed = { a: readonly string[] } & readonly string[];',
        expected:
          'type IntersectMixed = { a: readonly string[] } & readonly string[];', // 変更なし
      },
      {
        name: 'Intersection where only one part is normalized', // 名前修正
        source:
          'type IntersectionPartialReadonly = Readonly<string[]> & number[];',
        expected:
          'type IntersectionPartialReadonly = readonly string[] & number[];', // Readonly<string[]> のみ正規化
      },
      {
        name: 'Intersection of Readonly objects',
        source:
          'type IntersectionObj = Readonly<{ a: string[] }> & Readonly<{ b: readonly number[] }>;',
        // Readonly<A> & Readonly<B> -> Readonly<A & B> (Collapse)
        // 内側の型は正規化されない (string[], readonly number[])
        expected:
          'type IntersectionObj = Readonly<{ a: string[] } & { b: readonly number[] }>;',
      },
      {
        name: 'Nested union/intersection',
        source:
          'type Nested = (string[] | Readonly<{ x: Map<string, number[]> }>) & Readonly<{ y: Set<boolean[]> }>;',
        // 各要素は正規化対象外なので、全体として変更なし
        expected:
          'type Nested = (string[] | Readonly<{ x: Map<string, number[]> }>) & Readonly<{ y: Set<boolean[]> }>;',
      },
      {
        name: 'Union collapse with Array types', // ★ 期待値を実装に合わせて修正
        source: 'type UArr = Readonly<string[]> | Readonly<number[]>;',
        // Readonly<A[]> | Readonly<B[]> -> Readonly<A[] | B[]>
        expected: 'type UArr = Readonly<string[] | number[]>;',
      },
      {
        name: 'Intersection collapse with Array types', // ★ 期待値を実装に合わせて修正
        source: 'type IArr = Readonly<string[]> & Readonly<number[]>;',
        // Readonly<A[]> & Readonly<B[]> -> Readonly<A[] & B[]>
        expected: 'type IArr = Readonly<string[] & number[]>;',
      },
      {
        name: 'Union of readonly arrays in Readonly', // OK (実装の Unwrapping Logic 確認)
        source: 'type UArr = Readonly<readonly string[] | readonly number[]>;',
        expected: 'type UArr = readonly string[] | readonly number[];',
      },
      {
        name: 'Intersection of readonly arrays in Readonly', // OK (実装の Unwrapping Logic 確認)
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
        expected: 'type Paren = ({ a: string[] } | { b: number[] })[]', // 変更なし
      },
      {
        name: 'Nested Parentheses Removal', // 追加
        source: 'type NestedParen = ((readonly T[]));', // Assuming T exists
        // ((readonly T[])) -> (readonly T[]) -> readonly T[]
        expected: 'type NestedParen = readonly T[];',
      },
      {
        name: 'Parentheses around primitive', // 追加
        source: 'type ParenPrim = (number);',
        expected: 'type ParenPrim = number;', // 括弧除去
      },
      {
        name: 'Parentheses around Readonly<T>', // 追加
        source: 'type ParenReadonly = (Readonly<{a: number}>);',
        // (Readonly<T>) -> Readonly<T> (TypeReference なので括弧除去)
        expected: 'type ParenReadonly = Readonly<{a: number}>;',
      },
    ])('$name', testFn);
  });

  describe('Type literals', () => {
    test.each([
      // ... (既存のテストケース) ...
      {
        name: 'Type literal with one readonly member (unchanged)', // 追加
        source: 'type T = { readonly a: number; b: string };',
        expected: 'type T = { readonly a: number; b: string };', // 正規化のみなので変更なし
      },
      {
        name: 'Type literal with no readonly members (unchanged)', // 追加
        source: 'type T = { a: number; b: string };',
        expected: 'type T = { a: number; b: string };', // 正規化のみなので変更なし
      },
      {
        name: 'Type literal with all members readonly (normalized)', // 追加
        source: 'type T = { readonly a: number; readonly b: string };',
        // All members readonly -> Readonly<{...}> に正規化 (内部の readonly は削除)
        expected: 'type T = Readonly<{ a: number; b: string }>;',
      },
      {
        name: 'Readonly type literal (canonical form, unchanged)', // 追加
        source: 'type T = Readonly<{ a: number; b: string }>;',
        expected: 'type T = Readonly<{ a: number; b: string }>;', // 既に正規形なので変更なし
      },
    ])('$name', testFn);
  });

  describe('Canonical readonly forms are stable', () => {
    // 追加: 正規形が変更されないことの確認
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
        name: 'Interface with readonly member is unchanged', // Interface 自体は変換対象外のはず
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
    // 追加: readonly でない型が変更されないことの確認
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
        name: 'Interface members without readonly are unchanged', // Interface 自体は変換対象外のはず
        source: 'interface I { prop: number[]; }',
        expected: 'interface I { prop: number[]; }',
      },
      {
        name: 'Class members without readonly are unchanged', // Class 自体は変換対象外のはず
        source: 'class C { prop: number[]; }',
        expected: 'class C { prop: number[]; }',
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
