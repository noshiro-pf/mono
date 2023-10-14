---
title: 'TypeScript の型ユーティリティ Min, Max の実装'
emoji: '🐈'
type: 'tech' # tech: 技術記事 / idea: アイデア
topics: ['typescript']
published: true
---

## 目標

以下のような機能の型を実装すること。

```ts
// N は非負整数
type Min<N extends number> = /* TODO */;
type Max<N extends number> = /* TODO */;

type R1 = Max<1 | 2 | 3>; // 3
type R2 = Min<1 | 2 | 3>; // 1
```

## Min の実装

`Min<N>` は以下のコードで実装できます。

```ts
type _MinImpl<
  N extends number,
  T extends readonly unknown[],
> = T['length'] extends N ? T['length'] : _MinImpl<N, [0, ...T]>;

export type Min<N extends number> = _MinImpl<N, []>;
```

（簡単な解説）

TypeScript の型レベルプログラミングで非負整数に関する処理をしたいときに、タプル型を操作して `"length"` プロパティを取り出すという方法がありますが、この実装でもそれを用いています。
長さ 0 のタプル `[]` から始めて一つずつ要素を追加していき、その長さが `Min` の入力である `N` に含まれる値のいずれかに一致したら、それが最小の整数になっている、という仕組みです。

```
Min<1 | 2 | 3>
-> _MinImpl<1 | 2 | 3, []>
-> _MinImpl<1 | 2 | 3, [0]> // T["length"] (= 0) extends 1 | 2 | 3 は false なので再帰
-> 1                        // T["length"] (= 1) extends 1 | 2 | 3 は true なので [0]["length"] = 1 を返す
```

## Max の実装

`Max<N>` は以下のコードで実装できます。

<!-- prettier-ignore -->
```ts
type _MaxImpl<N extends number, T extends readonly unknown[]>
  = [N] extends [Partial<T>["length"]]
      ? T["length"]
      : _MaxImpl<N, [0, ...T]>;

export type Max<N extends number> = _MaxImpl<N, []>;
```

https://www.typescriptlang.org/play?#code/FAFwngDgpgBA+gWQIYA8CSBbCAbAPAORihRCgDsATAZxjIFcMAjKAJwBoYAVIk86mFlCQUA9mWxgYdMgGsyIgO5kA2gF0YAXhhqAfJu351xUpRrKACkhYgAlkjycdygETZyAcxAALZ6vUB+Lhc3Mk8fdQAueGR0LDx8DmUABg4AOnTOVR1gYGIIEWsYcGgYGIIeE356JlY9LURUTBwCHQBuHOLYACUoKjpsEH1lYBhS1FwknTYRsZQJmAAfGABGRZgAJimZsvW1gBY1gDYt0eSOFJgLpNVgj29fadHLazs8M8vz86zb0PvVYH+wCAA

これはこちらの質問スレッドで回答されていたものとほぼ同等のものです。

https://stackoverflow.com/questions/62968955/how-to-implement-a-type-level-max-function-over-a-union-of-literals-in-typescri

（簡単な解説）

```ts
type Index = [0, 0, 0, 0]['length'];
```

は `4` になりますが、この tuple 部分に `Partial` を適用し

```ts
type Index = Partial<[0, 0, 0, 0]>['length'];
```

とすると `0 | 1 | 2 | 3 | 4` という型が得られます（このテクニックを私はこれを見て初めて知りました。）。

このテクニックを用いて、空配列 `[]` から始めて再帰するごとに一つずつ要素を追加していき、 その index が `N` を含む union 型になったら再帰を終了し、そのときの tuple の長さを返せば `N` のうち最大のものの数値になっている、という仕組みです。

```
Max<1 | 2 | 3>
-> _MaxImpl<1 | 2 | 3, []>
-> _MaxImpl<1 | 2 | 3, [0]>        // [1 | 2 | 3] extends [Partial<[]>["length"]] (= [0]) は false なので再帰
-> _MaxImpl<1 | 2 | 3, [0, 0]>     // [1 | 2 | 3] extends [Partial<[0]>["length"]] (= [0 | 1]) は false なので再帰
-> _MaxImpl<1 | 2 | 3, [0, 0, 0]>  // [1 | 2 | 3] extends [Partial<[0, 0]>["length"]] (= [0 | 1 | 2]) は false なので再帰
-> 3                               // [1 | 2 | 3] extends [Partial<[0, 0, 0]>["length"]] (= [0 | 1 | 2 | 3]) は true なので [0, 0, 0]["length"] を返す
```

補足ですが、 `[N] extends [Partial<T>["length"]]` のところは "union distribution" という挙動を回避するために TypeScript の型レベルプログラミングでたびたび用いられるテクニックが使われています。
`extends` の両辺を配列にくるまず `N extends Partial<T>["length"]` としてしまうと、 `N` （例では `1 | 2 | 3`）が分配されてそれぞれ評価されてしまいます。 `[N]` や `N[]` とすることでこの挙動を回避して union 型 `N` の全体と `Partial<T>["length"]` を直接比較することができます。
逆に union 型の各要素についてループ処理を書きたいときには `N extends N ? ... : never` のようにして union distribution を使うこともあります。

ちなみに、先ほど載せたリンクの [StackOverflow の記事](https://stackoverflow.com/questions/62968955/how-to-implement-a-type-level-max-function-over-a-union-of-literals-in-typescri)では同じ投稿者が再帰上限にひっかからないための実装の改良も載せていますが、元実装

```ts
type _MaxImpl<N extends number, T extends any[]> = {
  b: T['length'];
  r: _MaxImpl<N, [0, ...T]>;
}[[N] extends [Partial<T>['length']] ? 'b' : 'r'];

export type Max<N extends number> = _MaxImpl<N, []>;

type Result = Max<1 | 2 | 512>;
// Type instantiation is excessively deep and possibly infinite. ts(2589)
```

を冒頭の

<!-- prettier-ignore -->
```ts
type _MaxImpl<N extends number, T extends readonly unknown[]>
  = [N] extends [Partial<T>["length"]]
      ? T["length"]
      : _MaxImpl<N, [0, ...T]>;

export type Max<N extends number> = _MaxImpl<N, []>;

type Result1 = Max<1 | 2 | 512>; // ok
type Result2 = Max<1 | 2 | 1024>; // Type instantiation is excessively deep and possibly infinite. ts(2589)
```

という実装に変えることでその改良実装の上限程度には改善できました。
