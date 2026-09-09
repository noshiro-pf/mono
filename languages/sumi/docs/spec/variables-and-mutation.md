# 変数宣言と mutation

## 目標

デフォルトは不変。mutation は不可能にはしないが、**明示的なマーカーを付けた場合のみ**許可する(ReScript の `let mut` くらいのバランス)。

## Sumi lint の規則(確定 2026-09-05 — D-27)

- `var` は禁止([banned-syntax.md](./banned-syntax.md))。
- `const` がデフォルト。
- `let` は変数名が `mut_` prefix を持つ場合のみ許可: `let mut_count = 0;`
- オブジェクト・配列の破壊的変更(`functional/immutable-data` が検出する操作)も、対象の変数名が `mut_` prefix を持つ場合のみ許可: `mut_xs[0] = 100;`
- 引数・戻り値は readonly 型を強制([readonly.md](./readonly.md))。

これは eslint-config-typed の現行運用(`functional/no-let` + `functional/immutable-data` + `mut_` prefix 慣習)を土台にするが、**prefix は `mut_` の一種類のみとする(確定 2026-08-29 — D-14)**。現行 lint が許容する variant はすべて廃止する:

- `_mut_*` — `_` prefix は unused parameter 用だが、使わない引数は readonly のままで問題なく、可変で無視する `_mut_*` に存在意義がない。
- `#mut_*` — class の private フィールド用だが、class 全面禁止(D-12)で出現余地がない。
- `draft`(immer)— `mut_draft` を強制する。

Sumi lint チェッカーの `ignoreIdentifierPattern` は `^mut_` のみになる(現行 config からの変更点 — [enforcement-map.md](../enforcement-map.md))。

## 外部コードとの境界(確定 2026-09-05 — D-27)

外部ライブラリのコードは `mut_` prefix 規約を持たない。この規則が縛るのは**この言語のコードが宣言する識別子名**であって外部 API の名前ではない、と定義することで破綻を避ける:

- **外部から得た mutable オブジェクトを変更する場合**: ローカル束縛の名前を `mut_` にして受ける(`const mut_buf = lib.createBuffer();` → `mut_buf` への破壊的操作は合法)。変数名は常に自分のコード側にあるので、外部コードが prefix を持たないこと自体は問題にならない(`functional/immutable-data` の現行運用と同じ)。
- **本当の摩擦は readonly 側**([readonly.md](./readonly.md)): 外部 API が `T[]` など mutable 型の引数を要求すると、readonly 強制下の自分の値は型が合わない。ts-data-forge の `castMutable`(`T` → `Mutable<T>`)を**境界での明示エスケープ**として位置づける。「実際には変更しない API が型だけ mutable を要求している」場合の安全弁であり、変更される可能性がある場合はコピーを渡す。
- **外部関数が引数を破壊的に変更する場合**(in-place sort 等): 渡す前にコピーする(`toSorted` / spread)を標準イディオムとする。

## `mut_` prefix は「識別子空間に埋め込まれた構文」である

`let mut x` という構文は TS サブセットにならない。そこで Sumi lint では mutability マーカーを識別子名にエンコードする。これは [decisions.md](../decisions.md) D-3 の適用例で、次の条件を満たすことを確認しておく:

- **Sumi sugar への機械的移行**: `let mut_x` → `let mut x`(宣言と全参照から `mut_` を除去)。識別子のリネームは AST 上の機械的操作であり、codemod で閉じる。
- **逆方向(eject)**: そもそも合法 TS なので変換不要。`mut_` prefix は TS の世界でも「この変数は変更される」という有益な情報として読める。

## Sumi sugar での構文(`let` のみに統一 — 確定 2026-08-27)

```text
let x = 0;        // 不変束縛(TS の const に transpile)
let mut x = 0;    // 可変束縛(TS の let mut_x に transpile — D-35。eject 出力が Sumi lint 規則を満たす)
```

独自構文を導入するなら `let` のみに統一する(ReScript/Rust 風。`const` キーワードは Sumi sugar の具象構文から除去)。TS との字面差分は増えるが、宣言キーワードの transpile(`let` → `const` / `let mut` → `let`)は機械的で eject 品質を損なわない。

## 強制手段

- Sumi lint: `functional/no-let`(`mut_` prefix 例外付き)、`functional/immutable-data`、`prefer-const`。

## TS へ戻るときの影響

なし(合法 TS のまま)。

## `for` ループのカウンタ変数(確定 2026-08-27)

- 基本は ts-data-forge の `range` を prelude 化し([stdlib.md](./stdlib.md))、`for (const i of range(0, n))` を強制する。
- 例外的なユースケース(パフォーマンスが効く hot loop 等)では可変カウンタを許可する: Sumi lint は `for (let mut_i = 0; ...)`、Sumi sugar は `for (let mut i = 0; ...)`。インクリメントは `++` ではなく `+= 1`([banned-syntax.md](./banned-syntax.md))。

## 未解決の論点

- 引数名・プロパティ名への `mut_` prefix の適用範囲(現行 monorepo 運用の明文化)。
- **未初期化の変数は許可しない(2026-09-09、ユーザー決定 — issue #1753 のコメント)。** 宣言は必ず初期化子を持つ。「まだ値が無い」ことは `undefined` または `Optional.none` を**明示的に書く**ことで表す。`let mut_x;` のように初期化子を省いた宣言は書けない。
    - **帰結: `??=` は不要になる。** `x ??= v` の用途は「まだ初期化されていない変数に値を入れる」であり、初期化が必ず宣言と同時に起きるならこの操作の居場所が無い。D-29 は 3 つの論理代入をすべて許可したが、その根拠のうち `??=` の分は消える(`&&=` / `||=` の boolean 限定はそのまま — [decisions.md](../decisions.md) D-29)。
    - **実装に要るもの**(未着手): (1) 初期化子の無い宣言を禁止する構文ルール(`VariableDeclaration` の `initializer` が無い場合。型情報は要らない)。(2) `??=` を禁止に回す — 現在は `sumi/strict-logical-assignment-operands` が `??=` を対象外にしているので、その除外を外すのではなく「`??=` 自体を禁止」の別ルールにする(D-29 の改訂として決める)。
- **auto freezing を有効にするか(2026-09-09、ユーザー提起 — issue #1753 のコメント、未決)。** 生成したオブジェクト・配列を `Object.freeze` で凍結して、型だけでなく実行時にも不変にするか。immutable 指向(D-14 の `mut_` 規律)を実行時まで徹底できる一方、コストと外部ライブラリとの相互作用(凍結オブジェクトを変更しようとするライブラリ、`Object.assign` の失敗)がある。**`sumi.config` で切り替えられるようにするか**も併せて検討する(設定の形は D-46 / #1753 の `sumi.config.json` 設計と同居)。immer 相当の draft や `markAsPanic`(凍結エラーには印を付けられない)のように、凍結が前提を変える箇所があることも判断材料。
- **immer のような Proxy ベースのライブラリと setter / 代入構文(2026-09-08 追記、ユーザー要望)。** Sumi lint / sugar / refined で immer 相当(`produce(state, (mut_draft) => { mut_draft.x = 1; })`)を実現するには `Proxy` のサポートが要る。整理:
    - **setter 構文(`set x(v) {}`)は要らない見込み。** immer の draft への `mut_draft.x = 1` は object literal の setter ではなく **Proxy の `set` トラップ**(handler の `set` という名前のプロパティ。arrow function プロパティとして書ける)で捕捉される。ライブラリ側の実装も `new Proxy(target, { set: (t, k, v) => … })` と `Reflect.set` で書けるため、D-33 の setter 禁止(D-47 でも維持)を緩める必要はない。`Proxy` は `new` 形で生成する組み込みで、D-15 / D-41 の禁止対象にも入っていない。
    - **残る論点は「draft への代入式」の扱い。** Sumi lint では `mut_` 束縛への代入として今日でも合法(上表の `mut_draft`)。sugar / refined でこの代入式を残すか、**関数呼び出しで置き換える**か(例: `Draft.set(mut_draft, 'x', 1)`、lens / optic 風の `mut_draft.x.set(1)`、あるいは `produce` 自体をパスと値で更新する API)が未決。ユーザーの希望は**なるべく関数呼び出しでカバーする**方向。関数呼び出し形なら Proxy に頼らない実装(構造共有のパス更新)も選べ、refined で代入式の意味論を狭める余地が生まれる。
    - **検討時に決めること**: 代入式を残す場合の型付け(draft の型と `readonly` 除去の範囲 — `castDraft` 相当をどこで許すか)、関数呼び出し形にした場合の書き味(ネストの深い更新)、両形式の Sumi lint 形(ライブラリ API)を先に整備してから sugar の糖衣を決める順序(D-37 のライブラリ先行の原則)。
- **global 定義名の shadow は禁止に確定**(D-19 — `undefined` / `NaN` / 組み込みオブジェクト / global 型名を宣言名に使えない。[banned-syntax.md](./banned-syntax.md))。ユーザー変数同士の shadowing は、現行 config(`@typescript-eslint/no-shadow` の `hoist: 'all'`)が既に全面禁止していることが判明(2026-08-31)。現行運用の追認として**全面禁止に確定**(2026-09-05 — D-27)。
