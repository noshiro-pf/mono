# 関数

## 規則

- **arrow function に統一する(確定 2026-08-27)。** `function` 式・宣言は原則禁止で、例外は 2 つ: **オーバーロードシグネチャを伴う `function` 宣言**(D-13、下記)と **generator(`function*`)**(D-18)。
- **`arguments` は禁止(確定)。** rest パラメータで代替。
- **`this` は全面禁止(確定 2026-08-29)。** class の全面禁止(D-12 — [classes.md](./classes.md))に伴い、「class 内のみ許可」の条項は消滅した。`arguments` と `this` を禁止した状態では、named function と arrow function の安全性の差はほぼ無い — これが D-13 のオーバーロード時 named function 許容の前提でもある。
- **async/await は残す(確定)。** 非同期は言語の一級市民。エラーを持つ非同期は `Promise<Result<S, E>>`(将来的には `ResultAsync` 相当 — [stdlib.md](./stdlib.md) ★★★)と組み合わせる。
- **generator(`function*` / `async function*`)は許可(確定 2026-08-29 — D-18。当初の禁止を撤回)。** arrow に generator 形が存在しないため、`function*` の宣言・式は D-13 の例外として常に合法(オーバーロード不要)。`Result.safeTry(function* () { ... })` をユーザーコードで書くための実際上の必要もある。
- **識別子 `fn` は予約(確定 2026-08-29 — D-17)。** Sumi sugar の関数宣言キーワードとして採用が決まったため、Sumi lint から宣言名としての使用を禁止する(プロパティ名は対象外)。

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

**決定**: オーバーロードを許容し、**named function は「オーバーロードシグネチャを伴う場合のみ」合法**とする。チェッカーは「オーバーロードシグネチャを伴わない `function` 宣言」を拒否する条件付き許可ルールを実装し、**記法の一意性**(同じものを書く方法が 1 つ)を担保する。既存 lint(`prefer-arrow-functions` / `func-style`)ではこの条件付き許可を表現できないため、Sumi lint の新規実装ルールになる。

**実装済み**(`sumi/prefer-arrow-function`、中立 ID `functions/prefer-arrow-function`)。同名の `TSDeclareFunction` が兄弟にあるかを見て条件付きで許可し、`export` で包まれた形も辿る。generator は無条件で許可(D-18)。コーパスの `functions/prefer-arrow-function/valid/arrow-overload-generator.mts` が export 付きオーバーロードと generator を固定している。

なお `func-style` が mono で off になっている理由が「オーバーロードでの誤検出」だったことは、この論点の実在の実運用側の裏付けである([enforcement-map.md](../enforcement-map.md))。

## TS へ戻るときの影響

なし。

## 決定済みの論点(2026-09-06 — D-42)

- **関数の明示的戻り値型は強制**する(`explicit-function-return-type`、現行 lint 運用の追認)。
- default 引数・分割代入引数は **TS 通り許可**(制限しない)。

## 未解決の論点

- **オーバーロードの書き方が 2 つある(2026-09-09、ts-std-forge の `panic` で判明)。** D-13 は named function 宣言を「オーバーロードを書く手段」として許可したが、**arrow でオーバーロードを書く道を塞いでいない**。呼び出しシグネチャを並べたオブジェクト型を注釈にすれば書けてしまう:

    ```ts
    // (1) named function 宣言 — D-13 が想定した形
    export function panic(message: string): never;
    export function panic(error: Error): never;
    export function panic(reason: Error | string): never {
        /* ... */
    }

    // (2) 呼び出しシグネチャのオブジェクト型を注釈した arrow — 現在どのルールも禁止していない
    export const panic: {
        (message: string): never;
        (error: Error): never;
    } = (reason: Error | string): never => {
        /* ... */
    };
    ```

    D-13 の目的が**記法の一意性**である以上、(2) を放置するのはその目的に反する。どちらを正典にするか、あるいは (2) をどこまで許すかが未決。

- **(2) には具体的な危険がある。** `Readonly<T>` などの mapped type は**プロパティだけを写す**ので、呼び出しシグネチャしか持たないオブジェクト型を包むと**呼び出し可能性が黙って消える**。`Readonly<{ (x: string): never }>` は呼べない型になり、利用側が `TS2349: This expression is not callable` になる。実際に mono の `convert-to-readonly` codemod が (2) の注釈を自動で `Readonly<...>` に包み、`panic` を 1 コミットのあいだ壊した(codemod 側の欠陥として [noshiro-pf/mono#1881](https://github.com/noshiro-pf/mono/issues/1881) に記録。型検査を codemod の前に走らせていると緑のまま通る)。(1) にはこの危険が無い。

- **推奨は (1) を正典として (2) を禁止すること。** 「関数値の型注釈に呼び出しシグネチャを持つオブジェクト型リテラルを書かない」という構文ルールで表せる。ただし呼び出しシグネチャとプロパティを併せ持つ型(関数オブジェクト)を扱う道を同時に塞ぐので、その必要性と併せて決める。
