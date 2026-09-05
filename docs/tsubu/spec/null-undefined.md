# null の排除

## 目標

「値がない」ことの表現を v1 では `undefined` に一本化し、`null` をユーザーコードから排除する。**最終目標は `{null, undefined}` → `Optional<T>` の一本化**で、`undefined` もユーザーコードの宣言型から排除する(D-31 — 段階導入。`undefined` の排除は ts-std-forge の Optional ラッパー層が揃った v2 以降)。外部 API が返す `null` / `undefined` の変換には実行時の変換処理が必要なため、**完全統一は v1 では不可能**(後述)。

## v1 の規則(確定 2026-09-05 — D-27)

- ユーザーコードで `null` リテラルを書くことを禁止(`unicorn/no-null` 相当)。
- ユーザーコードの型宣言(引数、戻り値、プロパティ、type alias)に `null` 型を含めることを禁止。
- 外部 API(DOM、`RegExp.prototype.exec`、`JSON.parse` の結果、外部ライブラリ)から `null` を含む型を受け取った場合、**受け取った式の直後で `undefined` に正規化**してから先へ流す:

```ts
// ✅ 境界での即時正規化
const el = document.querySelector('.foo') ?? undefined;
const m = /(\d+)/u.exec(s) ?? undefined;

// ❌ null を含む型のまま変数・引数・戻り値へ流す
const el2 = document.querySelector('.foo'); // Element | null が伝播する
```

- 外部 API へ `null` を渡す必要がある場合(`JSON.stringify` の replacer、React の `useRef(null)` 等)は **ts-std-forge のラッパーで吸収**する(D-32)。ユーザーコードに `null` の字面は現れない。
- `null` との比較による narrowing(`if (x !== null)`)は、正規化を行う式の内部でのみ許可。

`?? undefined` は `null` という字面を書かずに正規化できるため、v1 の標準イディオムとする。ts-data-forge の `Optional.fromNullable` も正規化手段になる(null/undefined 両方を `None` に潰す)。

## チェッカーでの検出方法(v1 実装ノート)

構文だけでは「型に null が含まれるか」は分からないため、これは型情報を使う lint になる:

1. `null` リテラル・`null` 型キーワードの出現を禁止(構文レベル、`unicorn/no-null`)。
2. 宣言(変数・引数・戻り値・プロパティ)の型に `null` が含まれたらエラー(型情報レベル。typescript-eslint の type-aware rule として実装)。

(2) により、外部 API の戻り値は「宣言に入れられない」ので式の場で潰すしかなくなり、境界正規化が強制される。

## なぜ完全統一は transpiler + ランタイムが必要か

- **transpiler だけでも足りない。** `document.querySelector` が `null` を返す事実は実行時の挙動であり、構文変換では消えない。すべての境界呼び出しに `?? undefined` を自動挿入するには、「どの式が外部境界か」を型情報から判定して変換する transpiler(v2)に加え、コールバック経由で入ってくる `null`(例: 外部ライブラリが callback に null を渡す)にはラッパー層(ランタイム)が要る。
- 段階案: v1 = 上記の手動正規化の強制 → v2 = transpiler が戻り値位置の `?? undefined` を自動挿入(ユーザーの字面からは null が完全に消える)→ v3(未定)= 標準ライブラリのラッパー層で callback 境界も潰す → ts-std-forge の Optional ラッパー層が揃った段階で `undefined` も宣言型から排除し `Optional<T>` へ一本化(D-31)。

## 標準ライブラリとの関係

strict-ts-lib が組み込み API の型をどこまで null → undefined 側に寄せられるかは、**型は実行時の真実を記述しなければならない**という制約がある(`querySelector` の型から null を消しても実行時には null が来る)ので、型の差し替えでは解決しない。解決はあくまで境界正規化(v1: 手動 / v2+: 自動)による。

## TS へ戻るときの影響

なし。`?? undefined` イディオムは合法 TS であり、null を排した型はそのまま TS でも有効。

## 決定済みの論点(2026-09-05)

- `undefined` と「プロパティ不存在」は型レベルでは**区別しない**(`exactOptionalPropertyTypes` は有効化しない — [compiler-options.md](./compiler-options.md))。`{ x?: T }` と `{ x: T | undefined }` の使い分けにスタイル規定は**置かない**(D-31)。
- 外部 API へ `null` を渡す必要がある場合は ts-std-forge のラッパーで吸収する(D-32)。
- `Optional<T>` と `T | undefined` の使い分け: v1 では指針を置かず、最終的に `Optional<T>` へ向かう方向性のみを記述する(D-31)。ラッパー層が揃った時点で規則化する。
