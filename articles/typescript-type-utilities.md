---
title: 'TypeScript 型ユーティリティ集'
emoji: '🐈'
type: 'tech' # tech: 技術記事 / idea: アイデア
topics: ['typescript']
published: true
---

ほぼ私のライブラリ [ts-type-utils-no-stdlib](https://github.com/noshiro-pf/mono/tree/main/packages/utils/ts-type-utils-no-stdlib) と [ts-type-utils](https://github.com/noshiro-pf/mono/tree/main/packages/utils/ts-type-utils) からの抜粋です（都合により TypeScript 標準ライブラリ（`lib.es5.d.ts` 等）に依存するかどうかでパッケージを分けています）。
随時更新していきます。

---

## `expectType` （型のユニットテスト用ユーティリティ）

```ts
expectType<[1, 2, 3], [1, 2, 3]>('=');
expectType<[any], [number]>('<=');
expectType<number, string>('!=');
expectType<any, 1>('!=');
```

型が等価 or 部分型かどうか判定します。

- `expectType<A, B>("=")` は型 `A` と型 `B` が等価であるときに型エラーにならず、そうでないときに型エラーになります。
- `expectType<A, B>("<=")` は型 `A` が型 `B` の部分型であるときに型エラーにならず、そうでないときに型エラーになります。
- `expectType<A, B>("!=")` は型 `A` と型 `B` が等価でないときに型エラーにならず、等価であるときに型エラーになります。
- `expectType<A, B>("!<=")` は型 `A` が型 `B` の部分型でないときに型エラーにならず、部分型であるときに型エラーになります。

--- 実装 ---

```ts
const expectType = <A, B>(
  _relation: TypeEq<A, B> extends true
    ? '<=' | '='
    : TypeExtends<A, B> extends true
    ? '!=' | '<='
    : '!<=' | '!=',
): void => undefined;
```

```ts
// prettier-ignore
type TypeEq<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

type TypeExtends<A, B> = A extends B ? true : false;
```

:::message

```ts
// prettier-ignore
type TypeEq<A, B>
  = [A] extends [B] ? [B] extends [A] ? true : false : false;
```

という実装だと `any` が含まれるときに上手く動作しません（例えば以下のテストが通ってしまいます）。

```ts
expectType<any, number>('=');
expectType<{ x: any }, { x: number }>('=');
```

参考： https://github.com/microsoft/TypeScript/issues/27024
:::

:::details 使用例（ユニットテスト）
https://github.com/noshiro-pf/mono/blob/63d5aa9197236c4ffb74bece4ee6025a28dd71b1/packages/utils/ts-type-utils-no-stdlib/test/eq.ts
:::

## `BoolAnd`, `BoolOr`, `BoolNot`, `BoolEq`, `BoolNeq`, `BoolNand`, `BoolNor`,

```ts
expectType<BoolAnd<true, true>, true>('=');
expectType<BoolOr<false, true>, true>('=');
expectType<BoolNot<true>, false>('=');
expectType<BoolEq<false, false>, true>('=');
expectType<BoolNeq<false, true>, true>('=');
expectType<BoolNand<false, true>, true>('=');
expectType<BoolNor<false, false>, true>('=');
```

論理演算を行う関数です。

--- 実装（一部） ---

```ts
type BoolAnd<A extends boolean, B extends boolean> =
  //
  TypeEq<A, true> extends true
    ? TypeEq<B, true> extends true
      ? true
      : TypeEq<B, false> extends true
      ? false
      : never
    : TypeEq<A, false> extends true
    ? TypeEq<B, true> extends true
      ? false
      : TypeEq<B, false> extends true
      ? false
      : never
    : never;
```

`A` や `B` に `true`, `false` の他に `boolean` や `never`, `any` などが入ってくる可能性もあるため、 `TypeEq` で厳密一致するかどうかをチェックする実装にしています。 `true` か `false` になっていなければすべて `never` を返します。

:::details ソースコード（残りの実装）
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/src/boolean.ts
:::

:::details 使用例（ユニットテスト）
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/test/boolean.ts
:::

## `IsNever`

```ts
expectType<IsNever<never>, true>('=');
expectType<IsNever<string>, false>('=');
```

型が `never` と等しいかどうか判定します。
Type Challenges^[[Type Challenges (IsNever)](https://github.com/type-challenges/type-challenges/blob/main/questions/01042-medium-isnever/README.md)]にも掲載されています。

--- 実装 ---

```ts
type IsNever<T> = [T] extends [never] ? true : false;
```

:::message
`[T] extends [never]` の部分は、 `T extends never` だと union distribution[^1] により `T` が `never` のときに全体が `never` になってしまうため、タプル型にして union distribution を回避しています。
:::

:::details テスト
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/test/is-never.ts
:::

## `IsUnion`

```ts
expectType<IsUnion<never>, false>('=');
expectType<IsUnion<string>, false>('=');
expectType<IsUnion<number | string>, true>('=');
```

型が（2 個以上の型の） union 型かどうか判定します。
Type Challenges^[[Type Challenges (IsUnion)](https://github.com/type-challenges/type-challenges/blob/main/questions/01097-medium-isunion/README.md)]にも掲載されています。

```ts
type IsUnion<U> = _IsUnionImpl<U, U>;

/** @internal */
type _IsUnionImpl<U, K extends U> = IsNever<U> extends true
  ? false
  : K extends K
  ? BoolNot<TypeEq<U, K>>
  : never;
```

まず与えられた型 `U` が `never` であれば `false` を返します。
次に union distribution[^1] を用いて `U` の各要素 `K` 取り出し、その `K` と `U` が等しければ、`U` は 1 要素の union ということになるので `false` を返し、そうでない場合は `true` を返す、という仕組みです。なお、最後の `never` に評価されることはありません（union distribution のイディオム）。

:::details ソースコード
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/src/is-union.ts
:::

:::details 使用例（ユニットテスト）
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/test/is-union.ts
:::

## `ToNumber`

```ts
expectType<ToNumber<'1000'>, 1000>('=');
expectType<ToNumber<'8192'>, 8192>('=');
```

数値の文字列型を数値型にします。

--- 実装 ---

```ts
// prettier-ignore
type ToNumber<S extends `${number}`>
  = S extends `${infer N extends number}` ? N : never;
```

:::message
注意： TypeScript 4.8 で実装された機能 に依存しているため、それ以前のバージョンでは tuple 型を経由して "length" プロパティを取り出す大掛かりな実装が必要になります。

@[card](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-8.html#improved-inference-for-infer-types-in-template-string-types)
:::

:::details ソースコード
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/src/to-number.ts
:::

:::details 使用例（ユニットテスト）
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/test/to-number.ts
:::

## `IsFixedLengthList`

```ts
expectType<IsFixedLengthList<readonly [1, 2, 3]>, true>('=');
expectType<IsFixedLengthList<readonly number[]>, false>('=');
expectType<IsFixedLengthList<[number, 1, 2, ...number[]]>, false>('=');
```

配列型が固定長であるかどうかを返します。

--- 実装 ---

```ts
type IsFixedLengthList<T extends readonly unknown[]> =
  number extends T['length'] ? false : true;
```

可変長配列（ `readonly number[]` など）の`"length"` の型が `number` 型であるのに対して、固定長の配列型（タプル型、 `[1, 2, 3]` など）の `"length"` の型が `number` 型ではなく定数の型（`3`など）になることを利用しています。

:::details ソースコード
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/src/is-fixed-length-list.ts
:::

:::details 使用例（ユニットテスト）
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/test/is-fixed-length-list.ts
:::

## `IndexOfTuple`

```ts
expectType<IndexOfTuple<readonly [1, 2, 3]>, 0 | 1 | 2>('=');
expectType<IndexOfTuple<readonly [2, 4, 6, 8, 10]>, 0 | 1 | 2 | 3 | 4>('=');
expectType<IndexOfTuple<readonly []>, never>('=');
```

タプル型のインデックスを返します。

--- 実装 ---

```ts
type IndexOfTuple<T extends readonly unknown[]> = _IndexOfTupleImpl<T, keyof T>;

type _IndexOfTupleImpl<
  T extends readonly unknown[],
  K,
> = IsFixedLengthList<T> extends true
  ? K extends keyof T
    ? K extends `${number}`
      ? ToNumber<K>
      : never
    : never
  : number;
```

タプル型 `T` から `keyof T` を取り出してそれらを `ToNumber` で map した結果を得るという実装です。 `K extends keyof T` のところで union distribution[^1] を使っています。
`K extends '${number}'`は `K` が `ToNumber` の制約を満たしているというヒントを型システムに与えるために追加していますが、 `IndexOfTuple` からの入力では必ず真になるので実質何もしていない条件部です。

:::details ソースコード
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/src/index-of-tuple.ts
:::

:::details 使用例（ユニットテスト）
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/test/index-of-tuple.ts
:::

## `MakeTuple`

```ts
expectType<MakeTuple<unknown, 3>, readonly [unknown, unknown, unknown]>('=');
```

第 1 引数の型を第 2 引数の整数個分繰り返した配列を作ります。

--- 実装 ---

```ts
type MakeTuple<Elm, N extends number> = _MakeTupleInternals.MakeTupleImpl<
  Elm,
  `${N}`,
  []
>;

namespace _MakeTupleInternals {
  type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  type Tail<T extends string> = T extends `${Digit}${infer U}` ? U : never;

  type First<T extends string> = T extends `${infer U}${Tail<T>}` ? U : never;

  type DigitStr = `${Digit}`;

  type Tile<
    T extends readonly unknown[],
    N extends Digit | DigitStr | '10' | 10,
  > = [
    readonly [],
    readonly [...T],
    readonly [...T, ...T],
    readonly [...T, ...T, ...T],
    readonly [...T, ...T, ...T, ...T],
    readonly [...T, ...T, ...T, ...T, ...T],
    readonly [...T, ...T, ...T, ...T, ...T, ...T],
    readonly [...T, ...T, ...T, ...T, ...T, ...T, ...T],
    readonly [...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T],
    readonly [...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T],
    readonly [...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T],
  ][N];

  export type MakeTupleImpl<
    T,
    N extends string,
    X extends readonly unknown[],
  > = string extends N
    ? never
    : N extends ''
    ? X
    : First<N> extends infer U
    ? U extends DigitStr
      ? MakeTupleImpl<T, Tail<N>, readonly [...Tile<[T], U>, ...Tile<X, 10>]>
      : never
    : never;
}
```

かなり大がかりですが、巨大な tuple 型を作ろうとしても再帰制限にひっかからないようにするためこのように実装が工夫がされています。以下の記事で紹介されていたものをほぼそのまま利用しました（`ToNumber` の実装だけ TypeScript 4.8 の機能を使い効率化しています）。

参考： https://techracho.bpsinc.jp/yoshi/2020_09_04/97108

以下の単純な再帰を行う実装でも小さな `N` に対しては同様に動きますが、 `N` が大きい場合に再帰回数の制限にひっかかってしまいます。
`MakeTupleNaive` の再帰回数は $O(N)$ なのに対し、 `MakeTuple` の再帰回数は $O(\log_{10} N)$ になります。

```ts
type MakeTupleNaive<Elm, N extends number> = _MakeTupleNaiveImpl<
  N,
  Elm,
  readonly []
>;

/** @internal */
type _MakeTupleNaiveImpl<Num, Elm, T extends readonly unknown[]> =
  //
  T extends { length: Num }
    ? T
    : _MakeTupleNaiveImpl<Num, Elm, readonly [Elm, ...T]>;
```

```ts
expectType<MakeTupleNaive<0, 1000>, MakeTuple<0, 1000>>('=');
// Type instantiation is excessively deep and possibly infinite. ts(2589)
```

:::details ソースコード
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/src/make-tuple.ts
:::

:::details 使用例（ユニットテスト）
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/test/make-tuple.ts
:::

## `Index`

```ts
expectType<Index<3>, 0 | 1 | 2>('=');
expectType<Index<5>, 0 | 1 | 2 | 3 | 4>('=');
```

与えられた整数未満の非負整数すべてからなる union 型を返します。

--- 実装 ---

```ts
type Index<N extends number> = IndexOfTuple<MakeTuple<0, N>>;
```

`MakeTuple` を利用して tuple を作った後 `IndexOfTuple` でその index を取り出す、という実装をしています。

:::details ソースコード
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/src/index-type.ts
:::

:::details 使用例（ユニットテスト）
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/test/index-type.ts
:::

## `NegativeIndex`

```ts
expectType<NegativeIndex<0>, never>('=');
expectType<NegativeIndex<5>, -1 | -2 | -3 | -4 | -5>('=');
```

与えられた整数以上の負整数すべて（`0` は除く）からなる union 型を返します。

--- 実装 ---

```ts
type NegativeIndex<N extends number> = _NegativeIndexImpl.MapIdx<
  RelaxedExclude<Index<N>, 0>
>;

namespace _NegativeIndexImpl {
  type ToNumberFromNegative<S extends `-${number}`> =
    S extends `${infer N extends number}` ? N : never;

  export type MapIdx<I extends number> = I extends I
    ? ToNumberFromNegative<`-${I}`>
    : never;
}
```

`Index` と同様 tuple 型の index を取り出す実装を使っていますが、負数にするためにその index `I` を `-${I}` で文字列化して数値として取り出すという実装をしています。

:::details ソースコード
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/src/index-type.ts
:::

:::details 使用例（ユニットテスト）
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/test/index-type.ts
:::

## Enum types

`Index` 型を実装したので以下の型も定義しておきます。

```ts
/** `0 | 1 | ... | 255` */
type Uint8 = Index<256>;

/** `0 | 1 | ... | 511` */
type Uint9 = Index<512>;

/** `0 | 1 | ... | 1023` */
type Uint10 = Index<1024>;

/** `-128 | -127 | ... | -1 | 0 | 1 | ... | 126 | 127` */
type Int8 = Readonly<Index<128> | NegativeIndex<129>>;

/** `-256 | -255 | ... | -1 | 0 | 1 | ... | 254 | 255` */
type Int9 = Readonly<Index<256> | NegativeIndex<257>>;

/** `-512 | -511 | ... | -1 | 0 | 1 | ... | 510 | 511` */
type Int10 = Readonly<Index<512> | NegativeIndex<513>>;
```

:::details ソースコード
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/src/enum.ts
:::

## `UintRange`

```ts
expectType<UintRange<0, 3>, 0 | 1 | 2>('=');
expectType<UintRange<0, 0>, never>('=');
expectType<UintRange<0, 1>, 0>('=');
expectType<UintRange<0, 5>, 0 | 1 | 2 | 3 | 4>('=');
expectType<UintRange<2, 5>, 2 | 3 | 4>('=');
```

--- 実装 ---

```ts
type UintRange<Start extends number, End extends number> = Exclude<
  Index<End>,
  Index<Start>
>;
```

`Index` と `Exclude` を組み合わせるだけで実装できます。

:::details ソースコード
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/src/uint-range.ts
:::

:::details 使用例（ユニットテスト）
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/test/uint-range.ts
:::

## `Max`, `Min`

```ts
expectType<Max<0 | 1 | 2>, 2>('=');
expectType<Max<0>, 0>('=');
expectType<Max<0 | 1 | 3 | 5 | 6>, 6>('=');

expectType<Min<0 | 1 | 2>, 0>('=');
expectType<Min<0>, 0>('=');
expectType<Min<0 | 1 | 3 | 5 | 6>, 0>('=');
```

数値の union 型から最大値／最小値を取り出します。

実装は[この記事](https://zenn.dev/noshiro_piko/articles/typescript-type-level-min)で解説しています。

:::details ソースコード
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/src/max.ts

https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/src/min.ts
:::

:::details 使用例（ユニットテスト）
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/test/max.ts

https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/test/min.ts
:::

## `Seq`

```ts
expectType<Seq<3>, readonly [0, 1, 2]>('=');
expectType<Seq<0>, readonly []>('=');
expectType<Seq<5>, readonly [0, 1, 2, 3, 4]>('=');
```

与えられた数値までの連番配列の型を返します。

--- 実装 ---

```ts
type Seq<N extends number> = _SeqImpl<MakeTuple<unknown, N>>;

type _SeqImpl<T extends readonly unknown[]> = {
  readonly [i in keyof T]: i extends `${number}` ? ToNumber<i> : never;
};
```

`MakeTuple` で長さ `N` の配列を作った後、その中身を Mapped Type で差し替えています。

:::details ソースコード
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/src/seq.ts
:::

:::details 使用例（ユニットテスト）
https://github.com/noshiro-pf/mono/blob/develop/packages/utils/ts-type-utils-no-stdlib/test/seq.ts
:::

---

[^1]: union distribution の説明 https://qiita.com/uhyo/items/da21e2b3c10c8a03952f#mapped-type%E3%81%AEunion-distribution
