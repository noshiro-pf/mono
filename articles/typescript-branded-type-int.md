---
title: 'TypeScript の Type Branding をより便利に活用する方法のまとめ'
emoji: '🐈'
type: 'tech'
topics: ['typescript', 'brand', 'branding']
published: true
---

## 更新履歴

- （2025/01/11） 「Branded Type を使用したときの弊害」を追記
- （2025/01/20）コード例の一部で tag 部分に `never` 型を用いていたのを `unknown` 型に修正
  - 参考： [誤解されがちなnever型の危険性: 「存在しない」について](https://qiita.com/uhyo/items/97941f855b2df0a99c60?utm_campaign=post_article&utm_medium=twitter&utm_source=twitter_share)

## 概要

TypeScript で用いられることのある Type branding というハックと既存のいくつかのライブラリでのその実装例を説明し、次に、より安全かつ便利に Type branding を使うためのユーティリティの実装や ESLint 設定も紹介します。
最後に Type branding の活用例として、数値型を `number` より細かく使い分けられるように Branded Type を定義する実装例を載せています。 Branded Type のよくある実装に、筆者が最近思いついたちょっとした工夫を入れることで数値型の Branded Type を上手く実装できたので紹介してみました。

## Type branding とは

Structural Typing を採用している TypeScript では、例えば複数の異なる ID 文字列の型 （`UserId`, `ProjectId`, ... ）を区別したいというような状況で、以下のように type alias を作っても、単なる string と同等に扱われてしまい区別できません。

```ts
type UserId = string;
type ProjectId = string;
type Project = { id: ProjectId; name: string };

declare function findProject(id: ProjectId): Promise<Project>;

const userId: UserId = 'user-1';

// userId を使って findProject を呼んでいるがエラーにならない
findProject(userId);
```

しかしこのような問題を解決するための手段として **Type branding** というハックが知られています。

Type branding を用いると、以下のようにしてそれぞれの id 型を区別させることができます。

```ts
type UserId = string & { UserId: unknown };
type ProjectId = string & { ProjectId: unknown };
type Project = { id: ProjectId; name: string };

declare function findProject(id: ProjectId): Promise<Project>;

const userId: UserId = 'user-1' as UserId;

// Argument of type 'UserId' is not assignable to parameter of type 'ProjectId'.
findProject(userId);

userId.slice(); // userId は通常の string でもある
```

Type branding とは、対象となる型（この例では `string`）に `{ tagName: unknown }` という実際の値とは無関係のダミーのオブジェクト型を交差型として付け加えることで、構造上の互換性を破るテクニックです。こうすることで作られた型（Branded Type） `userId` はただの string 型とは異なる型になり、この例における `findProject` を呼び出してしまうようなミスを防ぐことができるようになります。

## Branded Type の様々な実装

ちなみに Branded Type の具体的な実装はライブラリによっても結構まちまちのようです（2024/12/31 追記： io-ts の方の型定義のコードが間違っていたので修正しました）。

[io-ts](https://github.com/gcanti/io-ts/blob/master/index.md#branded-types--refinements)[^io-ts]

[^io-ts]: io-tsでは、`Brand` という型により unique symbol をキーに持つオブジェクト型にネストさせることで、カスタム実装した型定義や他のライブラリ製の branded type との衝突を防ぐ仕組みになっています。本記事の Branded Type 定義では分かりやすさのためこのような実装はせずに説明しました。

```ts
declare const _brand: unique symbol;

interface Brand<B> {
  readonly [_brand]: B;
}

type Int = number & Brand<{ readonly Int: unique symbol }>;
```

[ts-brand](https://github.com/kourge/ts-brand)

```ts
type Int = number & { __type__: 'Int' } & { __witness__: number };
```

どちらの方法も型を区別するという要件は満たせますが、 tag object の key 部に型 ID を置く前者のやり方の方が、以下のように `&` で意味のある交差型を作ることができる点で便利そうです（後者の方法では `never` に潰れてしまいます）。

```ts
type Int = number & { Int: unique symbol };
type Positive = number & { Positive: unique symbol };
type PositiveInt = Positive & Int; // number & { Positive: unique symbol } & { Int: unique symbol }
```

また、後者の tag の value 部に型 ID を書く方法は、 `__type__` などのタグ名を予約するというルールが増えてしまうのも少し気になります。

今回は前者の key 部に型 ID を書く方法が都合が良いので以降はこちらを採用します。

## より安全に Branded Type を使う方法（型ガード関数の定義、ESLint 設定）

Branded Type で変数に型注釈を付けるときには一つ不安要素があります。それは `as` によるキャストが嘘である可能性があることです。

```ts
type Int = number & { Int: unknown };

const r: Int = 0.1 as Int; // 嘘！！！

function numberToString(n: number, radix?: Int): string {
  return n.toString(radix);
}

numberToString(12345, r);
```

これを多少改善するために、 Branded Type 定義と共にガード関数と生成関数をセットで用意する方法が考えられます。 `as` を使ったキャストは unsafe ですが、以下のようにすると型名に合う値であることを保証しやすくなります。

```ts
// types/int.ts

type Int = number & { Int: unknown };

function isInt(a: number): a is Int {
  return Number.isInteger(a);
}

function toInt(a: number): Int {
  if (!isInt(a)) {
    throw new Error(`a non-integer number "${a}" was passed to "toInt"`);
  }
  return a as Int;
}

// main.ts

const r: Int = toInt(0.1); // ここで早期にエラーで気づける

function numberToString(n: number, radix?: Int): string {
  return n.toString();
}

numberToString(12345, r);
```

[io-ts](https://github.com/gcanti/io-ts/blob/master/index.md#branded-types--refinements) や [zod](https://github.com/colinhacks/zod#brand) のようなツールを使うと、型定義と同時にこのような型ガード関数を生成できるのでさらに便利になります。この `Int` 型程度であれば簡単なのであまり問題になりませんが、複雑な型を定義するときには型ガード関数が型定義と整合していないチェックをしてしまうミスも発生しやすくなるため、型定義を型ガード関数から自動生成できるとより安全にもなります。

[zod](https://github.com/colinhacks/zod#brand) の使用例：

```ts
import * as z from 'zod';

export const Int = z
  .number()
  .refine(
    (a) => Number.isInteger(a),
    (a) => ({ message: `a non-integer number "${a}" was passed to "Int"` }),
  )
  .brand('Int');

export type Int = z.infer<typeof Int>;

export const isInt = (a: number): a is Int => Int.safeParse(a).success;

export const toInt = (a: number): Int => Int.parse(a);
```

[io-ts](https://github.com/gcanti/io-ts/blob/master/index.md#branded-types--refinements) の使用例：[^io-ts-int]

[^io-ts-int]: io-ts には Int 型は標準で提供されているので本来は自前でこのように定義する必要はありません。

```ts
import * as E from 'fp-ts/Either';
import * as t from 'io-ts';

type IntBrand = { readonly Int: unique symbol };

export const Int = t.brand(
  t.number,
  (a): a is t.Branded<number, IntBrand> => Number.isInteger(a),
  'Int',
);

export type Int = t.TypeOf<typeof Int>;

export const isInt = (a: number): a is Int => E.isRight(Int.decode(a));

export const toInt = (a: number): Int => {
  const ret = Int.decode(a);
  if (E.isLeft(ret)) {
    throw new Error(ret.left.toString());
  }
  return ret.right;
};
```

もちろん、これだけでは `toInt` や `isInt` などのユーティリティを使わず `as Int` と書いてしまうことを禁止できているわけではないので、さらに ESLint によりチェックすると良さそうです。

以下のように設定することでこれをチェックできます。

[ESLint 設定例](https://typescript-eslint.io/play/#ts=4.9.3&sourceType=module&showAST=es&code=PQKgUApgzgNglgOwC4AIEHsC0AnaTtwDGSEAJplAJ7ICGAHgFwoDaA5BNtutqwDQoBvMChRQIMCMW5MARABUAygEEoAUToAHXFChx0CZkkoaIShBiQ0kehADojJgHI0AthFsJXEALysAksisALoyvMIobjo0AOYQsgCuYiiEuFYQAajcKHBQGdkIUCQ0pKFgAL5BYCDAYGAOECh53mjxLgBGHCgAZIKNyEwIEABunWUA3LVghPqF2bnIKM0AFDQDrR3YAJRMNHN9qN4AfCiO6xy2ORkQsdgrmxNTM6gpEGlNKCtr7Rzb+4vHQhEcAAZh8AISXZB3TaCcIiJAACy4AHc0BBUapONwlgADAJDGjwUgoAkweINGQAEgENDKMlE8Q0GngZBQSHQKCYGRx93CZXCwGAKGg8GQmFIORobQkmEGdCQmFFDQwODwBGIZAo1EsdHCuCQ8WwCBQuxoUH2E3GtWmBVQjD+zQAjCbzRkxihBcLYIhUBwuNhHraUJQuQtmi83lCAAy2R33D1CxEo81+rIIjgQWrA+IIYg2FrfbBydAKfCIaJLBBfDb8bDFOB0AD8oaQv0KBAQ0VhIn1huNdnZpY7Fd5-LACDORZLZc7S0dACYAMwAFgArPxKLygA&eslintrc=N4KABGBEBOCuA2BTAzpAXGYBfEWg&tsconfig=N4KABGBEDGD2C2AHAlgGwKYCcDyiAuysAdgM6QBcYoEEkJemy0eAcgK6qoDCAFutAGsylBm3TgwAXxCSgA)

```json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "TSAsExpression[typeAnnotation.typeName.name='Int']",
        "message": "use toInt or isInt instead"
      }
    ]
  }
}
```

## Branded Type を使用したときの弊害

Branding は TypeScript でのコーディングにおいて便利な道具ですが、あくまでユーザー側で慣例的に行われている「ハック」であり[^type-branding-is-hack]、TypeScriptに公式にサポートされている実装パターンというわけではないことに注意が必要です。

[^type-branding-is-hack]: https://github.com/microsoft/TypeScript/issues/53923 で質問しTypeScript開発者の Ryan Cavanaugh 氏に回答していただいた内容です。

具体的には、例えば以下のようなコードで好ましくない挙動に遭遇します。

```ts
type SafeUint = number & { readonly SafeUint: unknown };

const findIndex = (xs: readonly number[], x: number): number => xs.indexOf(x);

const fn1 = (): 0 | 1 | undefined => {
  const i: number = findIndex([], 1);
  if (i === 0 || i === 1) {
    // number 型 `i` は `0 | 1` 型に絞られる
    return i satisfies 0 | 1;
  }
  return undefined;
};

const findIndexBranded = (xs: readonly number[], x: number): SafeUint | -1 =>
  xs.indexOf(x) as SafeUint | -1;

const fn2 = (): 0 | 1 | undefined => {
  const i: SafeUint | -1 = findIndexBranded([], 1);
  if (i === 0 || i === 1) {
    // `i` は `0 | 1` 型に絞られず SafeUint のまま！（`-1` だけは除去される）
    return i satisfies SafeUint;
    // ~~~~~
    // Type Error
  }
  return undefined;
};
```

このコードにおいて、普通の `number` 型を使っている一つ目の例 `fn1` ではうまく型の絞り込みができますが、二つ目の例の `fn2` のようにbrand 化した `number` 型である `SafeUint` 型は `number` のサブタイプであるため、即値 `0`, `1` との比較による絞り込みができないという悩みが生じます。

この絞り込みに失敗するのは、 `number` 型は型 `0` や型 `1` の上位型であるのに対し、 brand 型 `SafeUint` は型 `0` や型 `1` の上位型ではないことが理由です。条件部で `SafeUint & 0` 型の即値との比較などができれば `SafeUint` の部分型であるため絞り込みができそうですが、行いたい処理の割にコードが複雑化・コード量が増えるのがネックです。

ちなみにこの例のようなケースは、部分的に `i` を `SafeUint` から `number` 型に広げてから即値との比較を行うという手はあります。関数内のローカル変数 `i` の型から `SafeUint` 型という情報が落ちるくらいは許容できそうです。

```ts
const fn2_2 = (): 0 | 1 | undefined => {
  const i: number = findIndexBranded([], 1);
  if (i === 0 || i === 1) {
    // `i` は `0 | 1` 型に絞られる
    return i satisfies 0 | 1;
  }
  return undefined;
};
```

[コード例（TypeScript Playground）](https://www.typescriptlang.org/play/?#code/C4TwDgpgBAyghgMwgVQJYDthQLxXQVwFsAjCAJygDIoBvKMiOAEwHt0AbEWRFDYALjwQAbuSgBfANwAoaQGM2AZywIMTAJLomEAB44oACh2LBDZm054ipMgG0AugBooOwQRLkAlG+tjsAPhdFADo1XQB5BCNPGXklFTVNbR0AITI4LQgmfSMTekZWDi53GwdnVysPMm9uJDRMKAAfKABaAEYcQONQzJ1I6Kg4RVreBub22IB6SagAUR04QjB2aDafKqhQSCg5DKhSPDgyMhYAdyyoVlP0TZYoAAMABiaoNvu49GUoBHQO3AMas9mh1mvhMqp0BcArRpFA4Tt4lBUOsbPoIRpegYyq8YrD4agEIZUDhsLggc1iaTcG1PDD4fSoNMHqh7kjhugjidztkrjdgHcni83oMEMAxPcCay5AALCByADWwTxDPywHwZBuxMUcGAqEUqggwyBrxk9PEytV6puYO0EKyMiksiZ80Wy2gACZ2oJ4HU+DsMugWFgDhzjmcLrzbg9jW8Pl8fu6coChS8bRA7dloTQLQpPlhkSN6lhxn9volemkMtomFinDjTfjCQZKaSoOSkSTqbTsyq4UyJay9VAAFSB4DDw5h7mXM58gUx1mIMUUCUIKWyhVK3uWjUd7W6-WoQ2FvgNuHm+kMNW7tMZh1TGYupYrKCe90osS7dBj-bQUNciNZyjQVgXeXN43Qd0AH1E3+ZNgVTcEMChQIe3hcD8w-ChcHRJJdErTIa2xGkzyRJsWzJJoKU7HE6V7fsWTZScAJ5ID+WjIVF1FcVJR2DdFQtS8IGvTUoH3PUDSNIVSIveErytKBb2Qph7ydR8FmfaAAGZBDBeVA2uTZwGgL9f2Y8NWMM9iQNeMDER+LSk0EGNENtZTOjouEMKRXT0H0oCyVIgkiRo9sKNotCVQYwd2U5CyZys+dOJFZdmTXPi5QE7d5N3LUdQko8pOBGSLRy60kMhFTpEdaRnQ0t0oB0oRRAoLYTIDIMzP-eLI2shc4xUdAABYnLbFNQQqlDPIRPMfOavwxqGeayCC8jQqojsqQiwT4Wi-JCDgDBhnuSEWq41LV3XTKt17Mq93yw9j1O8gSqEkTFMmqqpCAA)

## ［応用］ Branded Type で数値型を細分化

本節では Branded Type の活用例として数値型を `number` より細かく使い分けられるように数値型 の Branded Type を作る方法を紹介します。

TypeScript でコードを書くときに使える数値型はほとんどの場合 `number` ただ一つです。元が JavaScript という動的型付言語であることを思うとそんなものかもしれませんが、例えば C++ には `int`, `double`, `size_t`, `uint32_t`（≧C++11） など数値型がいくつもあります。
TypeScript には `bigint` 型も存在しますが、 `number` を置き換えるようには設計されていません。例えば、 TypeScript の標準ライブラリは配列の index に用いることはできないよう定義されています（少し試してみると `[1,2,3][0n]` というコードは少なくとも最新の V8 エンジンでは `1` を返してくれるようでしたが、このあたりの仕様については今回本題ではないため詳しく調べられておらず、本記事では割愛します）。

```ts
// lib.es5.d.ts （標準ライブラリの型定義）

interface Array<T> {
  ...

  [n: number]: T;  // bigint を index に使えるようには定義されていない
}
```

```ts
[1, 2, 3][1n]; // Type '1n' cannot be used as an index type.ts(2538)
```

また、 `Array.prototype.map` などのコールバック関数の第 2 引数も値は配列のインデックスであり整数ですが型は `number` になっています。

```ts
interface Array<T> {
    ...
    map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[];
    ...
}
```

こういった事情もあり、整数を使うべき箇所でもほぼ浮動小数点数 `number` を（諦めて）使っていることがほとんどです。
また、整数しか入力として想定していないような関数を定義するときも仮引数に `number` 型を使わざるを得ない以上、ちゃんとやるなら `Number.isInteger` などでチェックするバリデーションコードを関数の初めに書くべきではあるのですが、いちいちバリデーションを書くのは手間ですし、どうせすべての箇所で厳密にやるのが現実的にほぼ無理ということで、特に重要な場合以外は省いてしまうことも多そうです。
そもそも、型を信じることで（TypeScript の型による保証は絶対ではないので、信じられるように注意してコードを書くことで）そういったバリデーションコードをすべての関数に都度書く手間とランタイムコストを省けるのが JavaScript と比較したときの TypeScript の大きなメリットの一つであるはずなので、数値型の制約も型でなるべく保証できている状態が自然に思えます。
特定の条件を満たす数値型（整数など）だけを受け取る関数では、それを**型で明示してある方が、関数にバリデーションコードを書く手間とランタイムチェックコストを省ける上に関数のインターフェースも分かりやすくなる**メリットがありそうです。

そこで、今回は組み込みの `Number` オブジェクトに生えている各種バリデーション関数に対応する Branded number type を実装することにします。

- `NaN` （`Number.isNaN` で絞った結果に対応）
- `InfiniteNumber`
  - `POSITIVE_INFINITY` （`Number.POSITIVE_INFINITY` に対応）
  - `NEGATIVE_INFINITY` （`Number.NEGATIVE_INFINITY` に対応）
- `FiniteNumber` （`Number.isFinite` で絞った結果に対応）
  - `NegativeNumber`
  - `PositiveNumber`
  - `NonZeroNumber`
  - `Int`（`Number.isInteger` で絞った結果に対応）
    - `SafeInt`（`Number.isSafeInteger` で絞った結果に対応）
    - `Uint`（`Int` かつ非負）
    - `SafeUint`（`SafeInt` かつ非負）

これらに単にそれぞれ名前を付けて前節までの方法で Branded Type にするという愚直な方法はもちろんありますが、例えば `NegativeNumber & PositiveNumber` は意味的には空集合なので `never` になってほしいという要請を満たす工夫をしたいと考えました。

```ts
type PositiveNumber = number & { Positive: unknown };
type NegativeNumber = number & { Negative: unknown };

type PositiveNegativeNumber = PositiveNumber & NegativeNumber;
// これは `number & { Positive: unknown } & { Negative: unknown }` 型になるが、
// できれば never になってほしい。
```

そこで、以下のように **Branded Type の tag 部の value に `unknown` ではなく `true/false` を持たせる**という工夫を考えてみました。

```ts
type PositiveNumber = number & { Positive: true };
type NegativeNumber = number & { Positive: false };

type PositiveNegativeNumber = PositiveNumber & NegativeNumber; // never
```

こうすると、 `true & false` が `never` なので全体も `never` になってくれます。意味的には、 tag が表す述語が真になる場合は `true` 、偽になる場合は `false` を割り当てる、という風にして型を分類しています。

正確には `0` や `NaN` が含まれないようにもしたいため、もう少し意味的に正確な型になるよう修正してみます。

```ts
type PositiveNumber = number & {
  NonNegative: true; // x >= 0
  NaN: false; // Number.isNaN(x) === false
  Zero: false; // x !== 0
};

type NegativeNumber = number & {
  NonNegative: false; // x < 0
  NaN: false; // Number.isNaN(x) === false
  Zero: false; // x !== 0
};
```

これでより正確に表すことができました。

直接書いても良いのですが、 Branded Type を作る型ユーティリティも用意してみます。

```ts
export type Brand<
  T,
  TrueKeys extends string,
  FalseKeys extends string = never,
> = T & {
  readonly [key in FalseKeys | TrueKeys]: key extends TrueKeys ? true : false;
};
```

これを使うと以下のように書き直すことができます。

```ts
type PositiveNumber = Brand<number, 'NonNegative', 'NaN' | 'Zero'>;
type NegativeNumber = Brand<number, never, 'NonNegative' | 'NaN' | 'Zero'>;
```

第 3 引数のデフォルト値を `never` にしているので、冒頭の例のような `false` な key を使う必要の無い普通のケースは 2 引数で書けるようにもしています。

```ts
type ProjectId = Brand<string, 'ProjectId'>; // string & { readonly ProjectId: true };
```

これを使うと数値型を以下のように実装できます。

```ts
import { type Brand } from './brand';

export type NaNType = Brand<number, 'NaN', 'Finite' | 'NonNegative' | 'Zero'>;

export type FiniteNumber = Brand<number, 'Finite', 'NaN'>;

export type InfiniteNumber = Brand<number, never, 'Finite' | 'NaN' | 'Zero'>;

export type POSITIVE_INFINITY = Brand<
  number,
  'NonNegative',
  'Finite' | 'NaN' | 'Zero'
>;

export type NEGATIVE_INFINITY = Brand<
  number,
  never,
  'Finite' | 'NaN' | 'NonNegative' | 'Zero'
>;

export type NonZeroNumber = Brand<number, never, 'NaN' | 'Zero'>;

export type NonNegativeNumber = Brand<number, 'NonNegative', 'NaN'>;

export type PositiveNumber = Brand<number, 'NonNegative', 'NaN' | 'Zero'>;

export type NegativeNumber = Brand<
  number,
  never,
  'NaN' | 'NonNegative' | 'Zero'
>;

export type Int = Brand<number, 'Finite' | 'Int', 'NaN'>;

export type Uint = Brand<number, 'Finite' | 'Int' | 'NonNegative', 'NaN'>;

export type NonZeroInt = Brand<number, 'Finite' | 'Int', 'NaN' | 'Zero'>;

export type SafeInt = Brand<number, 'Finite' | 'Int' | 'SafeInt', 'NaN'>;

export type SafeUint = Brand<
  number,
  'NonNegative' | 'Finite' | 'Int' | 'SafeInt',
  'NaN'
>;

export type NonZeroSafeInt = Brand<
  number,
  'Finite' | 'Int' | 'SafeInt',
  'NaN' | 'Zero'
>;
```

これらを使えば、例えば次のように整数の割り算を行う関数のインターフェースを改善できます。

```ts
/** 2整数 x, y を受け取り ⌊x/y⌋ を返す */
function divInt(numerator: Int, denominator: NonZeroInt): Int;
```

また、型ガード関数を複数適用した結果は交差型として絞られるようにもなっています。

```ts
function isInt(a: number): a is Int {
  return Number.isInteger(a);
}

function isNonNegativeNumber(a: number): a is NonNegativeNumber {
  return a >= 0;
}

const x: number = 0;
if (isInt(x) && isNonNegativeNumber(x)) {
  x satisfies Uint; // ok
}
```

[TypeScript Playground Link](https://www.typescriptlang.org/play?#code/FAFwngDgpgBAQgJwIYDsAmAeYMYBUA02eCArlANJRgDOMUAHiFOrdSAgJYoDmhOAYkgA21ClVoMmLGG048YAXhgooANygJgAPkV4YAMhgBvIgihI0AexRCwMANoBrKjC4xBIsTRgAfYmUoaAF0ALhhnO0lmNFpcUi9aAH4YdjIYMIAzYVEAbmAAXzzQSFgAOWtSqG4kEA51UpIAWwAjDV1EVEwUJtaEfBgAInKUSura9QH+oaRSga088GgYAEkUEHbkdAxulo0p-i4OJgHfQdWQScHSmbmFkpgAVS51pQ6tnd79w+PTgfOTvxDCpVGp1KCXaazebAYAZEgoADGtWsrmo5wAFEgwh8NABKMJIVErNbGUxQEAkBAoGANXYIAB0HDRayqGkxuLy+RhcMRyOpTOGo1B9R6bKxylFCHxMEJTJpwLGYNpvVJODMFKpMpgWiUAAZOTCEdY2DB6NjJbp9cAOBkYOimRj6LiDIYBQrhVBlWync6TDgjSgTWAwk8SUp6DkYAB6KMwSyOApAA)

## ［発展］Branded Number Type の Union 型を改善する

前節の実装で唯一難点なのが、 union 型の結果に余計なプロパティが生えてしまうことです。例として以下の型を考えてみます。

```ts
type MaybeNonZeroNumber = NegativeNumber | PositiveNumber;
```

この `MaybeNonZeroNumber` がただの `NonZeroNumber`

```ts
type NonZeroNumber = number & {
  readonly NaN: false;
  readonly Zero: false;
};
```

と等しい型になってくれると意味的には嬉しいのですが、

```ts
type NegativeNumber = number & {
  readonly NaN: false;
  readonly NonNegative: false;
  readonly Zero: false;
};
```

と

```ts
type PositiveNumber = number & {
  readonly NaN: false;
  readonly NonNegative: true;
  readonly Zero: false;
};
```

の union を取った結果、

```ts
number & {
  readonly NaN: false;
  readonly NonNegative: boolean; // = true | false
  readonly Zero: false;
};
```

という型になってしまいます。

`Brand` 型の定義を工夫することで解決できれば理想的なのですが、元々 `number` 型を「割る」ときにプロパティを新たに「足す」ということをしているので、普通に union 型を作ったときに対消滅させるような仕組みにするのは単純な方法では上手くいかなさそうなので、作った branded type の union 型から `boolean` になってしまったキーを取り除いて正規化するユーティリティだけ用意してみることにしました。

```ts
NormalizeBrandUnion<NegativeNumber | PositiveNumber>;
/* 
= number & {
  readonly NaN: false;
  readonly Zero: false;
}
となってほしい
*/
```

TypeScript の型レベルプログラミングテクニックが少し必要で本記事では説明を省きますが（[TypeScript の型初級](https://qiita.com/uhyo/items/da21e2b3c10c8a03952f#conditional-type%E3%81%AB%E3%81%8A%E3%81%91%E3%82%8Bunion-distribution) などの記事が参考になります）、以下の実装で所望の `NormalizeBrandUnion` を得ることができます。

```ts
type TypeEq<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

type UnwrapBrandKey<B> = keyof B;

type ExtractTrueKeys<B, K extends keyof B> = K extends K
  ? TypeEq<B[K], true> extends true
    ? K
    : never
  : never;

type UnwrapBrandTrueKey<B> = ExtractTrueKeys<B, keyof B>;

type ExtractFalseKeys<B, K extends keyof B> = K extends K
  ? TypeEq<B[K], false> extends true
    ? K
    : never
  : never;

type UnwrapBrandFalseKey<B> = ExtractFalseKeys<B, keyof B>;

type ExtractBooleanKeys<B, K extends keyof B> = K extends K
  ? TypeEq<B[K], boolean> extends true
    ? K
    : never
  : never;

type UnwrapBrandBooleanKey<B> = ExtractBooleanKeys<B, keyof B>;

type GetBrandValuePart<B> =
  B extends Brand<
    infer T,
    UnwrapBrandTrueKey<B> & string,
    UnwrapBrandFalseKey<B> & string
  >
    ? T
    : never;

/**
 * ある key が true | false になる場合、その key を削除する
 */
export type NormalizeBrandUnion<B> = GetBrandValuePart<B> & {
  readonly [key in Exclude<
    UnwrapBrandKey<B>,
    UnwrapBrandBooleanKey<B>
  >]: B[key];
};
```

## Links

- https://typescript-jp.gitbook.io/deep-dive/main-1/nominaltyping#intfsuno
