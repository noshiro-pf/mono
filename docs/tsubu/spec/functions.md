# 関数

## 規則

- **arrow function に統一する(確定 2026-08-27)。** `function` 式・宣言は原則禁止で、例外は 2 つ: **オーバーロードシグネチャを伴う `function` 宣言**(D-13、下記)と **generator(`function*`)**(D-18)。
- **`arguments` は禁止(確定)。** rest パラメータで代替。
- **`this` は全面禁止(確定 2026-08-29)。** class の全面禁止(D-12 — [classes.md](./classes.md))に伴い、「class 内のみ許可」の条項は消滅した。`arguments` と `this` を禁止した状態では、named function と arrow function の安全性の差はほぼ無い — これが D-13 のオーバーロード時 named function 許容の前提でもある。
- **async/await は残す(確定)。** 非同期は言語の一級市民。エラーを持つ非同期は `Promise<Result<S, E>>`(将来的には `ResultAsync` 相当 — [stdlib.md](./stdlib.md) ★★★)と組み合わせる。
- **generator(`function*` / `async function*`)は許可(確定 2026-08-29 — D-18。当初の禁止を撤回)。** arrow に generator 形が存在しないため、`function*` の宣言・式は D-13 の例外として常に合法(オーバーロード不要)。`Result.safeTry(function* () { ... })` をユーザーコードで書くための実際上の必要もある。
- **識別子 `fn` は予約(確定 2026-08-29 — D-17)。** v2 の関数宣言キーワードとして採用が決まったため、v1 から宣言名としての使用を禁止する(プロパティ名は対象外)。

## オーバーロードと named function(確定 2026-08-29 — D-13)

arrow function ではオーバーロードの宣言が書きづらい。型としては call signature の交差で表現できるが、実装側の型付けが緩くなりがち:

```ts
type F = {
    (a: string): string;
    (a: number): number;
};
// 実装シグネチャを個別に検査できず、内部で widening が必要になる
const f: F = (a: string | number): string | number =>
    typeof a === 'string' ? a : a;
```

named function 宣言なら実装シグネチャとオーバーロードシグネチャを言語機能として書ける。

**決定**: オーバーロードを許容し、**named function は「オーバーロードシグネチャを伴う場合のみ」合法**とする。チェッカーは「オーバーロードシグネチャを伴わない `function` 宣言」を拒否する条件付き許可ルールを実装し、**記法の一意性**(同じものを書く方法が 1 つ)を担保する。既存 lint(`prefer-arrow-functions` / `func-style`)ではこの条件付き許可を表現できないため、v1 の新規実装ルールになる(中立ルール ID 候補: `functions/function-declaration-requires-overload`)。

なお `func-style` が mono で off になっている理由が「オーバーロードでの誤検出」だったことは、この論点の実在の実運用側の裏付けである([enforcement-map.md](../enforcement-map.md))。

## TS へ戻るときの影響

なし。

## 未解決の論点

- default 引数・分割代入引数の制限(現状は TS 通り許可の想定)。
- 関数の明示的戻り値型の強制(`explicit-function-return-type` — 現行 lint 運用の明文化)。
