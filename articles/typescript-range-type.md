---
title: "TypeScript で連番の配列に詳しい型を付ける"
emoji: "🐈"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["typescript"]
published: false
---

## 目標

以下の返り値型の `rangeArray` 関数を実装すること。

```ts
function rangeArray<S extends number, E extends number>(
  start: S,
  end: E,
  step: number = 1
): /* TODO */;

const result: readonly [1, 2, 3, 4] = range(1, 5); // ok

console.log(result); // [1, 2, 3, 4]
```

`start` と `end` が（型計算が重くならない）十分小さな非負整数で `start <= end` かつ `step = 1` が満たされる場合には、返り値に `number[]` ではなく `[1, 2, 3, 4]` というより詳しい型を付ける、というのが今回やりたいことです。

## 関数本体の実装

型は後で付けるとして本体をまず実装します。

実装方法は色々ありますが、以下のような実装をしておきます。

```ts
function rangeArray(
  start: number,
  end: number,
  step: number = 1
): readonly number[] {
  return Array.from(range(start, end, step)); // [...range(start, end, step)] でも ok
}

function* range(
  start: number,
  end: number,
  step: number = 1
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

## 型の実装

`step = 1` （または省略されたとき）で `start` と `end` が型計算が再帰制限にひっかからない＆重くならない程度に十分小さい場合のみ型を詳細化したいので、以下のように関数をオーバーロードして、引数の型に応じて詳細化した型 `RangeList<S, E>` と条件を満たさない場合の緩い型 `readonly number[]` を出し分けるようにします。

```ts
type Uint8 = Index<256>; // 0 | 1 | 2 | ... | 255

function rangeArray<S extends Uint8, E extends Uint8>(
  start: S,
  end: E,
  step?: 1
): RangeList<S, E>;

function rangeArray(
  start: number,
  end: number,
  step?: Uint8
): readonly number[];

function rangeArray(
  start: number,
  end: number,
  step?: Uint8 = 1
): readonly number[] {
  return Array.from(range(start, end, step));
```

`Index` 型ユーティリティも今回実装しますが、これに関してはべた書きでも良いかもしれません。

なお、 `start: S` と `end: E` には 1 個の非負整数ではなく union 型が渡される可能性もありますが、その場合には結果と厳密一致する型を生成しづらい（※）ため、その場合には `S` の最小値から `E` の最大値までの整数の union を要素とする長さ不定の配列型を返り値とするという要件もここで追加しておきます（※：一応 `S = 1 | 2`, `E = 3 | 4` に対して `[1, 2] | [1, 2, 3] | [2] | [2, 3]` という感じで全パターンの union 型を返すように定義できる可能性はありますが、 $|S| \times |E|$ のサイズの union になり型計算が重くなる上に見づらくなりあまり嬉しくもないのでこれは避けます。）。

```ts
const s = 2 as 1 | 2 | 3;
const e = 6 as 5 | 6 | 7;
const result2: readonly (1 | 2 | 3 | 4 | 5 | 6)[] = rangeArray(s, e);
console.log(result2); // [2, 3, 4, 5]
```

これは以下のように引数にユーザー定義の数値の union 型の変数を渡す場合に、`rangeArray` の結果の型を不必要に広げないためです。

```ts
type MonthEnum = Exclude<Index<13>, 0>;
type DateEnum = Exclude<Index<32>, 0>;

const getLastDateNumberOfMonth = (
  year: number,
  month: MonthEnum
): 28 | 29 | 30 | 31 => new Date(year, month, 0).getDate() as 28 | 29 | 30 | 31;

const getAllDatesOfMonth = (
  year: number,
  month: MonthEnum
): readonly DateEnum[] =>
  rangeArray(
    1,
    (getLastDateNumberOfMonth(year, month) + 1) as 29 | 30 | 31 | 32
  ).map(
    (date: DateEnum) => new Date(year, month - 1, date).getDate() as DateEnum
  );

console.log(getAllDatesOfMonth(2024, 2));
// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]
```

次節以降で `RangeList<S, E>` 型を実装していきます。

## `RangeList<S, E>` の本体

`RangeList<S, E>` の本体は以下のような実装になります。

```ts
type RangeList<S extends Uint8, E extends Uint8> = BoolOr<
  BoolOr<IsNever<S>, IsNever<E>>, // S, E のいずれかが 0 要素の union の場合
  BoolOr<IsUnion<S>, IsUnion<E>> // S, E のいずれかが >=2 要素の union の場合
> extends true
  ? readonly Exclude<LEQ[E], LEQ[Min<S>]>[] // union に対して Seq で型計算すると、結果が正しくないので、その回避のため
  : Skip<S, Seq<E>>;
```

- `Skip<S, Seq<E>>` の部分は `S` と `E` がちょうど 1 要素の非負整数（0 以上 255 以下）の場合に対応しています
  - 例： `RangeList<1, 5> = readonly [1, 2, 3, 4]`
- `readonly Exclude<LEQ[E], LEQ[Min<S>]>[]` の部分はそれ以外の場合に対応しています。
  - 例： `RangeList<1 | 2 | 3, 5 | 6 | 7> = readonly (1 | 2 | 3 | 4 | 5 | 6)[]`
- `IsNever<U>` は `U` が 0 要素の union （ = `never`）であるとき `true`、そうでなければ `false` に評価される型を返します。
- `IsUnion<U>` は `U` が 2 要素以上の union 型であるとき `true`、そうでなければ `false` に評価される型を返します。
  - 例： `IsUnion<1 | 2> = true`, `IsUnion<1> = false`,
- `LEQ[U]` は `U` の最大値未満のすべての非負整数を含む union 型を返します。
  - 例： `LEQ[4 | 5 | 6] = 0 | 1 | 2 | 3 | 4 | 5`
- `Min<U>` は `U` の最小の非負整数を返します。
  - 例： `Min<3 | 4 | 5> = 3`
- これらを組み合わせた `Exclude<LEQ[E], LEQ[Min<S>]>` という部分は、 `S = 1 | 2 | 3`, `E = 5 | 6 | 7` に対して `1 | 2 | 3 | 4 | 5 | 6` となる型です。
- `Seq<N>` は `N` までの非負整数の連番のタプル型を返します。
  - 例： `Seq<3> = readonly [0, 1, 2]`
- `Skip<N, T>` はタプル型 `T` の先頭の `N` 要素を除いた型を返します。
  - 例： `Skip<2, [1, 2, 3]> = [3]`

以上のような型をそれぞれ実装できれば所望の型 `RangeList<S, E>` が実装できることが確認できると思います。
使っている型 `BoolOr`, `IsNever`, `IsUnion`, `LEQ`, `Min`, `Skip`, `Seq` という型の実装を次節以降それぞれ説明していきます。

## `Min<U>`, `BoolOr<A, B>`, `IsNever<U>`, `IsUnion<U>` の実装

`Min<U>` の実装はこの記事で紹介しています。
https://zenn.dev/noshiro_piko/articles/typescript-type-level-min

`BoolOr` は型の論理和を取る関数で、[ここ](https://zenn.dev/link/comments/0c6cc10b5889f2)に実装を載せています。

`IsNever` は型が `never` かどうか判定する関数で、[ここ](https://zenn.dev/link/comments/914c745a18d71c)に実装を載せています。

`IsUnion` は型が union 型かどうか判定する関数で、[ここ](https://zenn.dev/link/comments/d108fe1394e4f4)に実装を載せています。

## `LEQ` の実装

## `Skip` の実装

## `Seq` の実装

---

## 完成品

[TypeScript Playground](https://www.typescriptlang.org/play?#code/C4TwDgpgBAqglgO2ADigXigSQQEwgDwB4AmAVgDYA+AbgChaAzAVwQGNg4B7BKAJwEMEAcwgBBXgJCEAylALAIuAM6xEKADRQAonPwLlqpMkoAKWlChLg-XsABcUaevNzcDrc4tWIYAPwOARloASgcAJUERABk4KxlNLRp6ZjYObj5IsQl+EDMva1sHBCYAWwAjCF5PVxwi0oqql28-OvLKkIdeCH4cbgAbEChitt4AbQBdOkYWdi4eAWEsyTzLAvsh+srqxVqNkerm1ob0KCDQvm7ehAG9homoAG8XLuAmXh5xSQA6Bl5OEpMCxEJisNmAmh2mmawWCdAAvskZmkEAAqDKLFagwq3LYuHZHXH5HwE3gnM4OADiikq-GAnF4hGGDU0ADdOHAcJoWABrBCcADuCEojxcDHpUBMfQgwCgcBJJyxwGoqx8UGFAAYoL5ZVBCDUoA44GqasqjQBqDDQkUWCwgOAQPo4WV0CwIhG0VjcKwXJRMPrAAKdS79QajAKaYiaADMmgALOMTkCljkTOGoKRYVAAPRZqCcbker2cKVfPqcISAiC+-0BTM5qBhiPRuPjeiehDelQYYhQfgqAJQAA+UB7w6jdHb3ugGHIvZUpCHUFnw4A7BOvTKutXgMQgz0QxKB8PR1Ao4vY4uF8PyMF7hgk58U0oIbDCx3ixBS+XK9viHXc6MkannGmikK29BZmioCQLKJRgFKJSKNYyJQCiWb0NB0ARIsMRxLI8g7Co8BGAkuj6DgRFqMYJwAEKcMWADyDIuHRjEMpgSgAHIQCylQyJQmgcdxvEMokAnZrmTjaFAgB2DIAIgyAFoMgAxDIA0gyADIMUCaoAgZGAAS+MlQCwcyyYALBqABAqLH0X0TGEBxMAIHM-GCUodkOWJFj1lJOjycp6lqmgPa6fphnpDJZm0MKBEGMAvBMBALjal0+7XIMWj4KwfRMHghBRFoACKoxaOMmg5flACyiD8eMlD3PWwU8IA1gyAH-agDqDIAZgyOBAACOUCAOYMgDR6oAEFGAOnegCaDIA0QyABYMgCADIACr6ADnmamAMbWzWAPIMgBWDHJMk9VNgC6DDJgB7aoA-gkyYA+gyAIEMLgONI3JwGA8QdZ1hBiVMtCYVArFWQyohkYRUBlJZ3QIJoNE-QY-0foIwoYKMogJpFFENgw-B9EoECthY2qjDRcN6L9oxIyjaPxVABOo5dUDRbF5OUxAUxvUJPF8QAKlDDZMzj5EqKMCCM7wCbajTBok8jqN0+A0C2fZ3CEDArMAPqS3MmBwX0MtJLQkFogAAmolQIMjqHoW9CvOVLCDK-BMuaAA0qDCMwCcssnKMMAc3jPMiejWrC4T5O2-DKg8nygrEwzIlPWlGVZTANuUBFuNRTFcUYz7ZMWA4NPkx7lRizB5UIIQnF25RRjy-nFuq5xmgTOrxvlyrhAuEXAc4o0FhM8XFxJTcQcCggEzhScYd8Zx8ecxTSfE9nvDk0zowAORSsIwAABbz27BiccTc+L4oQir+v5Ny-XltVw26qaF8V-s7X4tQCVJxPBYiVXDcoxF4ghgoOMDjYHgRCj3hLnCWuACCF07kySorM-4EAYgwJmTB4IQEIKVfg3IIAIKQYQXugpNCj1vjBGB+A4GYKlIQDuLcX4Hhwf3KqJwFagOIfAxBUoK7kPVprKAOskB6wNmhV6d8GH-xISwiAbCXAUITgjKhyUDIIF5H3CY1RbYYHQSATgDAoBM0HhgDiAAxOA+AIA4CiHvVeuFgDsM7pnFO-spEqDURorRxM7HjwAAYABIHiQN4HCNx29OCcU2Aya2lAs683CSJLOwTgFYCUAYoxJizErwseQzuMie7yODrQqGLgfGdx3kvfea9+ap2gBnJOsSmaBOCTITunjvHBL8azfC9ioANMQAwSoUBm5tJ8X44mW905DF5rE1B6DSHIKZngiBwSy5oIwaI7ACh3giy+OMxZSDxHt2qA0ziAyOEom1rrVZfRDa0H1ohJQYB+CsGgMfBZkzlm8JRtaCmd8AAicAhBwBlBgTUw4jwjkXGeYcF5hxXiXIuFci5UDDgAJxTAsG9Jm-A4Cq0kePKwvBEBCFZpi36DSvk-OAHCLxnTukwD8d7B2RRRn0GRXfAxvA4gEoMNi3F+L6nkoQF00kVKvGovRew6l2paUjJEki95MFiW-OkNFE4RLvm-L8VKlF6LkEuHbuk4MsiaFKK1T0zusqZTDhNfK0kw554BHVPPRcNqXCs1GIajJoYiout1W-K+Xx2bVGfp60M3rplQCDe6m0XdX6BuvpfaNIbr5hptK6hsQaY0+tTcG0NfqI0HlGCmuNab80ZtjZmj13co0FrzZW4t1afUJv9WW5NNai0Vqbem9Ndbs2yNza2wtbbe39qrbWrNSbu0trHc2idfbB0To7SO6dU6e3zoHU2r24x36TAZboMA9IZRvQ2U8huhrpmGt6Vi6KuKs0AA0dUNv1QmaGXtWYcuEJ3IZNptTT0NQ4U9v157z0NdqS9X6oDMriKPTuFL+UAdgMa5VwALXQf3UshuwahWV3EnO6+GrCCjF9bAcSQbsOXs0DaygVVgOfvDXSyVtB3RvWkF1cBLcfHywY51NhgCIJHK4Sc-WZz+HGzY9so1zHgnVDZdIgNciFGCjvFAJDWCaF4LCazJ+iapOjCNJ-Rxmj2aGm5Y0kYoqtE1JGIQOAwpqM5xcHCKYnDuErL4+cwTN0wDCZ-QYHx4mb2Ruk9kg1Fgwg+eoVkxRrZVMuHVA4JmLpTgODltdW6HHNBofYZoEdAAJS4aX81hCqvCXDwWu2lM1OEBeRSD4bwRkXbUpXTgboETBRLd0PMIy81oormSZM5Poc19z4nqgjvC7ErLPQ0mUKk3ezQHyTjTy5RNhtzqLCQagMRlw3rKy3tC7J8YwRaBe0A+TD5VS0Wq2+gt3zd7WbnbaUN4md3hk3fHiOpT+aVt5eJmEANhAwhhOGV9sthBRBJCAA)
