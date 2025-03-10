---
title: '［型パズル］TypeScript で連番の配列に詳しい型を付ける'
emoji: '🐈'
type: 'tech' # tech: 技術記事 / idea: アイデア
topics: ['typescript', 'type-challenges']
published: true
---

## 目標

以下の返り値型の `rangeArray` 関数を実装すること。

```ts
function rangeArray<S extends number, E extends number>(
  start: S,
  end: E,
  step: number = 1
): /* TODO */;

const result: readonly [1, 2, 3, 4] = rangeArray(1, 5); // ok

console.log(result); // [1, 2, 3, 4]
```

`start` と `end` が（型計算が重くならない）十分小さな非負整数で `step = 1` が満たされる場合には、返り値に `number[]` ではなく `[1, 2, 3, 4]` のようなより詳しい型を付ける、というのが今回やりたいことです。

## 完成品

[TypeScript Playground](https://www.typescriptlang.org/play/?#code/C4TwDgpgBAqglgO2ADigXigSQQEwgDwB4AmAVgDYA+AbgChaAzAVwQGNg4B7BKAJwEMEAcwgBBXgJCEAylALAIuAM6xEKADRQAonPwLlqpMkoAKWlChLg-XsABcUaevNzcDrc4tWIYAPwOARloASgcAJUERABk4KxlNLRp6ZjYObj5IsQl+EBMrG3soBCYAWwAjCF5NRRwHYvLKzW8-OtKK3lCitsqAbQBdOkYWdi4eAWEsyTzrW1aGqtdarvmmhTA59vQoAM769v6oAG8XXghgJl4ecUkAOgZeThKTcZFpgurcVZ9g4LoAX2SwzSCAAVBkJmYvDNCntGi4ahs4VCfIjeFsgp0AOKKSr8YCcXiEWELABunDgOE0LAA1ghOAB3BCUI4uBgEqAmAA2ZygcFRW3ytmoljWUGZAAYoL5eVBCIsoA44GLFsKlQBqDDNYIsiwWEBwCCcnC8ugWAEA2jHCysbhWPgQJRMTnAAIOU78HDcTkgKA9AKaYiaADMmgALH0ti9JjkTP6oKRflAAPRJqCcakuG0IJScbk3TmcITPB1Ol2JlO+uOBqAhqDh2gAq1QLN2lQYYhQfgqAJQAA+UA7-aDpubtuAci25E7KlIfagU-7AHYRy3x6dHc7iG6IB6vT7Y3PBzW56G57P++RggcMFHrjGlNVfpnbbmIPnC8WN8BiOXUz1q7WoaaKQfQNvQSZgqAkC8iUYDciUijWMCUAgkm9BQdAAAq4AQFoACOhCiJoABCzIYCYhCYaY2poMymG6PoOAqKIUrbAqA7avINQqJR1HoHRDHcVAxEuNKQQWA4xCiVAwC8EwEAuA4DD8JySgQIMq66JA7DYdBGCESRpguAA+qcnJ4qMDi6bhBFEcJzJcQYsnyaxABEaCuexrkAIQeSEDhkhS-FQCweAMIgEA4IMGFQBEEwxHEsiOUxhgaNogkGPARhkbAHCqTcxGcLmADyhIuDAeVKAVRWcqVhAVXA+WYEoAByEAkpUMiUJoDVNa17WdYk3XJqmTjpYAdgyACIMgBaDIAMQyANIMgAyDFAkqAIGRgAEvuNIUIKMUDjYALBqABAq5WVdVJWEr1VXNTAO3cF1PWnddt0IIQQ0jY4CR7TNC3LZQaAdhtW0sLtB3HQ5ehCc5CkWNKWj4KwnJMHghBRFoACKPRaH0mioxjl03AAsogXV9JQBwVsD6SANYMgB-2oA6gyAGYMjgQHhUCAOYMgDR6oAEFGAOnegCaDIA0QyABYMgCADIACr6ADnmi2AMbWdOAPIMgBWDJN41syLgC6DONgB7aoA-gnjYA+gyAIEMilQAlwDSNScBgPEzMEUNgwIPwCFKGA-CsNAl06u9YCnMAHCVAAtHAQh0qcLgxdZ+EGfZ6AuBYFFUSYNECclzGsT2kmcRDyixxyvGJ8F9Ep8JafsT+OfSlDOdKSpamDBYMWFbmLWcMAhEZSlZQ1TuTJbBHtmaFD4OMSole6qxymqdDupWThkd2RPalD5DclTzDMkr1XRQDbwddaQS44NzVdUsUXnevoIJHtyoZ-coIOV94QOdETno-KkXr9rw-xEDyvS9ORvY8K4AOnlAL+mgF4QD-ilD+rEYF1G3pvB+88a6QKvuveS5dQGzwIt-dBqD37ALXnArBkBI64IgVAkehDx4oM3ggBBY94EdR3vQCwBAwD7xkjhLA-VmG8S2D0TCEYi49HocwiMQCXLV0nrvdhnCYpPVGPVHKijuCYFgpyeqPUkhh24aohA6i4JaKgAAaTQTAFRvDOoWLQTA6UEDN5mKLiYzBjdOTN1bg-GAmgTGUEoHQ7esj8AcNsFw6CRMXotXMWoYwWwImGM0S1TQ-QdH124fEjRj8x5RKLsSTwupC5ZxSu6T0CBvTbVpAyBA-QXCWLanwlqlC8GYLEZURBPRXLcmEMAAAFq5YRRSVAtUwZhDpXShC9P6ZvDJRikm+nFJoG4SyhGpL3qE8OnAWrdEJElQZUAAAGAASQ4xI-j7LIjnXZw8DnHMQAwSoUAcl7NOfs1iUSmGVH+OhbhuMthNhKXuX0UTECpWQH0Bw2A8BEEaf8aKejcAEEIE865xIVEIvwAkm4kKCAJKRToh2TsXZuywOihJns5HrPhVC3FyKhKoq2Ni-AxUGCYSYHBCAhACb8GpBAVl7LCA0jpIyTQjTVkKPRcyvl3JKJoIBWUn0gqqkpIZRKllbLuS4qorvcVULJXqogLinOhTrlyvKYqxk-R8kWDMRgHlIBOAMFAbUhlSgABicB8CRSiIoCZPTTb8IIRgwBpi0F2odU64NTi9lHJOdss5mD8aYU2dswgviAnMPTW0xhyx2jar0W6j1XqfW9P9caoSpqFUIEqRa0mMcx7EjQaMzpxa+kSKgBA9iUMvm0HYRAHSOFCCMsIKQYakp+w9n7EeIMJ5TDuVck+WgMUuU8qlRyzCIq0H0owMu3l+rMU7tXZqzQMaWpnPxY7B0RLoAHr3Roz2MUAAiQc4DjgwGOtik65zTv7Kefs555xzkXHOVA-YACceboKYX4I1GVRcrC8EQEIe+aCY1PqEC+v4tyED3LRDAM5rEYDsVaSw3R0F3W8DiGWgw8HEPIaLjGu5Dy8PHKgzBqi+HpSEY+SRtJ0E0MvukLJLYqHn3ADORBrCjUOVGtlTuUpZqq1CuqdjHOtKDD8fHP2DTgm0T9lcgEcUnlx3imdRgHoOdLUWaWTcIRVrfTWfXVABzKmx49Ac4s5ZHmbMud1G5zzTn-PuYC95uzfmbNecc0FqLyyfMWDC5FwLiXwvBYSyFqzSXUuZYi9llLsX7MZZy9F5LRXMt5fi4VgrKWKvFYy2Vkr1WstVaa-V3LLg+g9BagMVhayD7pO5bu9lhqx7rtU2gmjwg7MAA1ZO7nlRUpT15fSgQsDlcbQg0HDODcRzeamUquVcpgybm9yNxEaWgxjuGE1oO07JTBN7BuZMc6xxJw14tScIII7GsBhoOfe5NzQBnKCk0zbwEH3be39sgJy-rq7CALPjK9+HSPNBI9JiYOdC6YrSBZkizd2ycrY7wjSzQ93pXmoQCKvxcLoKE6G48vHKwXBUeKXJwF5Oak5SbHFpUIKw2OqEYqFDxyXkEdOkmrZ8xCBwGZNxkcfxBgQ+ANZGQOOR3JPh1WYMYY0cY+p9AU25tLZZPp7k7Z+TmcqArfNpVoEcoG4tmATF9vLbE9AZoK3KT7YXudq7fXsQzYO7JU2ClvXoLO8d5k0bpvGfDZm-Jyt1blN2bCHHtnimbf5Lo3sj3y3dTSkwpvMIPQADk4zenF4GdczbeeI0gPD6757vFkkAAk5NN+C2EUmEmoCt49LB7PrO5vs6+w+rYxGs8msH+U8zY8LtQH+znazxZZsKcT-0YIbXDubwfd3xvJ8B8r4Twt2tGB9+T8P0tzBOfN5n-LVPn0PRydebn53zBYQb-g+CX2pXA7w8kGSZrjWGGMBKTMkoBCAbOh5E+EAA)

## 解説

以降は実装の解説です。

### 関数本体の実装

型は後で付けるとして本体をまず実装します。

実装方法は色々あり得ますが、以下のような実装をしておきます。

```ts
function rangeArray(start: number, end: number, step: number = 1): number[] {
  return Array.from(range(start, end, step));
}

function* range(
  start: number,
  end: number,
  step: number = 1,
): Generator<number, void, unknown> {
  for (let i: number = start; step > 0 ? i < end : i > end; i += step) {
    yield i;
  }
}
```

ちなみに今回は必要有りませんが、この `range` という generator 関数は以下の使い方も想定しています。

```ts
for (const i of range(1, 5)) {
  console.log(i);
}
// 1
// 2
// 3
// 4
```

### 型の実装

結果配列が大きすぎる場合、型計算が重くなったりそもそも再帰制限にひっかかって計算できなかったりするので、 `start` と `end` が十分小さい場合のみ型を詳細化することにします。以下のように関数をオーバーロードして、引数の型に応じて return type を詳細化した型 `RangeList<S, E>` にするか `number[]` にするかが決まるようにします。

```ts
type Uint8 = Index<256>; // 0 | 1 | 2 | ... | 255

function rangeArray<S extends Uint8, E extends Uint8>(
  start: S,
  end: E,
  step?: 1,
): RangeList<S, E>;

function rangeArray(start: number, end: number, step?: number): number[];
```

`Uint8` 型はべた書きでも良いかもしれませんが、 `Index` という型ユーティリティを実装すれば `Index<256>` として実装できます。詳しくは[TypeScript 型ユーティリティ集](https://zenn.dev/noshiro_piko/articles/typescript-type-utilities)を参照してください。

`start: S` や `end: E` には 1 個の非負整数ではなく `Uint8` の部分型の union 型（例： `1 | 2 | 3`）が渡される可能性もありますが、その場合には `S` の最小値から `E` の最大値までの整数の union を要素とする長さ不定の配列型を返り値とするという要件もここで追加しておきます[^union-arg]。

```ts
const s = 2 as 1 | 2 | 3;
const e = 6 as 5 | 6 | 7;
const result2: readonly (1 | 2 | 3 | 4 | 5 | 6)[] = rangeArray(s, e);
console.log(result2); // [2, 3, 4, 5]
```

[^union-arg]: 一応 `S = 1 | 2`, `E = 3 | 4` なら `[1, 2] | [1, 2, 3] | [2] | [2, 3]` という感じで全パターンの union 型を返すように定義できる可能性はありますが、 $|S| \times |E|$ のサイズの union になり型計算が重くなる上に結果の型も見づらくあまり嬉しくなさそうなので、これは実装しないことにします。

これは以下のように引数にユーザー定義の数値の union 型の変数を渡す場合にも対応するためです。

```ts
type MonthEnum = Exclude<Index<13>, 0>; // 1 | 2 | ... | 12
type DateEnum = Exclude<Index<32>, 0>; // 1 | 2 | ... | 31

const getAllDatesOfMonth = (year: number, month: MonthEnum): DateEnum[] =>
  rangeArray(
    1,
    (getLastDateNumberOfMonth(year, month) + 1) as 29 | 30 | 31 | 32,
  ) satisfies DateEnum[];

const getLastDateNumberOfMonth = (
  year: number,
  month: MonthEnum,
): 28 | 29 | 30 | 31 => new Date(year, month, 0).getDate() as 28 | 29 | 30 | 31;

console.log(getAllDatesOfMonth(2024, 2));
// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]
```

次節以降で `RangeList<S, E>` 型を実装していきます。

#### `RangeList<S, E>`

`RangeList<S, E>` の本体は以下の実装になります。

```ts
type RangeList<S extends Uint8, E extends Uint8> =
  // S, E のいずれかが 2 要素以上の union の場合
  BoolOr<IsUnion<S>, IsUnion<E>> extends true
    ? Exclude<LT[E], LT[Min<S>]>[] // union に対して Seq で型計算すると、結果が正しくならないので、その回避のため
    : ListSkip<S, Seq<E>>;
```

ユニットテスト

```ts
expectType<RangeList<1, 5>, readonly [1, 2, 3, 4]>('=');
expectType<RangeList<1, 2>, readonly [1]>('=');
expectType<RangeList<1, 1>, readonly []>('=');
expectType<RangeList<1, 1 | 3>, readonly (1 | 2)[]>('=');
expectType<RangeList<1 | 3, 3 | 5>, readonly (1 | 2 | 3 | 4)[]>('=');
expectType<RangeList<1 | 2 | 3, 5 | 6 | 7>, readonly (1 | 2 | 3 | 4 | 5 | 6)[]>(
  '=',
);
expectType<RangeList<5, 1>, readonly []>('=');
```

`expectType` はここでは `expect<A, B>("=")` が `A` と `B` は等しい型であることを確認する型レベルの assert 文を表しています。型ユニットテスト用ユーティリティ `expectType` の詳細については[TypeScript 型ユーティリティ集](https://zenn.dev/noshiro_piko/articles/typescript-type-utilities)を参照してください。

`ListSkip<S, Seq<E>>` の部分は `S` と `E` がちょうど 1 要素の非負整数（0 以上 255 以下）の場合の型です。

`ListSkip<N, T>` はタプル型 `T` の先頭 `N` 要素を除いた型を返す型です（例：`ListSkip<2, [1, 2, 3, 4, 5]>` = `[3, 4, 5]`）。
`Seq<N>` は整数 `N` までの連番配列を返す型です（例： `Seq<5>` = `[0, 1, 2, 3, 4]`。
これらを組み合わせると `ListSkip<S, Seq<E>>` とすることで `S` 以上 `E` 未満の整数の連番配列を作ることができます（例： `RangeList<1, 5> = [1, 2, 3, 4]`）。よって、 `ListSkip` と `Seq` を作ることができればここは解決します。

次に `S` または `E` が union 型の場合の判定ですが、これは `BoolOr` と `IsUnion` という型ユーティリティを実装することで実現できます。実装は [TypeScript 型ユーティリティ集](https://zenn.dev/noshiro_piko/articles/typescript-type-utilities)を参照してください。
そしてそのときの型は、 union 型 `S` の中の最小値 `L` から union 型 `E` の中の最大値 - 1 = `U` までの union 型を要素とする配列 `(L | (L + 1) | ... | (U - 1) | U)[]` とします。これは後述の `LT` という配列を作ることで `Exclude<LT[E], LT[Min<S>]>[]` として実装することができます。
`LT[U]` は `U` の最大値未満のすべての非負整数を含む union 型を返すようにします（例： `LT[4 | 5 | 6] = 0 | 1 | 2 | 3 | 4 | 5`）。 `Min` は非負整数の union 型 `U` を受け取り、最小値を返す型です（例： `Min<3 | 4 | 5> = 3`）。`Min` の実装については[TypeScript の型ユーティリティ Min, Max の実装](https://zenn.dev/noshiro_piko/articles/typescript-type-level-min)という記事で解説しているのでそちらを参照してください。あとは `LT` を実装できれば OK です。

---

#### `ListSkip` の実装

以下の実装になります。

<!-- prettier-ignore -->
```ts
type ListSkip<N extends number, T extends readonly unknown[]> =
  ListSkipImpl<N, T, []>;

type ListSkipImpl<
  N extends number,
  T extends readonly unknown[],
  R extends readonly unknown[],
> = T extends readonly []
  ? T
  : R['length'] extends N
    ? T
    : ListSkipImpl<N, Tail<T>, [Head<T>, ...R]>;
```

`Head<T>` は `T` の先頭要素を取り出す型です。これは `infer` を使って以下で実装できます。

```ts
type Head<T extends readonly unknown[], D = never> = T extends readonly [
  infer X,
  ...(readonly unknown[]),
]
  ? X
  : D;
```

`Tail<T>` は `T` の先頭要素を除いた残りの配列を返す型です。以下で実装できます。

```ts
type Tail<A extends readonly unknown[]> = A extends readonly []
  ? readonly []
  : A extends readonly [unknown, ...infer R]
    ? R
    : A;
```

`ListSkipImpl<N, T, R>` は、`T` を先頭要素 `H` と残りに分け、 `T` = `Tail<T>`, `R` = `[Head<T>, ...R]` と更新して再帰呼び出しし、 `R` の長さが `N` に到達した時点で `R['length'] extends N` という条件が満たされるので `T` が返される、という動作になっています。

```
ListSkip<2, [1, 2, 3, 4, 5]>
-> ListSkipImpl<2, [1, 2, 3, 4, 5], []>
-> ListSkipImpl<2, [2, 3, 4, 5], [1]>
-> ListSkipImpl<2, [3, 4, 5], [2, 1]>
-> [3, 4, 5]
```

#### `Seq` の実装

```ts
type Seq<N extends number> = SeqImpl<N, MakeTuple<unknown, N>>;

type SeqImpl<N extends number, T extends readonly unknown[]> = {
  [i in keyof T]: i extends `${number}` ? ToNumber<i> : never;
};

type ToNumber<S extends `${number}`> = S extends `${infer N extends number}`
  ? N
  : never;
```

`MakeTuple<E, N>` は`N` 要素の `E` からなるタプルを返す型で、[TypeScript 型ユーティリティ集](https://zenn.dev/noshiro_piko/articles/typescript-type-utilities)で実装方法を解説しています。
`Seq` は、長さ `N` の適当な配列を作り、 `keyof` でその key を取り出すことで連番配列を作っています。このとき `keyof` の結果は文字列リテラル型になってしまうのでこれを数値型にするために `ToNumber` を使っています。

#### `LT` の実装

```ts
type LT = {
  [N in Uint8]: Index<N>;
};
// {
//   0: never;
//   1: 0;
//   2: 0 | 1;
//   3: 0 | 1 | 2;
//   4: 0 | 1 | 2 | 3;
//   5: 0 | 1 | 2 | 3 | 4;
//   6: 0 | 1 | 2 | 3 | 4 | 5;
//   ...
// }
```

で実装できます。

`Index` の実装は[TypeScript 型ユーティリティ集](https://zenn.dev/noshiro_piko/articles/typescript-type-utilities)を参照してください。
