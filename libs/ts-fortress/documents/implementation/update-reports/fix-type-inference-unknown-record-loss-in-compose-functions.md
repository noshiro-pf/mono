# Fix: `& UnknownRecord` が合成関数で消失する問題の修正

## 問題

`record()` で定義した型は `excessProperty: 'allow'`（デフォルト）の場合 `V & UnknownRecord` 型を持つが、
`array()` 等の合成関数に渡すと `& UnknownRecord` が消失していた。

### 再現例

```ts
const Edge = record({ from: Point, to: Point });
type Edge = TypeOf<typeof Edge>;
// → Readonly<{ from: ...; to: ... }> & UnknownRecord  ✅

const Edges = array(Edge);
type Edges = TypeOf<typeof Edges>;
// 修正前: readonly Readonly<{ from: ...; to: ... }>[]          ← & UnknownRecord が消失 ❌
// 修正後: readonly (Readonly<{ from: ...; to: ... }> & UnknownRecord)[]  ✅
```

## 原因

`RecordType<S, 'allow'>` は以下の型構造を持つ：

| プロパティ     | 返り値の型                |
| -------------- | ------------------------- |
| `cast`         | `V & UnknownRecord`       |
| `is`           | `V & UnknownRecord`       |
| `validate`     | `V & UnknownRecord`       |
| `fill`         | `V`（UnknownRecord なし） |
| `defaultValue` | `V`（UnknownRecord なし） |

`array<A>(elementType: Type<A>)` に渡すと、TypeScript は `A` を全ての covariant positions から推論する。
`V & UnknownRecord`（cast, is, validate）と `V`（fill, defaultValue）の候補を union すると
`V | (V & UnknownRecord)` = `V` となり、`& UnknownRecord` が消える。

## 解決方針

### 採用した方針: `T extends Type<unknown>` + `TypeOf<T>` パターン

型パラメータを `Type<A>` から推論する代わりに、`T extends Type<unknown>` で Type オブジェクト全体をキャプチャし、
`TypeOf<T>`（= `ReturnType<T['cast']>`）で `cast` の返り値型のみから要素型を抽出する。

```ts
// Before
export const array = <A,>(elementType: Type<A>): Type<readonly A[]> => { ... };

// After
export const array = <ET extends Type<unknown>>(elementType: ET): Type<readonly TypeOf<ET>[]> => { ... };
```

`TypeOf<T>` は `ReturnType<T['cast']>` として定義されているため、`cast` のみから型を取得し、
`fill`/`defaultValue` の影響を受けない。

### 不採用の方針

- **`RecordType` の `fill`/`defaultValue` も `V & UnknownRecord` を返す**: `fill` が「shape 定義から exact な値を構築する」設計意図に反する
- **`NoInfer` の利用**: `RecordType` は既に計算済みの型であり、`NoInfer` は構造的型マッチングの推論サイトには効かない

## 変更ファイル一覧

### ソースコード修正（6ファイル）

| ファイル                              | 関数                 | 変更内容                                                                   |
| ------------------------------------- | -------------------- | -------------------------------------------------------------------------- |
| `src/array/array.mts`                 | `array`              | `<A>` → `<ET extends Type<unknown>>`, 返り値 `Type<readonly TypeOf<ET>[]>` |
| `src/array/non-empty-array.mts`       | `nonEmptyArray`      | 同上パターン, `Type<NonEmptyArray<TypeOf<ET>>>`                            |
| `src/array/array-at-least-length.mts` | `arrayAtLeastLength` | 同上パターン, `Type<ArrayAtLeastLen<N, TypeOf<ET>>>`                       |
| `src/array/array-of-length.mts`       | `arrayOfLength`      | 同上パターン, `Type<ArrayOfLength<N, TypeOf<ET>>>`                         |
| `src/predefined/nullable.mts`         | `nullable`           | `<T>` → `<T extends Type<unknown>>`, 返り値 `Type<TypeOf<T> \| undefined>` |
| `src/other-types/recursion.mts`       | `recursion`          | `<A>` → `<ET extends Type<unknown>>`, 返り値 `Type<TypeOf<ET>>`            |

### テスト修正（1ファイル）

| ファイル                      | 変更内容                                                   |
| ----------------------------- | ---------------------------------------------------------- |
| `test/named-records.test.mts` | `TypeOf<typeof Edges>` の期待型に `& UnknownRecord` を追加 |

### 修正不要だった関数（既に安全なパターンを使用）

| ファイル                          | 関数             | 理由                                                                 |
| --------------------------------- | ---------------- | -------------------------------------------------------------------- |
| `src/compose/union.mts`           | `union`          | `const Types extends NonEmptyArray<Type<unknown>>` + `TypeOf` を使用 |
| `src/compose/intersection.mts`    | `intersection`   | 同上                                                                 |
| `src/array/tuple.mts`             | `tuple`          | `const A extends readonly Type<unknown>[]` + `TypeOf` を使用         |
| `src/other-types/set.mts`         | `SetType`        | `T extends Type<unknown>` + `TypeOf<T>` を使用                       |
| `src/other-types/map.mts`         | `MapType`        | `K extends Type<unknown>, V extends Type<unknown>` を使用            |
| `src/record/optional.mts`         | `optional`       | `T extends Type<unknown>` を使用                                     |
| `src/record/key-value-record.mts` | `keyValueRecord` | bounded generics を使用                                              |
| `src/brand/brand.mts`             | `brand`          | Primitive 制約付きのため問題なし                                     |
| `src/other-types/refine.mts`      | `refine`         | Primitive 制約付きのため問題なし                                     |

## 内部実装の注意点

`elementType` が `T extends Type<unknown>` 型の場合、`elementType.fill(e)` の返り値は `unknown` になる
（`Type<unknown>` の `fill` は `(a: unknown) => unknown`）。
そのため内部実装では `as unknown as T` 等の型アサーションが必要になるが、
これは既存コードでも `a as T`（validate 内）として使われているパターンであり、許容範囲。

公開 API の型安全性は向上し、内部の型アサーションは実装詳細に閉じている。

## 検証結果

- `npx tsc --noEmit`: パス
- `npx vitest run --project 'Node.js'`: 86 テストファイル, 1302 テスト 全パス
