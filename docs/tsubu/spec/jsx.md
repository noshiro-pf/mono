# JSX

## 規則

- **JSX は使う(確定 2026-08-27)。**
- **拡張子は v2 で 1 つだけ新設し、常時 JSX 文法とする(確定 2026-08-29 — D-11)。** `.ts` / `.tsx` の分離は文法の曖昧性(`.ts` の angle-bracket 型アサーション `<T>x`、arrow ジェネリクス `<T>(...)`)が原因だが、この言語は angle-bracket アサーションを文法から除去し、arrow ジェネリクスに `<T,>` を強制するため、単一の JSX 込み文法に曖昧性が残らない。v1 は合法 TS なので従来どおり `.mts` / `.tsx` を使う。
- **angle-bracket 型アサーション(`<T>x`)は禁止(確定)。** 型アサーションは `as` 形のみ(unsafe なものはそもそも禁止 — [banned-syntax.md](./banned-syntax.md))。v2 で文法から除去する前提。
- **arrow function のジェネリクスには `<T,>` の trailing comma を強制する(確定)。** TS 自身が `.tsx` で suggest する回避策(`<T,>` または `<T extends unknown>`)のうち **`<T,>` に統一**し、拡張子によらず常に強制する。ファイルの種類で書き方が変わらないことを優先し、v2 の単一拡張子移行を機械的にする。
- 条件描画は `cond ? <X /> : undefined`(短絡評価の禁止 — [booleans-and-logic.md](./booleans-and-logic.md))。
- JSX 内で式を隣接させた文字列連結(`<div>{x}{y}</div>`)は禁止し、template literal(`<div>{`${x}${y}`}</div>`)を使う(現行 lint 運用)。

## TS へ戻るときの影響

なし(`<T,>` は合法 TS であり、`.ts` でも valid)。

## フォーマッタ互換(検証済み 2026-08-31)

`const identity = <T,>(x: T): T => x;` を Prettier(`.mts` / `.tsx` の両方)と oxfmt に通し、**いずれも trailing comma を保持する**ことを実測確認した。`<T,>` 常時強制の成立条件はクリア。

## 未解決の論点

- JSX の対象ランタイム(React 前提か、`jsx: react-jsx` を固定するか — [compiler-options.md](./compiler-options.md) は現状 `react-jsx`)。
- 現行 eslint-config-typed の React/JSX ルール群(props spread 禁止、inline 関数/オブジェクト回避、a11y 等)のどこまでを「言語仕様」に昇格させ、どこからを「スタイル規定」に留めるか。
