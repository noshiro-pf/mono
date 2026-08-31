<!-- cspell:ignore eqeqeq plusplus bivariance -->

# 仕様→強制手段の対応表(Phase 0 成果物)

仕様の各ルールを「何で強制するか」に落とす対応表。eslint-config-typed の実構成(2026-08-28 調査)と突き合わせてある。[implementation-plan.md](./implementation-plan.md) Phase 0 の成果物であり、Phase 1 の preset 定義と Phase 2 の作業量見積もりの基礎。

凡例 — **状態**: ✅ 既存そのまま / 🔧 既存だがオプション変更が必要 / ⏻ 既存だが現在 off(on にする)/ 🆕 新規実装 / tsc = compilerOptions で強制 / ❓ 要確認。**型**: ルールに型情報が必要か。

## 禁止構文([spec/banned-syntax.md](./spec/banned-syntax.md))

| 仕様ルール                                           | 強制手段                                                                          | 状態 | 型   | 備考                                                                                                                                          |
| :--------------------------------------------------- | :-------------------------------------------------------------------------------- | :--- | :--- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| `var`                                                | `no-var`                                                                          | ✅   | 不要 |                                                                                                                                               |
| `==` / `!=`                                          | `eqeqeq`                                                                          | 🔧   | 不要 | 現行は `{null: "ignore"}` + `no-eq-null` off で **`== null` を意図的に許容**。null 排除後は不要になるので `"always"` 完全化                   |
| `enum`                                               | `total-functions/no-enums`                                                        | ✅   | 不要 |                                                                                                                                               |
| runtime `namespace` / `import =` / param properties  | `erasableSyntaxOnly`                                                              | tsc  | —    | mono 現行は false。言語では true(Phase 2 ではツールに内蔵)                                                                                    |
| `as any` / downcast                                  | `total-functions/no-unsafe-type-assertion` + `@typescript-eslint/no-explicit-any` | ✅   | 要   | `@ts-ignore` 禁止は `ban-ts-comment` ✅(error、調査済 2026-08-31)                                                                             |
| `in`(narrowing)                                      | `no-restricted-syntax`(`in` selector)                                             | ✅   | 不要 | 代替の案内は `ts-data-forge/prefer-is-record-and-has-key`(下記「配布の注意」)                                                                 |
| 暗黙変換 idiom(`+foo` 等)                            | `no-implicit-coercion`                                                            | 🔧   | 不要 | 現行 `{boolean: false}` のため **`!!x` が素通し**。boolean: true へ                                                                           |
| 異型の `+`                                           | `restrict-plus-operands`(全 allow false)                                          | ✅   | 要   |                                                                                                                                               |
| 文字列連結の `+`                                     | `prefer-template`                                                                 | ✅   | 不要 |                                                                                                                                               |
| `new Array()`                                        | `no-restricted-syntax`(NewExpression selector)                                    | ✅   | 不要 |                                                                                                                                               |
| `eval` / `new Function`                              | `no-eval` / `no-new-func` / `no-implied-eval` / `no-restricted-globals`           | ✅   | 不要 |                                                                                                                                               |
| コンストラクタ静的呼び出し(`Boolean(x)` 等)          | `no-restricted-syntax` / `no-restricted-globals`(callee 名リスト)                 | 🆕   | 不要 | D-15 確定。代替生成関数は ts-data-forge に整備(未実装 — [spec/stdlib.md](./spec/stdlib.md))                                                   |
| 比較関数なし `sort`                                  | `require-array-sort-compare` `{ignoreStringArrays: true}`                         | ✅   | 要   | string[] 例外も仕様と一致                                                                                                                     |
| 生の除算                                             | `total-functions/no-partial-division`                                             | ✅   | 要   |                                                                                                                                               |
| default export                                       | `import-x/no-default-export` + `no-restricted-exports`                            | ✅   | 不要 | `*.config.*` 例外も仕様の例外規定と整合                                                                                                       |
| ラベル / カンマ / `void`                             | `no-labels` / `no-sequences` / `no-void` `{allowAsStatement: false}`              | ✅   | 不要 |                                                                                                                                               |
| `++` / `--`                                          | `no-plusplus`                                                                     | 🔧   | 不要 | 現行 `{allowForLoopAfterthoughts: true}`。仕様は for 内も禁止(`range` + 例外は `+= 1`)なので false へ                                         |
| sparse array literal                                 | `no-sparse-arrays`                                                                | ✅   | 不要 | 調査済(error)                                                                                                                                 |
| `delete`                                             | `functional/immutable-data` + `no-dynamic-delete` / `no-array-delete`             | ✅   | 要   | `mut_` 変数への delete は許容(仕様どおり)                                                                                                     |
| デコレータ                                           | `no-restricted-syntax`(Decorator selector)                                        | 🆕   | 不要 | 既存ルールなし。selector 1 本で済む                                                                                                           |
| generator                                            | —(許可)                                                                           | —    | —    | D-18 で禁止を撤回。ルール不要                                                                                                                 |
| `function` 式 / オーバーロードなしの `function` 宣言 | 条件付き許可ルール(オーバーロードシグネチャ検出)                                  | 🆕   | 不要 | D-13 確定。`prefer-arrow-functions` / `func-style` では条件付き許可を表現できない([spec/functions.md](./spec/functions.md))                   |
| `arguments`                                          | `prefer-rest-params`                                                              | ✅   | 不要 | 調査済(error)                                                                                                                                 |
| bitwise 演算子                                       | `no-bitwise`                                                                      | ⏻    | 不要 | 現行 **off**。v1 で on(v2 の `Int32` 導入まで全面禁止)                                                                                        |
| メソッド短縮記法(型)                                 | `method-signature-style` `"property"`                                             | ✅   | 不要 | rationale コメントも bivariance                                                                                                               |
| メソッド短縮記法(class 実装)                         | —                                                                                 | 🆕   | 不要 | `prefer-arrow-functions` は `classPropertiesAllowed: false` で class メソッドを対象外にしており、**class メソッドの bivariance は現状未対処** |
| `throw`(全面禁止)                                    | `functional/no-throw-statements`                                                  | ⏻    | 不要 | 現行 off(暫定は `only-throw-error` で Error 限定)。境界(prelude 内部)の例外規定とセットで on                                                  |
| `try..catch`(禁止提案)                               | `functional/no-try-statements`                                                    | ⏻    | 不要 | 提案確定後に on                                                                                                                               |
| getter / setter                                      | —(深掘り中)                                                                       | —    | —    | class 文脈は D-12 で消滅。残る論点は plain object の遅延評価のみ                                                                              |

## 変数と mutation([spec/variables-and-mutation.md](./spec/variables-and-mutation.md))

| 仕様ルール             | 強制手段                              | 状態 | 型   | 備考                                                                                                                                            |
| :--------------------- | :------------------------------------ | :--- | :--- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| `let` は `mut_` のみ   | `functional/no-let`                   | 🔧   | 不要 | D-14 確定: prefix は `^mut_` の一種のみ。現行 config の `^_mut_` / `^#mut_` を ignore パターンから外す変更が必要                                |
| 破壊的操作の制限       | `functional/immutable-data`           | 🔧   | 要   | D-14 確定: `^draft` を外し `mut_draft` を強制。`ignoreClasses` は class 全面禁止(D-12)で無意味化。`window.location.href` 等の実務例外は仕様化要 |
| for カウンタ = `range` | `ts-data-forge/prefer-range-for-loop` | ✅   | 不要 | 「配布の注意」参照                                                                                                                              |
| shadowing 禁止(未定)   | `no-shadow` 系                        | ❓   | 不要 | 仕様未確定・構成未調査                                                                                                                          |

## readonly([spec/readonly.md](./spec/readonly.md))

| 仕様ルール                         | 強制手段                                                              | 状態 | 型   | 備考                                                                                                                                          |
| :--------------------------------- | :-------------------------------------------------------------------- | :--- | :--- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| 配列・タプルの readonly 記法       | `functional/readonly-type` `"generic"`                                | ✅   | 不要 |                                                                                                                                               |
| 引数の readonly 強制               | `prefer-readonly-parameter-types`                                     | ✅   | 要   | DOM 型等の allow リストあり(仕様の境界規定として明文化する価値あり)                                                                           |
| class フィールド                   | `functional/prefer-readonly`(TS 版)                                   | ✅   | 要   |                                                                                                                                               |
| **戻り値・型宣言の readonly 強制** | `functional/prefer-immutable-types` / `type-declaration-immutability` | ⏻    | 要   | **現行 off(config 内に TODO コメント付きの下書きあり)。v1 最大の未稼働項目** — readonly-by-default 戦略(D-3)の成立条件なので Phase 1 の主課題 |
| `castMutable` の乱用検出           | —                                                                     | 🆕   | 要   | 境界エスケープの使用箇所レポート                                                                                                              |

## null([spec/null-undefined.md](./spec/null-undefined.md))

| 仕様ルール                              | 強制手段                                                           | 状態 | 型   | 備考                                                                                  |
| :-------------------------------------- | :----------------------------------------------------------------- | :--- | :--- | :------------------------------------------------------------------------------------ |
| `null` リテラル禁止                     | `unicorn/no-null`                                                  | ⏻    | 不要 | 現行 off                                                                              |
| 型注釈への `null` 禁止                  | `no-restricted-syntax`(TSNullKeyword)                              | 🆕   | 不要 | 注釈の構文検査で大半を賄える                                                          |
| null 含み型の伝播禁止(境界正規化の強制) | —                                                                  | 🆕   | 要   | v1 新規実装の本丸。宣言(変数・引数・戻り値・プロパティ)の型に null が含まれたらエラー |
| `?? undefined` イディオム               | `ts-restrictions/no-unnecessary-coalesce-undefined` と干渉しないか | ❓   | 要   | null を undefined へ潰す用途は「necessary」のはずだが要確認                           |

## boolean([spec/booleans-and-logic.md](./spec/booleans-and-logic.md))

| 仕様ルール              | 強制手段                                                                  | 状態 | 型   | 備考                     |
| :---------------------- | :------------------------------------------------------------------------ | :--- | :--- | :----------------------- |
| 厳密 boolean オペランド | `strict-boolean-expressions`(全 allow false)                              | ✅   | 要   | 現行構成が仕様と完全一致 |
| 論理演算子の式文禁止    | `no-unused-expressions` `{allowShortCircuit: false, allowTernary: false}` | ✅   | 不要 |                          |
| `!!x` 禁止              | `no-implicit-coercion` boolean: true                                      | 🔧   | 不要 | 上表と同件               |
| `Boolean(x)` 禁止(有力) | `no-restricted-syntax`(CallExpression selector)                           | 🆕   | 不要 | 仕様確定後               |
| JSX 条件描画は三項      | `react/jsx-no-leaked-render` `{validStrategies: ["ternary"]}`             | ✅   | 不要 |                          |
| 論理代入演算子(未定)    | —                                                                         | —    | —    | 仕様未確定               |

## モジュール([spec/modules.md](./spec/modules.md))

| 仕様ルール                           | 強制手段                                            | 状態     | 型   | 備考                                                                                                                                                                      |
| :----------------------------------- | :-------------------------------------------------- | :------- | :--- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.mjs` 拡張子必須                    | `import-x/extensions`                               | ✅       | 不要 |                                                                                                                                                                           |
| 循環 import 禁止                     | `import-x/no-cycle`                                 | ✅       | 不要 |                                                                                                                                                                           |
| 副作用 import 禁止                   | `import-x/no-unassigned-import`                     | 🔧       | 不要 | 現行 allow リストの精査                                                                                                                                                   |
| 相対 index 直指定禁止                | `no-restricted-imports`(pattern)                    | ✅       | 不要 |                                                                                                                                                                           |
| 内部モジュール直指定                 | `import-x/no-internal-modules`                      | 🔧       | 不要 | allow リストを言語仕様として定義し直す                                                                                                                                    |
| `import * as ns`(未定)               | `tree-shakable/import-star`                         | ✅       | 不要 | 調査済(2026-08-31): ルールは **namespace import 自体を許可**し、非 tree-shakable な**使用**(プロパティアクセス以外)だけを禁止。仕様側の「未定」はこの現行挙動の追認が有力 |
| `declare global` / script モード禁止 | `moduleDetection: "force"` + `no-restricted-syntax` | tsc + 🆕 | 不要 | prelude だけの例外規定                                                                                                                                                    |
| モジュール解決の一意化               | `module`/`moduleResolution: nodenext`               | tsc      | —    |                                                                                                                                                                           |

## 関数・例外・class([spec/functions.md](./spec/functions.md) / [spec/exceptions.md](./spec/exceptions.md) / [spec/classes.md](./spec/classes.md))

| 仕様ルール                   | 強制手段                                                                                                                                             | 状態 | 型   | 備考                                                                                                                                                                                                                                           |
| :--------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- | :--- | :--- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| arrow function 統一          | `prefer-arrow-functions` + `prefer-arrow-callback`                                                                                                   | ✅   | 不要 | D-13 確定: named function はオーバーロード時のみ(条件付き許可ルールは 🆕 — 禁止構文の表を参照)                                                                                                                                                 |
| 識別子 `fn` の予約           | `id-denylist`(`["fn"]`)                                                                                                                              | ⏻    | 不要 | D-17 確定。preset 第一版で on。挙動実測(2026-08-31): 読み取り・rename 付き destructuring / import は許可(D-17 の逃げ道と一致)、自前オブジェクトリテラルの `fn` プロパティ定義は検出 — D-17 より厳しい既知の逸脱(🆕 カスタムルールで精密化可能) |
| global 定義名の shadow 禁止  | `@typescript-eslint/no-shadow` `{builtinGlobals: true, hoist: 'all'}` + `no-shadow-restricted-names` `{reportGlobalThis: true}` + `no-global-assign` | ✅   | 不要 | 調査済(2026-08-31): **値空間は現行 config で強制済み**。hoist: 'all' によりユーザー変数同士の shadow も既に禁止。残るは**型空間の global 型 shadow 検査のみ 🆕**                                                                               |
| 素の number 系 global の禁止 | `unicorn/prefer-number-properties`(error)+ `no-restricted-globals`(Infinity)                                                                         | ✅   | 不要 | 調査済(2026-08-31): unicorn が NaN/parseInt/parseFloat/isNaN/isFinite をカバー(checkInfinity は default false のため Infinity は no-restricted-globals 側が担保)。D-21 は既存構成で強制済み                                                    |
| 明示的戻り値型               | `explicit-function-return-type`                                                                                                                      | ✅   | 不要 | `allowExpressions: true` 等の現行オプションを仕様の粒度として追認するか要決定                                                                                                                                                                  |
| `this` は全面禁止            | `functional/no-this-expressions`                                                                                                                     | ⏻    | 不要 | D-12 確定。現行 off を on にする(`no-invalid-this` は多層防御として残す)                                                                                                                                                                       |
| `extends` 禁止               | `functional/no-class-inheritance`                                                                                                                    | ✅   | 不要 | **既に error** — synstate との整合(現行コードがどう通っているか)要確認                                                                                                                                                                         |
| class 全面禁止               | `functional/no-classes`                                                                                                                              | ⏻    | 不要 | D-12 確定。現行 off を on にする                                                                                                                                                                                                               |
| `interface` の扱い           | `consistent-type-definitions` `"type"`                                                                                                               | ✅   | 不要 | **interface は既に禁止(type alias 統一)**。classes.md の記述は "構造的型" の意で読み替え、仕様に明記要                                                                                                                                         |
| throw / try..catch           | (禁止構文の表を参照)                                                                                                                                 | ⏻    | —    |                                                                                                                                                                                                                                                |

## JSX([spec/jsx.md](./spec/jsx.md))

| 仕様ルール                               | 強制手段                                              | 状態 | 型   | 備考                                                                                                                     |
| :--------------------------------------- | :---------------------------------------------------- | :--- | :--- | :----------------------------------------------------------------------------------------------------------------------- |
| `<T,>` 強制                              | —                                                     | 🆕   | 不要 | **フォーマッタ互換は実測確認済み(2026-08-31)**: Prettier(.mts/.tsx とも)・oxfmt の両方が `<T,>` を保持。ルール実装のみ残 |
| angle-bracket 型アサーション(`<T>x`)禁止 | `consistent-type-assertions` `{assertionStyle: 'as'}` | ✅   | 不要 | 調査済(2026-08-31): 既存 config で強制済み。v2 で文法から除去(D-11)                                                      |
| 式の隣接連結禁止                         | `react/jsx-curly-brace-presence` ほか react 系        | ✅   | 不要 |                                                                                                                          |

## 配布の注意

- `ts-data-forge/*` ルール(`prefer-arr-is-array`、`prefer-is-record-and-has-key`、`prefer-range-for-loop` 等)は **eslint-config-typed ではなく別パッケージ eslint-plugin-ts-data-forge** から供給され、mono ではルートの eslint.config.mts が読み込んでいる。subset preset(Phase 1)はこの 2 つを束ねる形になる。
- **preset 第一版は `languages/tsubu/eslint-config`(tsubu-eslint-config、D-25)として実装済み**: `eslintConfigForTsubu()` が eslint-config-typed + eslint-plugin-ts-data-forge に Tsubu 上書きを最後に重ねる。第一版の範囲はこの表の 🔧 / ⏻ のうち `提案` ステータスに依存しない確定分のみ(`import-x/no-unassigned-import` / `no-internal-modules` の allow リスト精査は modules 仕様の確定待ち、`functional/no-try-statements` は try..catch 提案の確定待ち、readonly の `prefer-immutable-types` 系は Phase 1 主課題として別枠)。

## 調査で判明した、仕様側へフィードバックすべき差分

1. ~~mut_ prefix の実体は 3 種 + `^draft`~~ → **解決(D-14)**: 言語仕様は `^mut_` の一種のみ。現行 config 側を絞る変更が preset に必要。
2. ~~`functional/immutable-data` の `ignoreClasses: true`~~ → **解決(D-12)**: class 全面禁止により論点消滅。
3. **readonly の戻り値・型宣言強制は現状 off**(`prefer-immutable-types` / `type-declaration-immutability` に TODO コメント付き下書きあり)。readonly-by-default 戦略(D-3 の codemod 可能性)の成立条件なので、**Phase 1 の主課題**。
4. **`== null` は現行意図的に許容**(`eqeqeq` の `null: "ignore"`)。null 排除仕様の下では不要になるため、仕様確定とともに完全化する。
5. **`no-bitwise` は明示的に off**、`!!x` も `no-implicit-coercion` の boolean: false で素通し — いずれも v1 で仕様との差分になる。
6. `func-style` off の理由コメント(オーバーロード誤検出)は、[spec/functions.md](./spec/functions.md) のオーバーロード論点の実在を実運用側から裏付けている。
