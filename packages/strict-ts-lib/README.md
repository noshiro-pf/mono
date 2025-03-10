# Stricter TypeScript standard type definitions

## Introduction

This is a library to replace the TypeScript standard library (such as `lib.es5.d.ts`) with a more type-safe one.

TypeScript の標準型定義（`lib.es5.d.ts` など）をより厳格にしたものを提供するライブラリです。

例えば通常の型定義に含まれる以下のような pitfall を潰すことができます。

-   `JSON.parse()` の結果が `any` 型であるために任意の操作ができてしまう。
-   型注釈無しで `new Map()` として作成した `Map` インスタンスが `Map<any, any>` 型となってしまうために、任意の key value を気づかずに追加できてしまう。
-   Array の `filter` メソッドに渡す predicate の返り値が `boolean` ではなく `unknown` が許容されている。
-   `Exclude<A, B>` 型や `Omit<A, B>` 型の第2引数 `B` が `A` の部分型に制限されていない。このため `A` や `B` が変わった時に何もしない型になってしまっても気づきづらい。

## Features

Some additional features and type definition changes are listed below:

-   [ts-type-utils](https://github.com/noshiro-pf/mono/blob/main/packages/ts-type-utils) の型定義がデフォルトでグローバルに使えるようになります。
    -   `DeepReadonly<T>` `T` を再帰的に readonly にした型にする
    -   `NonEmptyArray<T>` = `readonly [T, ...T[]]`
    -   `ArrayAtLeastLen<N, T>`
        -   `ArrayAtLeastLen<2, number>` = `readonly [number, number, ...number[]]`
    -   `HTTPRequestMethod`
    -   など
-   `Record` 型を readonly にしました。
    -   元の mutable な型が必要な場合は `MutableRecord` をグローバルに使用できます。
-   `Object.keys` でより詳しい結果の型が得られます。
    -   [test/object-keys.mts](https://github.com/noshiro-pf/mono/blob/main/packages/strict-ts-lib/output/5.7.2/normal/test/object-keys.mts)
-   `Object.fromEntries` でより詳しい結果の型が得られます。
    -   [test/object-from-entries.mts](https://github.com/noshiro-pf/mono/blob/main/packages/strict-ts-lib/output/5.7.2/normal/test/object-from-entries.mts)
-   `Object.entries` でより詳しい結果の型が得られます。
    -   [test/object-entries.mts](https://github.com/noshiro-pf/mono/blob/main/packages/strict-ts-lib/output/5.7.2/normal/test/object-entries.mts)
-   `Object.hasOwn` により型の絞り込みができるようになります。
    -   [test/object-has-own.mts](https://github.com/noshiro-pf/mono/blob/main/packages/strict-ts-lib/output/5.7.2/normal/test/object-has-own.mts)
-   `Date` のメソッド `getHours` 呼び出し結果が `number` ではなく `0 | 1 | ... | 23` になります。
-   `Array` メソッド `includes` や `Map`/`Set` メソッド `has` にその collection の型より広い型を渡せるようになります。
    -   [test/collections.mts](https://github.com/noshiro-pf/mono/blob/main/packages/strict-ts-lib/output/5.7.2/normal/test/collections.mts)

## Related works

-   https://github.com/uhyo/better-typescript-lib
-   https://github.com/total-typescript/ts-reset

## Change differences for each lib file

https://github.com/noshiro-pf/mono/blob/main/packages/strict-ts-lib/output/5.7.2/normal/diff

## Implementation

本ライブラリでは一旦愚直な文字列置換により lib ファイルを変換しています。
TypeScript アップデート時に lib ファイルが変わることで正規表現にマッチしなくなり無視されてしまう置換があったら検知できるように、 `replaceWithNoMatchCheck` というユーティリティを用意して使っています。
同等のチェックは維持しつつ AST 操作を使うように書き換える予定です。

https://astexplorer.net/
