# 作業レポート: `ts-data-forge/no-unnecessary-type-guard`

## 元のプロンプト

> src/plugins/ts-data-forge にルールを追加したいです。 ts-data-forge/src/guard/ などにある type guard 関数について、 例えば isNotUndefined は undefined を除去する判定関数ですが、入力の型が undefined になりえないものだった場合は無駄なチェックなのでエラーとして検出するようにしたいです。 src/plugins/ts-restrictions/rules/no-unnecessary-coalesce-undefined.mts に似たような型情報を使ったルールがあるのでこれを参考にしつつ、無駄な ts-data-forge の type guard 関数呼び出しを検出するルールを作ってください。個別に作っていただいても良いですし、任意の型ガード関数に一般化できる場合はそれでもOKです。
> 関数ごとに個別ルールを作るよりは、一つのルールに option としてオンオフできる方が望ましいです（が、オプション無しでも良い気もします）。
>
> 例：
>
> - isBoolean は入力が既に boolean ならエラー
> - isNotBoolean は入力が boolean になり得ない場合はエラー
> - isNonNullish は 入力が T | undefined | null なら OK 、 T | undefined （nullにはなり得ない）なら isNotUndefined へ置換、 null の場合も同様、 undefined にも null にもなり得ない場合は関数呼び出しを丸ごと除去すべきなのでエラーにする
> - isNonEmptyString は入力が NonEmptyString なら isNonNullish 呼び出しに置換（さらに一つ上のルールに従い置換が走るようにする）、 "" 以外の string literal union でできている場合はエラー、branded type も考慮し、 null/undefined 除去にしかなっていない場合や空文字になり得ない場合を検出するようにする。
>
> 除去できるケースについて、例えば if 文の条件部がその型ガード関数呼び出しのみになっていたら機械的に除去する変換が複雑になってしまうので、一旦エラー検出のみでOKです。 isX(\*) を true に置換すれば、 logical operator の operand になっている場合に機械的除去を他ルールでできる可能性もあるのでそういう手もあるかもしれません。
>
> このプロンプトと作業レポートを md ファイルで出力しながら進めてください。

## 調査メモ

### 対象の type guard 関数 (`ts-data-forge/src/guard/`)

`is-type.mts` / `is-non-empty-string.mts` に定義された 1 引数の type guard:

| 関数               | シグネチャの効果                                    | 種別                          |
| ------------------ | --------------------------------------------------- | ----------------------------- |
| `isUndefined`      | `u is undefined`                                    | narrowTo {undefined}          |
| `isNotUndefined`   | `u is Exclude<T, undefined>`                        | excludeFrom {undefined}       |
| `isNull`           | `u is null`                                         | narrowTo {null}               |
| `isNotNull`        | `u is T` (`T \| null` → `T`)                        | excludeFrom {null}            |
| `isBoolean`        | `u is boolean`                                      | narrowTo {boolean}            |
| `isNotBoolean`     | `u is Exclude<T, boolean>`                          | excludeFrom {boolean}         |
| `isNumber`         | `u is number`                                       | narrowTo {number}             |
| `isNotNumber`      | `u is Exclude<T, number>`                           | excludeFrom {number}          |
| `isString`         | `u is string`                                       | narrowTo {string}             |
| `isNotString`      | `u is Exclude<T, string>`                           | excludeFrom {string}          |
| `isBigint`         | `u is bigint`                                       | narrowTo {bigint}             |
| `isNotBigint`      | `u is Exclude<T, bigint>`                           | excludeFrom {bigint}          |
| `isSymbol`         | `u is symbol`                                       | narrowTo {symbol}             |
| `isNotSymbol`      | `u is Exclude<T, symbol>`                           | excludeFrom {symbol}          |
| `isNullish`        | `u is null \| undefined`                            | narrowTo {null, undefined}    |
| `isNonNullish`     | `u is NonNullable<T>`                               | excludeFrom {null, undefined} |
| `isNonEmptyString` | `s is NonEmptyString & Exclude<NonNullable<S>, ''>` | 特殊                          |

### `NonEmptyString` brand

`ts-type-forge`:

```ts
type NonEmptyString = Brand<string, 'NonEmptyString'>;
// = string & { NonEmptyString: true } & { 'TSTypeForgeInternals--edd2f9ce-...': unknown }
```

→ 型チェッカ上では `string` との intersection。`type.getProperty('NonEmptyString')` と
内部マーカープロパティ `'TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3'` の
両方が存在することで branded NonEmptyString を判定できる。

## 設計

`no-unnecessary-coalesce-undefined.mts` を参考に、型情報 (`ESLintUtils.getParserServices`)
を使う単一ルール **`no-unnecessary-type-guard`** を実装する。

- `strictNullChecks` が無効な場合は `null`/`undefined` が型から消えて解析が不健全になるため
  ルール全体を無効化 (`return {}`)。
- ts-data-forge からの named import（エイリアス可）と namespace import の両方で
  ガード呼び出しを検出。引数 1 個の `CallExpression` のみ対象。
- 引数型を union 分解し、各メンバを atom (`undefined`/`null`/`boolean`/`number`/`string`/
  `bigint`/`symbol`/`other`) に分類。branded 文字列など intersection は構成要素から
  primitive を拾う。`any`/`unknown`/型パラメータ等の deferred 型 / `never` を含む場合は
  保守的に bail（誤検知回避）。
- 判定:
    - **excludeFrom A**: 入力に含まれる A の要素 = `removable`。空なら「無駄（エラー）」、
      A 全部なら OK、真部分集合なら対応する単一ガードへ置換。
    - **narrowTo A**: A 外メンバが無ければ「既にその型（エラー）」、
      composite (`isNullish`) で present が真部分集合なら単一ガードへ置換。
    - **isNonEmptyString**: 非 nullish メンバが全て「空でない文字列確定」(branded
      NonEmptyString または非空 string literal) のとき、nullish を含むなら `isNonNullish`
      へ置換、含まなければエラー。それ以外は実仕事をしているので OK。
- **除去ケースは検出のみ（autofix なし）**。**置換ケースは callee のリネーム + 必要な import
  追加で autofix**。置換は ESLint の複数 fix パスで連鎖（`isNonEmptyString` → `isNonNullish`
  → `isNotUndefined` 等）。
- option: `{ ignore?: string[] }` で個別ガードのチェックを無効化可能。

## 実装結果

### 追加・変更ファイル

| ファイル                                                             | 内容                                                |
| -------------------------------------------------------------------- | --------------------------------------------------- |
| `src/plugins/ts-data-forge/rules/no-unnecessary-type-guard.mts`      | ルール本体（新規）                                  |
| `src/plugins/ts-data-forge/rules/no-unnecessary-type-guard.test.mts` | テスト（新規、valid 11 / invalid 12、計 23 件）     |
| `src/plugins/ts-data-forge/rules/rules.mts`                          | プラグインへ登録                                    |
| `src/rules/eslint-ts-data-forge-rules.mts`                           | config エントリ追加（`withDefaultOption('error')`） |
| `src/types/rules/eslint-ts-data-forge-rules.mts`                     | `pnpm run gen-rule-type` で型定義を自動生成         |

### 判定ロジック（確定仕様）

- **無駄（`unnecessaryTypeGuard`・autofix なし）**
    - positive guard (`isX`): 入力が既に `X`（A 外メンバ無し）→ 常に true → エラー
      （例 `isBoolean(x: boolean)`, `isString(x: 'a')`, `isNonNullish(x: string)`,
      `isNullish(x: null | undefined)`）
    - negative guard (`isNotX`): 入力が `X` になり得ない → 常に true → エラー
      （例 `isNotUndefined(x: string)`, `isNotBoolean(x: string | number)`）
    - `isNonEmptyString`: 非 nullish メンバが全て「空でない文字列確定」かつ nullish 無し
      → エラー（branded `NonEmptyString`、`'a' | 'b'` など）
- **置換（`replaceTypeGuard`・autofix あり）**
    - `isNonNullish`: `T | undefined`→`isNotUndefined` / `T | null`→`isNotNull`
    - `isNullish`: `T | undefined`→`isUndefined` / `T | null`→`isNull`
    - `isNonEmptyString`: nullish 除去にしかなっていない → `isNonNullish`
      （ESLint の fix 反復で `isNonNullish`→`isNotUndefined`/`isNotNull` へ連鎖）
- **OK（無報告）**: 実際に絞り込む呼び出し、`any`/`unknown`/型パラメータ等 deferred 型、
  ts-data-forge 由来でない同名関数、参照渡し（`xs.filter(isNotUndefined)`）。

### 検証

- `pnpm run tsc`：パス
- 新規テスト：**23/23 パス**（3 回連続で決定的に成功）
- branded `NonEmptyString` 検出は `type.getProperty('NonEmptyString')` ＋ 内部マーカープロパティ
  で判定。テストでは構造的に等価な型をインラインで定義（`eslint-config-typed2` の tsconfig は
  `ts-type-forge` のグローバル型を読み込まないため）。

### スコープ外（今回未対応・将来拡張候補）

- **「常に false」になるガード**（例 `isBoolean(x: string)`, `isUndefined(x: string)`）は
  別種の無駄（デッドコード）だが、防御的コードでの誤検知を避けるため今回は無報告。
- **除去そのものの autofix**（`if` 条件などの機械的削除）はプロンプト指示どおり未実装
  （検出のみ）。`isX(*)` を `true` に置換する案は今後の検討事項。
- option は denylist 形式の `{ ignore?: string[] }`。許可リスト形式は未提供。

### 既知の制約

- 本リポジトリは `dist/` 未ビルドのため `eslint.config.mts` の self-import が解決できず
  `pnpm run lint` は実行不可（本変更とは無関係）。型チェックとテストで検証済み。
  未使用の `// eslint-disable-next-line no-bitwise` ディレクティブは削除済み
  （本リポジトリでは `no-bitwise` 未有効化のため）。

> 注: 下記「追加対応」で「常に false」検出とリテラル autofix を実装したため、上記
> 「スコープ外」のうち該当項目は解消済み。

---

## 追加対応（2 回目の依頼）

### 依頼内容

> - 常に false になる guard も検知・修正できるようにしてください。
> - 自動修正で常に true/false になる type guard を true/false literal に置換するようにもしてください。
> - is(Not)Null, is(Not)Undefined は array.filter の callback などに `array.filter(isNotUndefined)` のように渡す用途で作られたもので、コード上で明示的に引数が渡されるケース（e.g. `if (isNotUndefined(x) && ... ) { ... }` ）では `u !== undefined` のように直接比較をする方が望ましいです。これを別ルールとして追加してください。
>   これも report に追記してください。

### 1. 「常に false」の検出（`no-unnecessary-type-guard` 拡張）

判定を「常に true / 常に false」の両方に一般化した（1 回目でスコープ外としていた
デッドコード方向を実装）。

- `narrowTo A`（`isX`）: target 内メンバ無し（`present` 空）→ **常に false** /
  A 外メンバ無し（入力 ⊆ A）→ **常に true**
- `excludeFrom A`（`isNotX`）: 除去対象なし → **常に true** /
  A 外メンバ無し（入力が全て除去対象）→ **常に false**
- `isNonEmptyString`: 非空文字列になり得るメンバが一つも無い → **常に false**
  （例 `''`, `number`, nullish のみ）／空でない文字列確定のみ → **常に true**

例：`isBoolean(x: string)`＝常に false、`isNotUndefined(x: undefined)`＝常に false、
`isNonNullish(x: null | undefined)`＝常に false。

### 2. true/false literal への autofix

常に true/false になる呼び出しは、呼び出し全体を `true` / `false` リテラルに置換する
autofix を追加（messageId を `unnecessaryTypeGuard` から `alwaysTrue` / `alwaysFalse` に変更）。

- **副作用安全性**: リテラル置換は引数式を捨てるため、引数が副作用を持ち得る場合
  （`isNotUndefined(getValue())` など）は autofix を付けず検出のみとする。
  安全と判定するのは識別子・`this`・リテラル・それらのみで構成される member access。
- logical operator の operand 等になっている `isX(*)` が `true`/`false` になることで、
  他ルール（`no-unnecessary-condition` 等）による機械的整理が可能になる。

### 3. 新ルール `prefer-comparison-over-nullish-guard`

`isNull` / `isNotNull` / `isUndefined` / `isNotUndefined` を**明示的な引数付きで呼び出した
場合**に、直接比較（`x === null` / `x !== undefined` 等）への置換を促す型情報不要の構文ルール。

- point-free 渡し（`xs.filter(isNotUndefined)`）は対象外（呼び出しではないため）。
- autofix で `isNotUndefined(x)` → `x !== undefined` に置換。
- 演算子優先順位を考慮し、
    - 親文脈が単項 `!` / `await` / 二項演算 / member-access の object / call の callee /
      非 null 表明のときは比較全体を括弧で囲む（例 `!isNotUndefined(x)` →
      `!(x !== undefined)`）。
    - 引数が equality より低優先（`?:`・`&&`・代入・sequence・arrow・yield）のときは引数を
      括弧で囲む（例 `isNotUndefined(cond ? a : b)` → `(cond ? a : b) !== undefined`）。
- named import（エイリアス可）・namespace import 両対応。`error` で有効化。

### リファクタリング

両ルールで使う「callee → canonical 関数名（エイリアス／namespace 解決）」のロジックを
`import-utils.mts` の `buildCalleeResolver` に集約。

### 追加・変更ファイル（2 回目）

| ファイル                                                                        | 内容                                                   |
| ------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `src/plugins/ts-data-forge/rules/no-unnecessary-type-guard.mts`                 | 常に true/false 検出 + リテラル autofix へ拡張         |
| `src/plugins/ts-data-forge/rules/no-unnecessary-type-guard.test.mts`            | 28 件へ拡充                                            |
| `src/plugins/ts-data-forge/rules/prefer-comparison-over-nullish-guard.mts`      | 新ルール本体                                           |
| `src/plugins/ts-data-forge/rules/prefer-comparison-over-nullish-guard.test.mts` | 新ルールテスト（11 件）                                |
| `src/plugins/ts-data-forge/rules/import-utils.mts`                              | `buildCalleeResolver` を追加                           |
| `src/plugins/ts-data-forge/rules/rules.mts`                                     | 新ルールを登録                                         |
| `src/rules/eslint-ts-data-forge-rules.mts`                                      | `prefer-comparison-over-nullish-guard: 'error'` を追加 |
| `src/types/rules/eslint-ts-data-forge-rules.mts`                                | 型定義を再生成                                         |

### 検証（追加分）

- `pnpm run tsc`：パス
- `no-unnecessary-type-guard.test.mts`：**28 件**（常に true/false・置換・副作用なし時の no-fix を網羅）
- `prefer-comparison-over-nullish-guard.test.mts`：**11 件**（優先順位の括弧付けを網羅）
- ts-data-forge プラグイン全体：**136 件パス**（既存ルールへの影響なし、決定的に成功）

### 補足

- `no-unnecessary-type-guard`（常に true/false）と `prefer-comparison-over-nullish-guard`
  は同じ `is(Not)Null/Undefined(x)` 呼び出しで同時に発火し得る（例 `isNotUndefined(x: string)`）。
  両者は独立ルールで autofix が競合する場合は ESLint が 1 パスずつ適用するため安全。用途に応じて
  個別に on/off 可能。
