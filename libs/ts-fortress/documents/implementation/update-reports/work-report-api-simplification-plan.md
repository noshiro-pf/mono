# Plan Discussion Report: Simplify Public API — Hide RecordType Internals (2026/03/17)

## 背景・問題提起

ユーザーから以下の課題が提起された:

1. **`RecordType<S, EP>` のアノテーションが不便**: `Type<{x: number}>` のように値の型で書きたいが、`RecordType<{x: Type<number>}, 'allow'>` のように shape 型を渡す必要がある
2. **`Type<A>` と `RecordType` の違いをユーザーが意識する場面が限定的**: 主に (a) `mergeRecords` の引数が `RecordType[]` 制約、(b) `defaultValue`/`fill` と他の関数で `UnknownRecord` の有無が異なる点
3. **内部プロパティの公開**: `shape`, `excessProperty`, `optional` がユーザーに見えている
4. **`shape` は実装の都合で追加したもの**: 内部実装で型ガードにより必要時に取り出す方式にできる
5. **`excessProperty` も同様**: `& UnknownRecord` を付加しない方針にすれば、内部で取り出す方式に統一可能

## 検討プロセス

### 質問1: `& UnknownRecord` の除去

**提案**: Phase 1 で `RecordTypeHelper` の `'allow'` 分岐から `& UnknownRecord` を除去。`is()` の narrowing 結果が exact type になる。

**ユーザー回答**: **除去する**。

**結論**: `excessProperty` はランタイム動作のみに影響し、型レベルでは `'allow'`/`'reject'` の区別がなくなる。`TypeOf` = `ExactTypeOf` になり API がシンプルに。

### 質問2: `RecordTypeTag`（phantom branded type）の公開範囲

**提案**: 3つの選択肢を提示。

1. 公開する — ユーザーが `Type<V> & RecordTypeTag<S, EP>` と書ける
2. 非公開にする — ユーザーは `typeof record(...)` の推論結果のみ使用
3. `RecordType` エイリアスとして公開 — 既存コードとの互換性維持

**ユーザー質問**: 「RecordTypeTag (phantom branded type) とは何を指しているか？」

**説明**:

- ランタイムには存在しない unique symbol をキーとした型プロパティ
- `Type<V>` に `& RecordTypeTag<S, EP>` を intersection することで、ユーザーからは `Type<V>` に見えつつ、composition 関数は conditional type で `S`（shape）と `EP` を抽出可能
- ランタイムでは通常通り `shape`, `excessProperty` を通常プロパティとして持ち、内部コードは型キャストでアクセス

**ユーザー回答**: まず `RecordInternals` symbol による案を実装し、不満があれば `Type<V>` のみ案に切り替える。

### 追加要望

ユーザーから plan 策定の議事録を report として出力するよう要望。

## 決定事項

| 項目                      | 決定                                                   |
| ------------------------- | ------------------------------------------------------ |
| `& UnknownRecord`         | 除去する                                               |
| `ExactTypeOf`             | `TypeOf` のエイリアスに（deprecated）                  |
| `optional` プロパティ     | symbol ベースに隠蔽                                    |
| `shape`, `excessProperty` | phantom branded type (`RecordInternals` symbol) で隠蔽 |
| `RecordTypeTag` の公開    | まず公開で実装、不満があれば非公開に切り替え           |
| 実装順序                  | Phase 1 → 2 → 3 の段階的実施                           |

## 実装計画概要

### Phase 1: `& UnknownRecord` 除去

- `RecordTypeHelper` 簡素化（両分岐とも `Type<V> & { shape, excessProperty }`）
- `ExactTypeOf` → `TypeOf` エイリアス化
- 全テストから `& UnknownRecord` 除去

### Phase 2: `optional` の symbol 隠蔽

- `OptionalMarker: unique symbol` 導入
- `Type<A>` から `optional?: true` 除去
- `isOptionalProperty()` を symbol ベースに

### Phase 3: `shape`/`excessProperty` の phantom branded type 隠蔽

- `RecordInternals: unique symbol` + `RecordTypeTag<S, EP>` 導入
- `record()` 戻り値を `Type<V> & RecordTypeTag<S, EP>` に
- composition 関数は `ExtractShape<T>`, `ExtractEP<T>` で型情報を抽出
- ランタイムは現状維持（通常プロパティ + 型キャスト）

## 参照ファイル

- 現行 type 定義: `src/type.mts`
- 現行 record 実装: `src/record/record.mts`
- 現行 optional 実装: `src/record/optional.mts`
- 現行 merge-records 実装: `src/record/merge-records.mts`
- composition 関数: `src/record/pick.mts`, `omit.mts`, `partial.mts`, `required.mts`, `keyof.mts`, `valueof.mts`
