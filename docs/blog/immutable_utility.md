<!-- # TypeScript v4.3 の機能を使って immutable ライブラリの型付けを頑張る -->

## 目標

オブジェクトの非破壊更新を行う以下のような関数 `setIn` を実装すること。

```ts
type R = Readonly<{ a: Readonly<{ b: Readonly<{ c: number; d: number }> }> }>;

const record0: R = { a: { b: { c: 1, d: 2 } } };

const record1: R = setIn(record0, ['a', 'b', 'c'], 999);

console.log(record0); // { a: { b: { c: 1, d: 2 } } }
console.log(record1); // { a: { b: { c: 999, d: 2 } } }

const record2: R = setIn(record0, ['a', 'b', 'c'], '999');
//                                                 ~~~~~
//                                                 ^ type error

const record3: R = setIn(record0, ['a', 'b', 'e'], 9);
//                                 ~~~~~~~~~~~~~
//                                            ^ type error
```

## 前書き

昨今のウェブフロントエンドの開発においては、データを immutable に扱うのが主流です。すなわち、データを変更するときにオブジェクトを破壊的に書き換えるのではなく、新しいオブジェクトを作って変更後のデータを作ります。あるデータがプログラムのあちこちで書き換えられることでプログラムの挙動を予測しづらくなる、という状況を避けたいというのがデータを immutable に扱う大きな理由です。

TypeScript でオブジェクトを破壊的に書き換えずに一部の値を更新した新しいオブジェクトを作る手軽な方法の一つとして、次のようにスプレッド演算子（`...`）を使う方法があります。

```ts
const currState = { x: 1, y: 2, z: 3 };
const nextState = { ...currState, x: 999 }; // { x: 999, y: 2, z: 3 }
```

これで済むケースも結構多いのですが、いくつか欠点もあり、その一つに次の例のようにオブジェクトのネストが深くなっていて深いパスにある値を変更したいとき、パスの深さに比例して記述量が多くなってしまうというものがあります。

```ts
type State = DeepReadonly<{
    a0: number;
    a1: number;
    a2: {
        b0: number;
        b1: number;
        b2: {
            c0: number;
            c1: number;
            c2: {
                d0: number;
                d1: number;
                d2: {
                    e0: number;
                    e1: number;
                    e2: number;
                };
            };
        };
    };
}>;

const currState: State = {
    a0: 0,
    a1: 0,
    a2: {
        b0: 0,
        b1: 0,
        b2: {
            c0: 0,
            c1: 0,
            c2: {
                d0: 0,
                d1: 0,
                d2: {
                    e0: 0,
                    e1: 1,
                    e2: 2,
                },
            },
        },
    },
} as const;

// currState を変化させずに currState.a2.b2.c2.d2.e2 を 999 に変更したオブジェクトを作りたい
const nextState: State = {
    ...currState,
    a2: {
        ...currState.a2,
        b2: {
            ...currState.a2.b2,
            c2: {
                ...currState.a2.b2.c2,
                d2: {
                    ...currState.a2.b2.c2.d2,
                    e2: 999,
                },
            },
        },
    },
};
```

ほかにも次のような欠点もあります。
例えば以下のようなよくある状態管理における reducer を実装する例を考えます。
スプレッド演算子`...`を用いて状態更新を行う `reducer` のコードを以下のように書いていたとします。

```ts
type State = Readonly<{ x: number; y: number; z: number }>;

type Action =
    | { type: 'setX'; value: number }
    | { type: 'setY'; value: number }
    | { type: 'setZ'; value: number };

export const reducer = (state: State, action: Action): State => {
    // ...
    switch (action.type) {
        case 'setX': {
            const nextState = { ...state, x: action.value };
            return nextState;
        }
        case 'setY': {
            const nextState = { ...state, y: action.value };
            return nextState;
        }
        case 'setZ': {
            const nextState = { ...state, z: action.value };
            return nextState;
        }
    }
};
```

ここで `State` の型を `Readonly<{ a: number; b: number; c: number }>` のように変えたとします。
このとき、`nextState` の中の `x`, `y`, `z` はそれぞれ `a`, `b`, `c` に書き換える必要がありますが、実はこのままでも**余剰プロパティ**として扱われるので、型チェックは通ってしまいます（実際に使われるプロパティは何も更新しないコードになってしまいます）。つまり、型エラーが出る箇所のみ修正していたとしたら、ここは修正漏れになってしまいます。

ただし、本題から逸れるためここでは詳しく述べませんが、TypeScript は余剰プロパティチェックという機能を持っており、 `nextState` を直接 return していたり、 `nextState` に直接型注釈 `State` を付けていたりする場合は余剰プロパティに気づくことができます。このため、多くのケースでは問題が顕在化しないのですが、そうはいっても型チェックでエラーになっているわけではないので上の例のような抜け穴が生まれてしまいます。

`...` を使ってプロパティを更新しようとすることの本質的な問題点は、元の `State` のプロパティをすべて展開した上で、それを「上書きする」という形のコードにならざるを得ない点です。このため、この書き方でのプロパティ更新箇所は `State` 型が変わったときに余剰プロパティになってしまう危険を常にはらんでいます。

これらの例を踏まえると、堅牢かつ簡潔な状態更新を行うためのもっと気の利いた道具を使った方が良さそうです。

---

immutable なオブジェクト操作を行うための既存の TypeScript ライブラリとしては、 [Immutable.js](https://immutable-js.github.io/immutable-js/) と [Immer](https://immerjs.github.io/immer/) が有名です。

**immutable.js** を使う場合、専用のデータ構造を使う必要がありますが、 `setIn` や `updateIn` というメソッドを使って以下のようにオブジェクト（レコード）を更新することができます（少しボイラープレートコードが多いのがこのライブラリの難点ですが、永続データ構造ライブラリという側面が強いため仕方ないところかもしれません）。

```ts
import { Record as IRecord } from 'immutable';

const defaultState = {
    a0: 0,
    a1: 0,
    a2: {
        b0: 0,
        b1: 0,
        b2: {
            c0: 0,
            c1: 0,
            c2: {
                d0: 0,
                d1: 0,
                d2: {
                    e0: 0,
                    e1: 0,
                    e2: 0,
                },
            },
        },
    },
} as const;

const stateFactory = IRecord(defaultState);

const currState = stateFactory();

const nextState = currState.setIn(['a2', 'b2', 'c2', 'd2', 'e2'], 999);
```

ただし、immutable.js の `setIn` というメソッドは執筆時点の最新版 v4.0.0-rc.12 でも型が以下のようになっており、 `keyPath` の typo がチェックされません。

```ts
setIn(keyPath: Iterable<any>, value: any): this
```

```ts
const nextState = currState.setIn(['a2', 'b2', 'c2', 'd2', 'f2'], 999);
//                                                         ~~~~
//                                                         エラーにならない！
```

これでは肝心の堅牢性が得られません。

---

一方、**immer**を使う場合は以下のように更新箇所だけならたった 3 行で書くことができます。

```ts
import { produce } from 'immer';

const nextState: State = produce(currState, (draft) => {
    draft.a2.b2.c2.d2.e2 = 999;
});
```

immer では `produce` という関数を用いて変更を加えたいオブジェクト `currState` の "draft" に対して変更を加えると、Proxy を通して値の書き換えを検知しコピーオンライトで（元のオブジェクト `currState` を書き換えることなく）新しいオブジェクトを作って返してくれます。

immer の場合は、上の例で言う `draft` という変数の型は `Draft<State>` というほぼ `State` と同じ型になっており、 `draft` は `currState` を辿るのと全く同じようにキーアクセスできるため、間違ったキーアクセスは型エラーで弾くことができます。この点では immutable.js の `setIn` 関数に安全性の面で勝っていると言えます。

ただし、 `Draft<T>` は `T` から再帰的に `readonly` を外した型になっている（[https://github.com/immerjs/immer/blob/master/src/types/types-external.ts#L35](https://github.com/immerjs/immer/blob/master/src/types/types-external.ts#L35)）ため、以下の例のように `readonly` な値を代入できないという問題が生じることがあります。

```ts
type State = Readonly<{
    a: readonly number[];
    b: readonly string[];
}>;

const initialState: State = {
    a: [1, 2, 3],
    b: ['1', '2', '3'],
};

const nextState = produce(initialState, (draft) => {
    draft.a = initialState.a;
    //  The type 'readonly number[]' is 'readonly' and cannot be assigned to the mutable type 'number[]'.ts(4104)
});
```

一応以下のように右辺を `readonly` を除去した型にキャストすればエラーを黙らせることはできますが、記述量も増えてしまう上にいちいちキャストが発生するのも少し気持ち悪い気がします。

```ts
type Writable<T> = { -readonly [P in keyof T]: T[P] };

const castWritable = <T>(a: T): Writable<T> => a as Writable<T>;

const nextState = produce(initialState, (draft) => {
    draft.a = castWritable(initialState.a);
});
```

このように、 immer を使うと左辺 `draft` が readonly の取れた型になるために、右辺に readonly な値を持ってくると型エラーになってしまう場合があるのが、残念なところです。
しかしながら、immer は状態更新をオブジェクトに対する破壊的更新で書けるようにすることを目的とするライブラリであるため、左辺が mutable な型であるのは仕方が無く、避けようがない問題であるように思われます。

そこで、今回はこのような状態更新を限りなく安全に書けるようにすることを目指してユーティリティを作ってみることにしました。
作るものとしては、 immutable.js の `setIn` メソッドに似た以下のような関数です。これを次章以降で少しずつ作っていきます。

```ts
const nextState = setIn(initialState, ['b'], ['4', '5', '6']);
```

## 実装

実装するものの全体像を再掲します。 `/* implement here */` と書いているところを埋めれば完成です。

```ts
type RecordKeyType = keyof never; // number | string | symbol
type ReadonlyRecordBase = Readonly<Record<RecordKeyType, unknown>>;

type KeyPathAndValueTypeAtPathTuple<R> = /* implement here */;

export function setIn<R extends ReadonlyRecordBase>(
  record: R,
  ...[keyPath, newValue]: KeyPathAndValueTypeAtPathTuple<R>
): R {
    /* implement here */
}
```

この `setIn` 関数は、第一引数に更新対象のオブジェクト（レコード）を受け取り、その型 `R` を元に存在するパス `keyPath` とそこに格納できる型の値 `newValue` を第 2,3 引数に受け取るようにします。 immutable.js の `setIn` メソッドはこの `keyPath` に正確な型がついていませんでしたが、これを型安全に書き直すことが以降やっていくメインの仕事になります。

1. レコード型 `R` を受け取り、 `R` のパスすべての union を返す `Paths<R>` 型
2. レコード型 `R` のパス `Path` にある型を取り出す `RecordValueAtPath<R, Path>` 型
3. `Paths<R>` と `RecordValueAtPath<R, Path>` の対応するペア全体からなる union 型 `KeyPathAndValueTypeAtPathTuple<R>`
4. `setIn` 関数の中身

を順に実装します。

実装をなるべく簡潔にするため、 `keyPath` については不定長の配列（ `string[]` ・ `[number, number, ...number[]]` など）や index signature （`{ [key: string]: hoge }` ・ `{ [key: number]: hoge }`）などのサイズが不定の（動的な）オブジェクトが出てきた時点で、その中身にはアクセスしない（パスを打ち切る）ことにします。 また、 `Set` や `Map` などの組み込みオブジェクトに対しても特別な対応はしないことにします。

**使用環境**

-   TypeScript v 4.3.2

### 準備

少々複雑な型を実装するので、型のユニットテストをするためのユーティリティを用意します。

```ts
export type TypeEq<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
    T
>() => T extends Y ? 1 : 2
    ? true
    : false;

export const assertType = <_T extends true>(): void => undefined;
export const assertNotType = <_T extends false>(): void => undefined;

// 使用例
assertNotType<TypeEq<number, string>>();
assertType<TypeEq<1, 1>>();
assertType<TypeEq<[1, 2, 3], [1, 2, 3]>>();
assertType<TypeEq<readonly [1, 2, 3], readonly [1, 2, 3]>>();
assertNotType<TypeEq<any, 1>>();
assertNotType<TypeEq<1 | 2, 1>>();
assertNotType<TypeEq<any, never>>();
assertNotType<TypeEq<[any], [number]>>();
assertNotType<TypeEq<{ x: any }, { x: number }>>();
```

`assertType<TypeEq<A, B>>()` で `A` と `B` の型が等しいことをチェックできます。本題ではないので今回は原理については説明を省略します。 `TypeEq` の実装は以下の issue にあるものを参考にしています。

[[Feature request]type level equal operator · Issue #27024 · microsoft/TypeScript](https://github.com/microsoft/TypeScript/issues/27024#issuecomment-421529650)

（余談）TypeScript の型パズルに少し慣れると `type TypeEq<X, Y> = [X] extends [Y] ? [Y] extends [X] ? true : false : false` というような実装も思いつくのですが、これは `any` が絡んでくると `X` ≠ `Y` なのに `true` になってしまうことがあるため、このような工夫が必要になります。

それから `readonly` をたくさん書くのが面倒なので、再帰的に `readonly` を付けるための `DeepReadonly` 型も用意しておきます（Set や Map はここでも対象外とします）。

```ts
export type DeepReadonly<T> = T extends (...args: readonly unknown[]) => unknown
    ? T
    : T extends ReadonlyRecordBase | readonly unknown[]
    ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
    : T;

assertType<
    TypeEq<
        DeepReadonly<{ a: { b: { c: [1, 2, 5] } } }>,
        {
            readonly a: {
                readonly b: {
                    readonly c: readonly [1, 2, 5];
                };
            };
        }
    >
>();
```

---

### `Paths<R>` 型

`Paths<R>` はレコード型 `R` を受け取り、 `R` のパスすべての union を返します。これは `setIn` の第 2 引数 `keyPath` の型などに使用するものです。

`Paths<R>` を

-   Step1 : レコード型 `R` の「葉までのパスすべて」の union を返す `LeafPaths` 型を実装する
-   Step2 : タプル型 `T` に対してその prefix すべての union（例えば `[1, 2, 3]` に対して `[] | [1] | [1, 2] | [1, 2, 3]` ） を返す `Prefixes` 型を実装する
-   Step3 : `LeafPaths` と `Prefixes` を組み合わせて `Paths` を実装する

という 3 ステップで実装していきます。

Step1 の実装が大部分を占めていて、Step2 は比較的軽く、 Step3 も `LeafPaths` と `Prefixes` を組み合わせるだけです。

---

#### Step 1 : `LeafPaths<R>` 型を実装する

まずレコード型 `R` の葉までのパスすべての union を返す `LeafPaths<R>` 型を作ります。「葉までの」というのは、以下の例で例えば `["x"]` や `["y", 2, "f"]` などのプレフィックスにあたるパスは除外したもの、という意味です。まずこのような型を作ってから prefix も含む union を作る、という 2 ステップにした方が分かりやすいと考えこのようにしました。

```ts
type R0 = DeepReadonly<{
    x: {
        a: 1;
        b: { x: [number, ...string[]] }[];
    };
    y: {
        c: {
            d: { x: number }[];
            4: 5;
        };
        g: [{ x: number }, ...{ y: string[] }[]];
        h: (a: number) => string;
    };
    z: [1, 2, { e: 3; f: [6, 7] }];
}>;
```

```ts
type K0 = LeafPaths<R0>;
assertType<
    TypeEq<
        K0,
        | readonly ['x', 'a']
        | readonly ['x', 'b']
        | readonly ['y', 'c', 'd']
        | readonly ['y', 'c', 4]
        | readonly ['y', 'g']
        | readonly ['y', 'h']
        | readonly ['z', 0]
        | readonly ['z', 1]
        | readonly ['z', 2, 'e']
        | readonly ['z', 2, 'f', 0]
        | readonly ['z', 2, 'f', 1]
    >
>();
```

`LeafPaths` は結構長くなるのですが以下のようにして実装することができます。

```ts
export type LeafPaths<R> = R extends readonly unknown[]
  ? LeafPathsImplListCase<R>
  : R extends ReadonlyRecordBase
  ? LeafPathsImplRecordCase<R>
  : readonly [];

type LeafPathsImplListCase<
  T extends readonly unknown[],
  PathHead extends keyof T = keyof T
> = T extends readonly []
  ? readonly []
  : IsInfiniteList<T> extends true
  ? readonly []
  : PathHead extends keyof T
  ? PathHead extends `${number}`
    ? readonly [ToNumber<PathHead>, ...LeafPaths<T[PathHead]>]
    : never
  : never;

type LeafPathsImplRecordCase<
  R extends ReadonlyRecordBase,
  PathHead extends keyof R = keyof R
> = string extends PathHead
  ? readonly []
  : PathHead extends keyof R
  ? readonly [PathHead, ...LeafPaths<R[PathHead]>]
  : never;

export type IsInfiniteList<T extends readonly unknown[]> =
  number extends T['length'] ? true : false;

export type ToNumber<S extends `${number}`> = /* 省略 */
assertType<TypeEq<ToNumber<'1000'>, 1000>>();
assertType<TypeEq<ToNumber<'8192'>, 8192>>();
assertType<TypeEq<ToNumber<'9999'>, 9999>>();
```

例として `LeafPaths<R0>` がどう展開されるのかを説明します。

まず、`R0` はレコード型なので `LeafPaths` の中の条件 `R0 extends ReadonlyRecordBase` にマッチし `LeafPathsImplRecordCase` が呼び出されます。
第 2 型引数の `PathHead extends keyof R = keyof R` は引数というよりは型変数 `PathHead` を宣言しておくために置いています。
`string extends PathHead ? readonly []` のところは index signature の場合を除外する（＝再帰を止める）ためにあります。 `PathHead` = `'a' | 'b'` などは `string` を部分型に含まないためマッチしませんが、 `R` = `Record<string, number>` とかなら `PathHead` = `keyof R` = `string` はこれにマッチして再帰がここで止まります。
`PathHead extends keyof R` という部分は、 `PathHead` ＝ `keyof R` なので常に true になり一見意味が無さそうに見えますが、 **union distribution** を起こすために挟んでいます。union 型（ここでは `'x' | 'y' | 'z'`）の要素について配列の map のような処理を行いたいときによく使うテクニックです（参考： [TypeScript の型初級 - # conditional type における union distribution](https://qiita.com/uhyo/items/da21e2b3c10c8a03952f#conditional-type%E3%81%AB%E3%81%8A%E3%81%91%E3%82%8Bunion-distribution)）。

```ts
type F<X> = X extends X ? [X] : never;
// X に union 型 A | B が入ってくると、 union distribution により
// (A extends A ? [A] : never) | (B extends B ? [B] : never)
// に展開される。

type A = F<1 | 2 | 3>;
// A は [1] | [2] | [3] という型になる
```

いま `PathHead` = `'x' | 'y' | 'z'` なので、

```ts
PathHead extends keyof R
  ? readonly [PathHead, ...LeafPaths<R[PathHead]>]
  : never;
```

という部分で `'x' | 'y' | 'z'` が分配されて

```ts
('x' extends 'x'
	? readonly ['x', ...LeafPaths<R['x']>]
	: readonly [] ) |
('y' extends 'y'
	? readonly ['y', ...LeafPaths<R['y']>]
	: readonly [] ) |
('z' extends 'z'
	? readonly ['z', ...LeafPaths<R['z']>]
	: readonly [] )
```

という union になり、それぞれ true 部に簡約されて

```ts
(readonly ['x', ...LeafPaths<R['x']>]) |
(readonly ['y', ...LeafPaths<R['y']>]) |
(readonly ['z', ...LeafPaths<R['z']>])
```

となります。
それぞれの key について再帰的に `LeafPaths` が呼ばれるのですが、ここまでと同様の展開で `'x'` の部分は以下のように簡約されていきます。

```txt
readonly ['x', ...LeafPaths<R['x']>]
 -> readonly ['x', ...(['a'] | ['b'])]
 -> readonly ['x', ...['a']] | readonly ['x', ...['b']]
 -> readonly ['x', 'a'] | readonly ['x', 'b']
```

2 行目から 3 行目への簡約は Variadic Tuple Types の union distribution が行われます（[Variadic Tuple Types の PR](https://github.com/microsoft/TypeScript/pull/39094)に `...T` の `T` が union のときは distribute されるという仕様が書かれています）。
`LeafPaths<R['z']>` の方は、 `R['z']` = `readonly [1, 2, { e: 3; f: [6, 7] }]` なので `R extends readonly unknown[]` の配列型のケースにマッチし `LeafPathsImplListCase` が呼び出されます。

```ts
type LeafPathsImplListCase<
    T extends readonly unknown[],
    PathHead extends keyof T = keyof T
> = T extends readonly []
    ? readonly []
    : IsInfiniteList<T> extends true
    ? readonly []
    : PathHead extends keyof T
    ? PathHead extends `${number}`
        ? readonly [ToNumber<PathHead>, ...LeafPaths<T[PathHead]>]
        : never
    : never;
```

`IsInfiniteList<T> extends true` のところは不定長の配列型の場合は再帰をストップするための処理です。 `IsInfiniteList` は、固定長のタプル型の `length` がその具体的な長さの数値リテラルになる（たとえば `[1, 3, 6]['length']` = `3` ）ことを利用して `number` 以上に広い型になるかどうかで以下の判定できます。

```ts
export type IsInfiniteList<T extends readonly unknown[]> =
    number extends T['length'] ? true : false;
```

`PathHead extends keyof T` はレコード型のケースと同様で union distribution のための行です。

その次の行は、タプル型 `T` のキーのうち index の数値を表す文字列になっているもののみをフィルタしています。タプル型のキー集合（ `keyof [1, 2, 3]` など）に含まれている `"0"`, `"1"`, `"2"`, ..., `"toString"` , ... などのキーのうち添え字のキー `"0"`, `"1"`, `"2"` のみを取り出す処理です。

`readonly [ToNumber<PathHead>, ...LeafPaths<T[PathHead]>]` の行はレコード型のときとほぼ同じ再帰ですが、 `"0"` → `0` という変換をしてあげるために `ToNumber` をかませています。 `ToNumber` の実装はトリッキーで脇道にそれるのでここでは省略します。以下の記事の実装をほぼそのまま使いました。

[TypeScript にヤバい機能が入りそうなのでひとしきり遊んでみる｜ TechRacho（テックラッチョ）〜エンジニアの「？」を「！」に〜｜ BPS 株式会社](https://techracho.bpsinc.jp/yoshi/2020_09_04/97108) <!-- cspell:disable-line -->

あとは `"0"`, `"1"`, `"2"` について再帰されるのですが、 `"0"` の再帰は `...LeafPaths<T["0"]>` が `T["0"]` = `readonly [1, 2, { e: 3; f: [6, 7] }]["0"]` = `1` より、 `... readonly []` に展開されるため、この再帰の結果のパスは `readonly ['z', 0]` となります。

同様にして他のパスも辿られて、最後に union distribute された各パスの union が返されるので、 `LeafPaths<R0>` は

```ts
| readonly ['x', 'a']
| readonly ['x', 'b']
| readonly ['y', 'c', 'd']
| readonly ['y', 'c', 4]
| readonly ['y', 'g']
| readonly ['y', 'h']
| readonly ['z', 0]
| readonly ['z', 1]
| readonly ['z', 2, 'e']
| readonly ['z', 2, 'f', 0]
| readonly ['z', 2, 'f', 1]
```

という型になります。

---

#### Step 2 : `Prefixes<T>` を実装する

`setIn` の第 2 引数 `keyPath` は、オブジェクトの末端までのパスだけでなく途中のパスにもマッチする必要があるため、`LeafPaths` の結果の union にそのすべての prefix にあたるパスを追加する必要があります。

あるタプル型 `T` を受け取りその prefix すべてからなる union を返す型は以下のように定義できます。

```ts
type Prefixes<T extends readonly unknown[]> = T extends readonly [
    infer Head,
    ...infer Rest
]
    ? readonly [] | readonly [Head, ...Prefixes<Rest>]
    : readonly [];

assertType<
    TypeEq<
        Prefixes<readonly [1, 2, 3]>,
        readonly [] | readonly [1, 2, 3] | readonly [1, 2] | readonly [1]
    >
>();
```

例えば `Prefix` に `[1, 2, 3]` を渡したときの動作は以下のようになります。

```txt
Prefixes<[1,2,3]>
  -> [] | [1, ...Prefixes<[2,3]>]
  -> [] | [1, ...([] | [2, ...Prefixes<[3]>])]
  -> [] | [1, ...([] | [2, ...([] | [3, ...Prefixes<[]>])])]
  -> [] | [1, ...([] | [2, ...([] | [3, ...[]])])]
  -> [] | [1, ...([] | [2, ...([] | [3])])]
  -> [] | [1, ...([] | ([2] | [2, 3]))]
  -> [] | [1, ...([] | [2] | [2, 3])]
  -> [] | ([1] | [1, 2] | [1, 2, 3])
  -> [] | [1] | [1, 2] | [1, 2, 3]
```

---

#### Step 3 : `Paths<R>` を実装する

これは単に

```ts
type Paths<R> = Prefixes<LeafPaths<R>>;
```

とするだけです。これでなぜ良いかというと、 `Prefixes` の引数 `T` に union 型 `A | B | C` が渡ってくると union distribution によりそれぞれの union の要素について `Prefixes` が施された結果の union になるためです。これにより、 `Paths<R0>` の結果は次のようになります。

```ts
  readonly []
| readonly ['x']
| readonly ['x', 'a']
| readonly ['x', 'b']
| readonly ['y']
| readonly ['y', 'c']
| readonly ['y', 'c', 'd']
| readonly ['y', 'c', 4]
| readonly ['y', 'g']
| readonly ['y', 'h']
| readonly ['z']
| readonly ['z', 0]
| readonly ['z', 1]
| readonly ['z', 2]
| readonly ['z', 2, 'e']
| readonly ['z', 2, 'f']
| readonly ['z', 2, 'f', 0]
| readonly ['z', 2, 'f', 1]
```

以上で `Paths` 型の実装が出来上がりました。

---

### `RecordValueAtPath<R, Path>` 型

レコード型 `R` のパス `Path` にある型を取り出す型です。 `setIn` 関数の第 3 引数 `newValue` の型に用います。

これは `Paths` に比べるとだいぶ簡単です。 `Path` は先ほど作った `Paths<R>` に含まれるパスのみが入ってくるので、安心してそれを先頭から辿り再帰的に `R` を掘っていけばよいです。

```ts
type RecordValueAtPath<R, Path extends Paths<R>> = Path extends readonly [
    infer Head,
    ...infer Rest
]
    ? Head extends keyof R
        ? Rest extends Paths<R[Head]>
            ? RecordValueAtPath<R[Head], Rest>
            : never
        : never
    : R;
```

`Path extends readonly [infer Head, ...infer Rest]` とすることで `Path` を先頭要素と残りに分けることができます。

`Head extends keyof R` や `Rest extends Paths<R[Head]>` は必ず true になるのですが、追加しないと `RecordValueAtPath<R[Head], Rest>` でエラーが出るので追加しています。

`Path extends readonly [infer Head, ...infer Rest]` は、長さ 1 以上であるという条件でもあるので、長さ 0 の `Path` が来たときは `R` に評価されます。

```ts
type R0 = DeepReadonly<{
    x: {
        a: 1;
        b: { x: [number, ...string[]] }[];
    };
    y: {
        c: {
            d: { x: number }[];
            4: 5;
        };
        g: [{ x: number }, ...{ y: string[] }[]];
        h: (a: number) => string;
    };
    z: [1, 2, { e: 3; f: [6, 7] }];
}>;
```

```ts
assertType<TypeEq<RecordValueAtPath<R0, readonly ['z', 2, 'f', 1]>, 7>>();
```

---

### `KeyPathAndValueTypeAtPathTuple<R>` 型

`R` の各パスとそのパスにある値の型のペアのタプル全体からなる型です。これは `setIn` 関数の第 2・3 引数の型に使います。
`Paths<R>` の union の各要素（`R`の各パス）に、そのパスにある値の型をくっつけたペアの型を生成しています。

```ts
type AttachValueTypeAtPath<R, Path extends Paths<R>> = Path extends unknown
    ? readonly [Path, RecordValueAtPath<R, Path>]
    : never;

type KeyPathAndValueTypeAtPathTuple<R> = AttachValueTypeAtPath<R, Paths<R>>;

assertType<TypeEq<KeyPathAndValueTypeAtPathTuple<R0>[0], Paths<R0>>>();

assertType<
    TypeEq<
        DeepReadonly<
            | [
                  ['y', 'c'],
                  {
                      d: { x: number }[];
                      4: 5;
                  }
              ]
            | [
                  ['y'],
                  {
                      c: {
                          d: { x: number }[];
                          4: 5;
                      };
                      g: [{ x: number }, ...{ y: string[] }[]];
                      h: (a: number) => string;
                      i: (a: string) => string;
                  }
              ]
            | [['x', 'a'], 1]
            | [['x', 'b'], { x: [number, ...string[]] }[]]
            | [['x'], { a: 1; b: { x: [number, ...string[]] }[] }]
            | [['y', 'c', 'd'], { x: number }[]]
            | [['y', 'c', 4], 5]
            | [['y', 'g'], [{ x: number }, ...{ y: string[] }[]]]
            | [['y', 'h'], (a: number) => string]
            | [['y', 'i'], (a: string) => string]
            | [['z', 0], 1]
            | [['z', 1], 2]
            | [['z', 2, 'e'], 3]
            | [['z', 2, 'f', 0], 6]
            | [['z', 2, 'f', 1], 7]
            | [['z', 2, 'f'], [6, 7]]
            | [['z', 2], { e: 3; f: [6, 7] }]
            | [['z'], [1, 2, { e: 3; f: [6, 7] }]]
            | [[], R0]
        >,
        KeyPathAndValueTypeAtPathTuple<R0>
    >
>();
```

---

### `setIn` の関数本体

（途中端折りましたが）ようやく型が出来上がったので、最後に関数本体を実装します。

```ts
const UNSAFE_setIn_impl = (
    record: ReadonlyRecordBase,
    keyPath: readonly (number | string)[],
    index: number,
    newValue: unknown
): unknown =>
    index >= keyPath.length
        ? newValue
        : Array.isArray(record)
        ? record.map((v, i): unknown =>
              i === keyPath[index]
                  ? UNSAFE_setIn_impl(
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        record[keyPath[index]!] as ReadonlyRecordBase,
                        keyPath,
                        index + 1,
                        newValue
                    )
                  : v
          )
        : {
              ...record,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              [keyPath[index]!]: UNSAFE_setIn_impl(
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  record[keyPath[index]!] as ReadonlyRecordBase,
                  keyPath,
                  index + 1,
                  newValue
              ),
          };

export const setIn = <R extends ReadonlyRecordBase>(
    record: R,
    ...[keyPath, newValue]: KeyPathAndValueTypeAtPathTuple<R>
): R =>
    UNSAFE_setIn_impl(record, keyPath as readonly string[], 0, newValue) as R;
```

型キャストが多くやや見づらいですが、 `setIn(record, keyPath, newValue)` は `UNSAFE_setIn_impl(record, keyPath, 0, newValue)` を呼び出していて、第 3 引数の index が再帰で 1 ずつ増えていき、 `keyPath` の末尾に到達した時点で `newValue` を返す、というようにしています。
`UNSAFE_setIn_impl`の内部の型は嘘だらけですが、 `setIn` のみ export するのでよいこととします。

内部実装は `UNSAFE_setIn_impl` のように自前で書かなくても immer を使ってもよいと思いますが、今回は依存ライブラリ無しで作る例として載せました。

## 完成品

-   [TS Playground](https://www.typescriptlang.org/play?#code/PQKgBApgzgNglgOwC4FoAmcoEMBGMJgACSAngA7QDGATnGatPMsAgPYoQAeZ8lcqWBCTAhgAWABQk0CFlz5C+WAAq5AsuhIRinYvFSJpCirUBRAI4AeAIIAaMACEAfGAC8YABSXlTjwEo3F2VITiQIBDQoMGswAH4wAEYwAC4wACYArjCIqO9fANcgkOzIx0kwOMTylPTq+KRqAFcIatSAMywYKAgAbklpYEhYRFQMbDwIFAQslCYCYjUoGjoGYeY2FEaERu60FAA3LGooSUpWBCgtLChu6iRVY3dLAH1grPDShub81P3WODQgTAWzQEDaiAgaD6EmAg0YI3QmFw+CmMzmRCMVFo9A4ayQLHYWx2kIORxOEjOFyuNwgdwAcqx7mo3GAXm9Qh8oh0uhAfmA-gCgSCwRCof0JNdbkgGUyKN4zFZtgBbHC0+yXWgIADmTny0MltNlEHlFAslgS9gSuv8+ppdwexodZoA2hb0vYAMwAXXsrvsaU9XutfltUodJogZuoECwaHOMGEfvdYG99mjsfjibdAZTQb1kgN9MZ4adViTOdTYHTcYQCbA5cDwdDhplJYVlkEJEtTYLdulxbUEbNSQAPsmrfmJX3W4PSx2hPZpvtaT2p1KZ3K587Oz768rVdQ8zbe+uB5v2wBvMCcVJJAC+YAAZGAryRUmkwHf7Feb4kemA33ST9V0LfsjSHKwf1STtP2-a9Un3WlgMnaRdDQuQwAAEQgCAyAAJRjGs63Q9D9EkTEsJw-DCMzPIWXZEoog8AA6Viji1KBUmrTNgQQABrNgAHcEGdL0ChcLYBNYYS6hUVoVGKTkwAIjNaxIAizmoNAHGuAgx24tTeKk4TRNkq8DLrZ0AAUwEQMA+IgEhWDaFQvVSbDcJUoiSG8ayg0-eTlGhE9DXDao52qCoPOo1SE0sK8sFSK8cCSsBKAQxoVVpUT-wSd9PwKu8nFsSKX1KioLOERKyokCo6rqyqwBSmr6taqsaMM9L2ti4REOoHLytaxq8vSaE2oqO8xtaybSrvaonEkFC11CwdwvbUroq82iEtS5qry6hswAAVi9QrgJK2q6ovQbGuq67Lraxq9sG+rGq6xrDpOqa2pmh66t++q5suhaJCWmQSJ0MAAEkoAAVQQOBzm0CG9HFCiYbpCBl2oOj3GdZRTveHI9yx2lTvqJoCHaTpumCwxmRh+HEYQABlRocEsWH7AAaRZWGXDx2HCY5YnnSXMnZO5bp5N5onSkkoSEFk2EhiYUYkQmVFQlmCEMUWZYcXhZgcEEFBMXJCoMdJnHTE4SgYEaUFOZ53VFOJr4Wku+Ipc9ipUg9+TxeoOn0bhhHzk5gXobD5m2Y5-m6dAttTSsRnw4QSwNUQHV7B9kC+2TyNU5jiO+rAMcs+1YqwA9-Ow1nds0+Zywxcyg9y7ASutSDXOad5MGUchhJmJr5k4CVHgICVcIkCwJBmeRwe5DI+njA01gtO5xyHRZBynJcoPm3tBuU8sPfnLAIPFzbpCK4abOO6gEgVVYGBVwora1PXrTLFlkXSm-mgLeJAHT2AAGpR0-nFQBv9wG6mhB-DqCZAE6W6CyKB6kICaTQJYQBwDQFGUVk4OmKtKTgg4mjZkyhWB0hvtQTCcAtT8FhmQCg1AAAy49+AsgACwkKXgoaOAAxOAnBITsPCFqJAAALThlxF4CJXqHERYi0ASO1DIuRSBvBu1KI1BW0kRL+VcNUMucsojKGdAAcnwBo6RVjyZgB9jUD2IcGZQBlCo8RkjNGYG0QxJS+j+KK1EgLUxdDdEWOsbYqR9jHEexqD7ROBcT5F0sDDLxaifGyL8S3HuNdKZ1xWueU+GTRHeLsVoluo5kzemrrXScSdUlmjKao9RsSqmHTqfYBpx5lrHxKWk1pFSOm5I+vk3pIYQoDMdI3KAmT2m+MuJYD6NSKwTMKY0lJgyWnzPKVkypYykFZn9I2Hpmy+nTPAnOYZBzRnLL6qE3uPIikzIgukvZbTslVMao8-Jectn1x2cXBZ3zcmtyytQS0pywCsWYn8-5fdXngTWqUz5IylnaI+n1aFyY4UIurnnRafSmlylRUM9FdzMUtxxYkGFcKPC-LoaJPwiKXnEqmf0lFl0Ip-VuYsnJyzsV0NxTmBlTLIUsp7qVH280OX8IERhZQjRJ7KCwHAGACil5KKoSq-AaqNU2Eid1byhDDGhJZDEcxJqeKmS9jawydq-bRGNR9Axwl7BwsQG0JCeEvSyQwbgkGzrA3WGIeKUlszT7KtVeqmAKzjn1nyeM5FhczQxv1XGhNPV6wJGTYm0JgLilRrSRmiABr42rJhd0h1ll1mrlQoq2QYAACyWAHJlq1YPHVxgGFMK0O4AADB3NZHcPQdx4R3I6HcABsHcADsHcAAcHcACcbjjAswaBWnR1qu5RwCcTAABgAEgvH2-gd4z3eqQrDO8R7KiwxqIfcizIt3UBEccfxxr930WNaei8N7qBgDvWe99O6fD3tkrDQO1sN0EAvUgd9LIAOIfvfBlQGrjThVdYm91RiLoVDpMaxDHdEPIbHFYhIg6rEjsHfNFkzpSrjMIw1AtcKCasYqux1iyhPW8Z9MxnjzE+Owt4-xkTgm-ofQ4xJ0TsmxOSa47WxMCm1PicU-JgTymZMafUyJuThnNNSdesJrTBnNNGf0+ZzjQmc3Oms1ZvTzmLPWZM2x+zjnLPea8757TdnTUOZczZpzrnguhZs-6y6XpnR0i9BhttHa9UQChhPeN4VWPEb3ffbUrGAAauGc34dEoxqLFQo5d2NXSWSQd5JZf-lEKxVjZJ5fku+z9yy6QuGtUBkD0GSOMP4O+2SiXy3JdSzwbw9hwNZq62mMzWGW6cZA9XDji28uWkHU4IMsHsa7dpAl9tY3J5TbAPVxil86FR1G2Wib8bRMAbpPe8NBhI2WHJWaG7yXLD4c9NXN1wTDH2F+2a4SO3QaXJhE25t1DaGQq7SjHt6gaF0MsCzf9Z6+rPZZDDFmSpOgwDhweNH3WGsFOaCNo7t20s-cBx6sALMnDROyQ4trGHcf45gIT1H6PrUAax0eqOHOCdE9pHd97l0Wasa+ydkHsO6GIZYWwzhSp+Agxe6+4wEGf05Z1H+vnZ60PXoQD64Dd6H3xCfQhODlDjDC656L6g4vqi87J13VjABhVgWwwjAetUE4yRiGPuFdxdprskA6XVSHOL3Pu1QqaTaTi7keKjez7mAFW6ZKDSMhDXHPYB4Cq6QPJe33PIXi53Yz+wZad2x+QCuDXXK01WHl5CywVHB2d6sdXajnfU3NJbyjtvVil0JFXWkbv9hR-j-78C7wQ-idWNXcv1dk+wAr9XbPkt6aF+0nb73rv1cO+d5ow2qH0OwBCMaFzqyc9pFRGh6IW3BAr837v1AIN6DCumuK2Vyor+YBb8ZEoA7stEPddIg15I8JjUMEUFdJZIACgD787tAFwDuhICo8E8BoDAKJED39QC-E0DsMeVv8eJf9WMkCAAJQiY1c+FyYIdwOguSYGfXMncZWSdgzAjGRkUFQ5ZZHwY1FPSoTg51Kgmg61Jg5QWSMQ2MDHC8AXDggtVvYnGQtAVbViPA4A3yVQoMP-a3PbTAl9HA5kTQ5AtLVAiA6oaA61WArBDebSXSCgu-ag2QiQxyC+aAxg9wlyPCYPTuXXY1VQxQ+zPQsAVQ2g7w5SYIwLVQiTUwj-PCayZwwiXQ-bYOZ-ZSYddwTaY5eKaoX8e6eqaqBIb6JqVKX8CFA8CTLuUSU6O8bAiaKaQCQouqLqFo+qNAcojKeHeo+LQaHhVII6UogGOqLUVIZ0KCS7HoiTV8VIGouo2o0o6RVIDwaqPqcSfwzULUUouAFY6qLuDYvqKaEYgAL3GOzDgggFSA9H-DaHGJnXsHnTqL6IkCKgw25iyMv2v0APf1wS2yPm5QqF5Xqg+OU30gLSsU4CsXsCsSwFZz+nBPs0hOhLACsRwHhPqkRMCysRIBRKsUoDxLQAxLqixNtRxLxIJPsB4T-wqFJMdXJJhK1GJNpKwIZNRLiVKjpMsjZKsTgGZI7g+isROJRMHRpIFIhOFMtDFK5MTCFJRJzCsQgH5JlPrDlJhSsTaBFOlNZMlOTA1JRLzTlQh05UbSbTCOjHBDEQf2hyR3NJFCtMsHYVIMMl-yjidP9wLWqF6xcLQFYy9RN19U0EkD-3iHGXFPsx9IkysgtPKQSM0G23knGWSSBWIKBPWj+mjPtOgGzUCwuNzGKgC1tVOhVK6WLKwOzDLNWT-3V0hzeznEzMtOzKeSwKPBNPPzNKQOtKbVtM7M-3cAbNjMsHiKDUbwom5iSH7N+Lwn+KuTCh5XTJBItE5NZKhJhLhO1MFNXNRPRI3IhKhN3KRNxJhMpNRKJIPOxKPNRJPOpOXMFMvPxOVNZPvKZPPLJPvI5IRKfLxL5NfPpNxN-O5N1NFNvIlINIAtlN1IVKVPAtVMgphM1PsGAs-MFLgtRIQsSBgusVQv1MwrVPSFwuFMwurPlXFHBkVWUjsK0jAU6GaGsCQCQIRwhltMAWoodggDoqQNwXsAYutV7LwldknJkWdMsi9IDOA0jOqH9NNwosuGDNkh9IiP3iiPtQInkV4qnOdB9PB1TwouwVYtovorv1wU0pSPsFUqQGDWfWtjSKgOTOLXeRYpovYsMpkT+PmxCOrmnK3wlzTNPlKkcrYo4qMunPcuxP3ILL+hyJ6nijAGKP-D2ngj3BFUU3mIWLqMsprM5TrPbACoMs4pCpXLxPXJ728o+ysH8sorQH0ucvysHVCrJK3LRIcQivqiiu8hioqNpThVSs-FCSNKLTeTKp8rqlypquCrqq-OlUiqokDXaNaKShejAE6JfESrLl6NKPqgGOOg2s-B2rGPrEmLWpmIAjmN1xK16JeLamWM8DWLoQ2K7h2t2JutOq2MOLoWGIypIqb1WnnL8r+lGqCtcoKrvIpOauUzau2kGmWsOoiXWv6MGI+v6pJW2VTJMD+vqgBpcukTcq-OPMJLBo2hmtyJhp6L6uBi+reyGoqr0qcsBuxuBohOfIJums8lyImNWthuOsAnmN6q9G0rAEyoBLnN8rSUxtqvqr-LxLiWrlWO6IPHut10FtnJ+pFrNDFvGolu5PvJ-Jlv2N1zeshSVu+rJV+rSWpvsOqrppxpQuZtaqJuisOivCuJTFuPuMeOeM+uNKFoH1wUqstqxuttAsQvyQnGRpTIcr9tpoDoZqRN1LzWrjSFKtNrNHNqoqjvFp1PlKmrttZuiqduuNdvrAeLACeOAiRqypRojppsCujomptvVOgurg9CTtVqsHVqBrrqDr1M1PzXs2LqeKNuytPnbvps7tjvlPgq1OrhnW8rnBHsDvHvVPQvjseLPzIoETAGASQOsAiExkEmqs7Uf1tLotnmzwPrUCtrwm4rv0CKnIErCJvutXw2iNtSQLMsjprvyuvpkQTMMJt2MOMC3rvx3qqqcodDprLT7OiCQFPukXPooEvu-vvxHLsreTnCAZkRAfgbGpkUga8udFFKQYSK2zP0puTvKpZpinasGjHCYz+nqmsXvIJPczajmramho5tJsuvGgqC2qGMWqBjajFJZLoZ4cYYcWU3qjYdajaMWo6K6KmPbjhvofGj4Z2sBnUdGPGJJqUa5peuznOsWLkbAGutlsUdpAVq2M0YqCerMYOKBCOIEcGmEY7mdGsUavXKlJofrHcbxJ3Lgk6uSu6rOr5t5pcdod8d3B2j-DKJWsCchWqJCbSs-HCZ8Z5JPKsTPICblqQguu8bcfSZROpPsBOnyfEcZIkYOs4d0cU1mM2IMbSr5rKZ5LiXsDMfWKBC7lSYKe1sqbsf1ocboW6awq1K8ZUYibwrzX9GGbwqgsqe9GaewvQsIbABnRmaWbAvdsWYnrQsqedH7qafGbScgqicgALqcTdpLueO2d3EdrOZdouaLvdpSeGd3GnLFJarqgwekSwbAYvqxrwa23LoVTNLaC2EoHniRnHknmnmQDngXiPvFEpHkVhjpBZmsCEVMGeG6CQChgQGeGhc1XcA8GqGjGwVSFsOwVQQgFYz3iQK4kTQ8DLjvletElY0QFBF-BxVMQgH3qctSGfokD8AFbpwQECFEs5YFq8JICQOYhiRkVKniGmD5bYtKlSGsGoGoCwBIGYkwA1a1ZIEZUqr8EGlDMquYnxzIA8A8H2HsDgGFdBzFcKEWrgDcFcGlaQOdA5a4BcfqktzRYxaxZxbxYJbSxJZUbahViNnVnGBRGmG1nRAWAoCWGxFWDVgJCmHOCmG+JQFAmZmMe42wWdDpbvy9YiB9YAEJTprgKKeo4DuhJHxoS2ZFG22pvXOAwAABqOlAty+Xl6q4xk1iNuqX4QaIdtqBa4duFMl+w1tjPOEPEREWNyYeN1ARN82A2NNkYDNtgBAbNrnXNvsfN4d4txyT19tr0Kt1IVF9FzF7FiAXF-Fwl8NnhioKNxdsYZEFdtEXWJNrEFYXEdNjYXd-dmAQ9qUY9199qIt5t6RMtzly96tqISl+w6ludioWD9D2yctjt7tpc4dioZVgd4dvwRt36U4c4eRYNp11kawsnFDrSal3wUlyqilv01iU9mVu-RcftpytyTes94BiIbBiB77fiyQB1zwyym9wN+9x90NngI17BewWD2KqIRqeYxCnjlV5oAIGtvCEF8irgLANLAgRFgBggLdOeAgbI+29qlorAQdHJ9Iy6LAEaRx1ztISd+qHAJz8xlznz9z960qHALzlqGRvzjztqSgILyFHaygML6RioNASL4L4dtAWLg8TRtARL4xiAVLuLvLzLg7PLsLqL8aEYjR2aY46EN4pFyjrQRAfgOAToKzsIVINrmz8Lxz1IOq6oNz3r1jLAXLv6XzwbkLkaPr0bkb6Lvzqb6LybxthL7z8aFL8b9LxbxanLlbnh-L9bqDiATbgjyAML+birsj5TL8aoK714tTtKBrumZFrQVdzrkaTrlkajjwJr+eVr2eMIX0WEifGEnABISplfNsp7vt0ITrsL979wT777lrmATrgH4bvxoHq8jHzJifKJ6oPbku+dedVjQ71IJdMn4nsLlfC6O8CHyj1+CAOV1gLUL7hGH75Hv7iATlZF+nxn5nl7jnhILnun-AXnplrIGHzlIAA)

## まとめ

今回はオブジェクトの非破壊更新を行うライブラリを作ってみました。JavaScript のコードとしてはスプレッド演算子を使っているだけの素朴な実装ですが、ウェブフロントエンドの状態管理コードなどで使用することを想定しているので、型がしっかりついている安心と便利さをまずは重視しました。
このライブラリは十分実用的で、ランタイムが非常に小さい（`setIn の関数本体`の節に書いたコードのみ）点がメリットですが、 immer と比べて機能面で劣っている点もあります（たとえば長さ不定の配列の一部の書き換えには対応していません。実はそのようなライブラリも自作しているのですが本記事では量が膨れすぎるため載せませんでした。）。機能面で不足するのであれば、序章で示したように writable へのキャストを行うことを許容して immer を使うのがリーズナブルかなと思います。

以上、 [noshiro](https://twitter.com/noshiro_piko) が書きました。

## Links

-   [Immer](https://immerjs.github.io/immer/)
-   [Immutable.js](https://immutable-js.github.io/immutable-js/docs/#/List/isSubset)
-   [Variadic tuple types by ahejlsberg · Pull Request #39094 · microsoft/TypeScript](https://github.com/microsoft/TypeScript/pull/39094) <!-- cspell:disable-line -->
-   [type-challenges/type-challenges](https://github.com/type-challenges/type-challenges)
