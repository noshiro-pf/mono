# 変数宣言と mutation

## 目標

デフォルトは不変。mutation は不可能にはしないが、**明示的なマーカーを付けた場合のみ**許可する(ReScript の `let mut` くらいのバランス)。

## v1 の規則(確定 2026-09-05 — D-27)

- `var` は禁止([banned-syntax.md](./banned-syntax.md))。
- `const` がデフォルト。
- `let` は変数名が `mut_` prefix を持つ場合のみ許可: `let mut_count = 0;`
- オブジェクト・配列の破壊的変更(`functional/immutable-data` が検出する操作)も、対象の変数名が `mut_` prefix を持つ場合のみ許可: `mut_xs[0] = 100;`
- 引数・戻り値は readonly 型を強制([readonly.md](./readonly.md))。

これは eslint-config-typed の現行運用(`functional/no-let` + `functional/immutable-data` + `mut_` prefix 慣習)を土台にするが、**prefix は `mut_` の一種類のみとする(確定 2026-08-29 — D-14)**。現行 lint が許容する variant はすべて廃止する:

- `_mut_*` — `_` prefix は unused parameter 用だが、使わない引数は readonly のままで問題なく、可変で無視する `_mut_*` に存在意義がない。
- `#mut_*` — class の private フィールド用だが、class 全面禁止(D-12)で出現余地がない。
- `draft`(immer)— `mut_draft` を強制する。

v1 チェッカーの `ignoreIdentifierPattern` は `^mut_` のみになる(現行 config からの変更点 — [enforcement-map.md](../enforcement-map.md))。

## 外部コードとの境界(確定 2026-09-05 — D-27)

外部ライブラリのコードは `mut_` prefix 規約を持たない。この規則が縛るのは**この言語のコードが宣言する識別子名**であって外部 API の名前ではない、と定義することで破綻を避ける:

- **外部から得た mutable オブジェクトを変更する場合**: ローカル束縛の名前を `mut_` にして受ける(`const mut_buf = lib.createBuffer();` → `mut_buf` への破壊的操作は合法)。変数名は常に自分のコード側にあるので、外部コードが prefix を持たないこと自体は問題にならない(`functional/immutable-data` の現行運用と同じ)。
- **本当の摩擦は readonly 側**([readonly.md](./readonly.md)): 外部 API が `T[]` など mutable 型の引数を要求すると、readonly 強制下の自分の値は型が合わない。ts-data-forge の `castMutable`(`T` → `Mutable<T>`)を**境界での明示エスケープ**として位置づける。「実際には変更しない API が型だけ mutable を要求している」場合の安全弁であり、変更される可能性がある場合はコピーを渡す。
- **外部関数が引数を破壊的に変更する場合**(in-place sort 等): 渡す前にコピーする(`toSorted` / spread)を標準イディオムとする。

## `mut_` prefix は「識別子空間に埋め込まれた構文」である

`let mut x` という構文は TS サブセットにならない。そこで v1 では mutability マーカーを識別子名にエンコードする。これは [decisions.md](../decisions.md) D-3 の適用例で、次の条件を満たすことを確認しておく:

- **v2 への機械的移行**: `let mut_x` → `let mut x`(宣言と全参照から `mut_` を除去)。識別子のリネームは AST 上の機械的操作であり、codemod で閉じる。
- **逆方向(eject)**: そもそも合法 TS なので変換不要。`mut_` prefix は TS の世界でも「この変数は変更される」という有益な情報として読める。

## v2 での構文(`let` のみに統一 — 確定 2026-08-27)

```text
let x = 0;        // 不変束縛(TS の const に transpile)
let mut x = 0;    // 可変束縛(TS の let mut_x に transpile — D-35。eject 出力が v1 規則を満たす)
```

独自構文を導入するなら `let` のみに統一する(ReScript/Rust 風。`const` キーワードは v2 の具象構文から除去)。TS との字面差分は増えるが、宣言キーワードの transpile(`let` → `const` / `let mut` → `let`)は機械的で eject 品質を損なわない。

## 強制手段

- v1: `functional/no-let`(`mut_` prefix 例外付き)、`functional/immutable-data`、`prefer-const`。

## TS へ戻るときの影響

なし(合法 TS のまま)。

## `for` ループのカウンタ変数(確定 2026-08-27)

- 基本は ts-data-forge の `range` を prelude 化し([stdlib.md](./stdlib.md))、`for (const i of range(0, n))` を強制する。
- 例外的なユースケース(パフォーマンスが効く hot loop 等)では可変カウンタを許可する: v1 は `for (let mut_i = 0; ...)`、v2 は `for (let mut i = 0; ...)`。インクリメントは `++` ではなく `+= 1`([banned-syntax.md](./banned-syntax.md))。

## 未解決の論点

- 引数名・プロパティ名への `mut_` prefix の適用範囲(現行 monorepo 運用の明文化)。
- **global 定義名の shadow は禁止に確定**(D-19 — `undefined` / `NaN` / 組み込みオブジェクト / global 型名を宣言名に使えない。[banned-syntax.md](./banned-syntax.md))。ユーザー変数同士の shadowing は、現行 config(`@typescript-eslint/no-shadow` の `hoist: 'all'`)が既に全面禁止していることが判明(2026-08-31)。現行運用の追認として**全面禁止に確定**(2026-09-05 — D-27)。
