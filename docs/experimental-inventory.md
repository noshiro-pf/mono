<!-- cspell:ignore catan dezero Ymdhm -->

# `experimental/` の棚卸し

`experimental/packages` に 74 個のワークスペースプロジェクトがある。step 3 の
「utils・apps を依存のトポロジカル順に 1 つずつ復元する」を始める前に、**そもそも
何を復元するのか**を決められる形に並べたもの。

分類は 3 つ。

| 分類       |  数 | 意味                                                   |
| :--------- | --: | :----------------------------------------------------- |
| 後継あり   |  27 | 現行パッケージに置き換わっている。復元しない           |
| 判断が要る |  38 | 後継が無い。復元するかは使うかどうかで決まる           |
| 中身が無い |   9 | src が空、またはテンプレート。復元する対象が存在しない |

行数は `src/` 配下の `.ts` / `.tsx` / `.mts` の合計。最終更新日は載せていない —
統合時に全パスが書き換わっており、`git log` から個別の履歴は追えないため。

各 app が「連れてくる」依存は、`package.json` の `dependencies` から後継のある
ものと `global-*` を除いて機械的に出した実測値であって、見立てではない。

## 後継あり（復元しない）

現行パッケージが同じ役割を担っている。復元は「戻す」ではなく「二重化する」ことに
なる。

| experimental                  |  行数 | 後継                               |
| :---------------------------- | ----: | :--------------------------------- |
| `eslint-configs`              | 57659 | `eslint-config-typed`              |
| `utils/ts-utils`              | 10213 | `ts-data-forge`                    |
| `utils/io-ts`                 |  4463 | `ts-fortress`                      |
| `utils/syncflow`              |  3186 | `synstate`                         |
| `tools/eslint-custom-rules`   |  2628 | `eslint-plugin-ts-*` の 3 つ       |
| `utils/ts-utils-additional`   |  2311 | `ts-data-forge`                    |
| `ts-type-utils`               |  1652 | `ts-type-forge`                    |
| `utils/syncflow-react-hooks`  |   368 | `synstate-react-hooks`             |
| `utils/syncflow-preact-hooks` |   369 | `synstate-preact-hooks`            |
| `utils/io-ts-types`           |   352 | `ts-fortress`                      |
| `utils/deep-object-diff`      |    16 | `ts-data-forge`                    |
| `utils/fast-deep-equal`       |     4 | `ts-data-forge` の `fastDeepEqual` |
| `utils/global-*`（14 個）     |  1328 | **撤廃方針**。明示 import に直す   |
| `others/template`             |     1 | —                                  |
| `utils/template`              |     1 | —                                  |

`global-*` は「明示 import を省略するための shim」で、統合レポートが撤廃すると
決めている。中身は再 export と `declare global` だけなので、利用側を書き換えれば
消える。

## 判断が要る（後継が無い）

### apps（19 個）

**app を 1 つ選べば、連れてくる utils は決まる。** 下の「連れてくる utils」は
`dependencies` から実測したもので、後継のあるもの（ts-utils → ts-data-forge 等）と
`global-*` は除いてある。

| app                                  |  行数 | 連れてくる utils                                                                                                                                              |
| :----------------------------------- | ----: | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `event-schedule-app`                 | 21136 | event-schedule-app-shared, numeric-input-utils, react-blueprintjs-utils, react-utils, tiny-router-observable, tiny-router-react-hooks, better-react-use-state |
| `event-schedule-app-shared`          |  5203 | **なし**                                                                                                                                                      |
| `algo-app`                           |  5033 | goober, preact-utils, resize-observer-preact-hooks, tiny-router-observable, tiny-router-preact-hooks, better-preact-use-state                                 |
| `mahjong-calculator-app`             |  2428 | goober, preact-utils, tiny-router-preact-hooks, better-preact-use-state                                                                                       |
| `poll-discord-app`                   |  2008 | **なし**                                                                                                                                                      |
| `annotation-tool`                    |  2006 | react-utils, tiny-router-react-hooks, better-react-use-state                                                                                                  |
| `blueprintjs-playground-styled`      |  1701 | blueprint-css, react-utils, tiny-router-react-hooks, better-react-use-state                                                                                   |
| `my-portfolio-app-preact`            |  1244 | goober, preact-utils, resize-observer-preact-hooks, tiny-router-observable, tiny-router-preact-hooks, better-preact-use-state                                 |
| `housing-loan-calculator-app`        |  1143 | numeric-input-utils, react-blueprintjs-utils, react-utils, tiny-router-observable, tiny-router-react-hooks, better-react-use-state                            |
| `color-demo-app`                     |  1097 | react-mui-utils, react-utils, better-react-use-state                                                                                                          |
| `lambda-calculus-interpreter-core`   |   750 | **なし**                                                                                                                                                      |
| `cant-stop-probability-app`          |   653 | react-blueprintjs-utils, react-utils, better-react-use-state                                                                                                  |
| `catan-dice-app`                     |   471 | react-utils, better-react-use-state                                                                                                                           |
| `lambda-calculus-interpreter-react`  |   196 | 上の core, react-utils, better-react-use-state                                                                                                                |
| `lambda-calculus-interpreter-preact` |   190 | 上の core, goober, preact-utils, better-preact-use-state                                                                                                      |
| `blueprintjs-playground`             |    92 | react-utils, tiny-router-react-hooks, better-react-use-state                                                                                                  |
| `slack-app`                          |    42 | goober, preact-utils, resize-observer-preact-hooks, tiny-router-observable, tiny-router-preact-hooks, better-preact-use-state                                 |
| `template-react-app-vite`            |    97 | テンプレート                                                                                                                                                  |
| `template-preact-app-vite`           |    89 | テンプレート                                                                                                                                                  |

`lambda-calculus-interpreter-*` は core がロジック、react / preact が同じものの
UI 違い。復元するなら core + どちらか 1 つ。

### utils（13 個）

app に連れられて来るもの。単体で復元する理由は薄い。

| util                           | 行数 | 用途                        |
| :----------------------------- | ---: | :-------------------------- |
| `react-blueprintjs-utils`      | 4432 | Blueprint.js の薄いラッパ   |
| `react-utils`                  |  487 | React hooks 詰め合わせ      |
| `preact-utils`                 |  472 | 同上の Preact 版            |
| `react-utils-styled`           |  347 | styled 版                   |
| `numeric-input-utils`          |  287 | 数値入力の状態管理          |
| `react-mui-utils`              |  245 | MUI ラッパ                  |
| `tiny-router-observable`       |  185 | 自作ルータ（syncflow 依存） |
| `tiny-router-react-hooks`      |  140 | 同上                        |
| `tiny-router-preact-hooks`     |  140 | 同上                        |
| `better-react-use-state`       |   75 | `useState` の readonly 版   |
| `better-preact-use-state`      |   74 | 同上                        |
| `resize-observer-react-hooks`  |   55 | ResizeObserver hook         |
| `resize-observer-preact-hooks` |   55 | 同上                        |

`tiny-router-*` は `syncflow` に依存しているので、復元するなら `synstate` へ
書き換えることになる。`react-utils-styled` はどの app からも参照されていない。

### others / slides（6 個）

| もの                           | 行数 | 中身                                |
| :----------------------------- | ---: | :---------------------------------- |
| `others/slack-archive-tools`   |  952 | Slack エクスポートの整形            |
| `others/mahjong-scoring-tool`  |  276 | 点数計算                            |
| `others/ts_playground`         |  104 | 型の実験場                          |
| `others/implement-react-hooks` |   56 | hooks の自作実装（学習用）          |
| `slides/dezero_06_to_16`       |    — | reveal.js のスライド（HTML 直書き） |
| `slides/chain_rule`            |    — | 同上                                |

## 中身が無い（復元する対象が存在しない）

| もの                                             | 実体                          |
| :----------------------------------------------- | :---------------------------- |
| `utils/blueprint-css`                            | ベンダの CSS ファイルのみ     |
| `utils/goober`                                   | `dist/` と `index.d.mts` のみ |
| `others/marked`                                  | `convert.js` 1 本             |
| `others/create-json-schema-from-typescript`      | スクリプト 2 本               |
| `others/create-typescript-type-from-json-schema` | 同上                          |
| `slides/template`                                | テンプレート                  |
| `apps/template-*-app-vite`（2 個）               | テンプレート                  |

`blueprint-css` と `goober` は名前こそ utils だが、実体はベンダのファイルを置いた
だけの箱。復元するなら npm の本家（`@blueprintjs/core`、`goober`）を直接使う。

テンプレート類は、現行リポジトリの規約（`libs/*` は 1 ディレクトリ 1 npm パッケージ、
共有 config は `tools/configs/`）とは別物なので、復元ではなく作り直しになる。

## 進め方の提案

置換の**行き先**は機械的に決まる。

```text
ts-utils / ts-utils-additional → ts-data-forge
ts-type-utils                  → ts-type-forge
io-ts / io-ts-types            → ts-fortress
syncflow / syncflow-*-hooks    → synstate / synstate-*-hooks
eslint-configs                 → eslint-config-typed
global-*                       → 明示 import
```

**ただし「行き先がある」と「同じものがある」は別。** 2 つ復元して実測したところ、
後継パッケージに対応物が無い API がその都度出てきた。移植先はアプリ内の
`src/utils/` で、出自をコメントに書いて残している。

| 無かったもの                                      | どこで要った                         |
| :------------------------------------------------ | :----------------------------------- |
| `match` / `mapOptional` / `noop`                  | poll-discord-app                     |
| `DateUtils`（5 関数）・曜日とアルファベットの定数 | poll-discord-app                     |
| `Arr.isArrayOfLength3` などの長さ別 guard         | lambda-calculus-interpreter-core     |
| `Obj.set` / `Obj.update`                          | poll-discord-app（スプレッドに置換） |

**API 名も動いている。** `ISet.new` → `create`、`Str.from` → `unknownToString`、
`toUint32` / `toSafeUint` → `asUint32` / `asSafeUint`、`pipe().chain()` →
`.map()`、`t.simpleBrandedString(name, default)` → options 引数。`IMap.get` と
`Arr.last` は `Optional` を返すようになった。

**最初の 1 つは、連れてくる utils が「なし」の 3 つから選ぶのがよい。** 置換だけで
済み、utils の復元と app の復元を同時にやらずに済む。

| 候補                               | 行数 | 性格                                          | 状況                   |
| :--------------------------------- | ---: | :-------------------------------------------- | :--------------------- |
| `lambda-calculus-interpreter-core` |  750 | 純粋なロジック。UI 無し。依存は ts-utils のみ | main に入った（#1621） |
| `poll-discord-app`                 | 2008 | サーバ側。io-ts と ts-utils のみ              | main に入った（#1620） |
| `event-schedule-app-shared`        | 5203 | 型定義中心。ただし単体では動かない            | main に入った（#1625） |

### 置き場は npm の公開状況で決まった

`libs/*` は公開 npm パッケージ、`apps/*` は非公開、というのが現行の規約。
実測すると事情が 3 通りに分かれたが、**公開済みのものも `apps/` に private で戻す
方針**とした（npm 上の既存版はそのまま残り、以降のリリースは行わない）。

| パッケージ                         | 旧 `private` | npm                   | 結論                                                 |
| :--------------------------------- | :----------- | :-------------------- | :--------------------------------------------------- |
| `poll-discord-app`                 | `true`       | —                     | `apps/` に private。判断不要                         |
| `lambda-calculus-interpreter-core` | `false`      | **404（未公開）**     | `apps/` に private。公開されたことが無いので判断不要 |
| `event-schedule-app-shared`        | `false`      | **9.0.0（公開済み）** | `apps/` に private。npm の既存版は残る               |
| `io-ts-types`                      | `false`      | **1.0.0（公開済み）** | 同上                                                 |

前 2 つは旧レイアウトでも `packages/apps/` 配下だったので、`apps/` に戻すのが
位置としても忠実だった。

### `event-schedule-app-shared` は「utils なし」ではなかった

上の表の「なし」は、**後継が無い utils を連れてこない**という意味で、依存が無いと
いう意味ではなかった。実際の `dependencies` は `io-ts` / `io-ts-types` /
`ts-utils` / `ts-utils-additional` の 4 つで、このうち **`io-ts-types` は
`ts-fortress` では代替できない**。

- `DatetimeRange` と `Ymdhm` は `io-ts-types` の**ドメイン型**で、`ts-fortress`
  にあるはずのないもの。352 行 14 ファイルを別途復元する必要がある
- **`t.*` の API 自体は `ts-fortress` で全部まかなえる。** `t.enumType` はそのまま
  あり、`t.stringLiteral` は `literal` に改名されている。`t.safeUint` /
  `t.createPrimitiveType` / `t.nonEmptyArray` / `t.optional` / `t.keyof` /
  `t.record` / `t.array` / `t.union` もある

つまりこれは**「app 1 つ」ではなく「utils 1 つ + app 1 つ」**の作業で、183
ファイル・5203 行に `io-ts-types` の分が乗る。

**2026-08-25 追記: その `io-ts-types` は復元済みで、main に入っている**（#1624）。
`apps/io-ts-types` に `private: true` で置いた — 上の表の方針どおりである。16
ファイル・468 行で、見積りの「352 行 14 ファイル」よりやや大きかった。したがって
`event-schedule-app-shared`（#1625）の前提はもう揃っており、「公開済みの 2
パッケージをどう扱うか」も決着している。

**その後 `apps/ts-fortress-types` に改名した。** 旧名は `@noshiro/io-ts` に
由来するもので、その `io-ts` はもう無く、パッケージが依存しているのは
`ts-fortress` だけである。以降この文書で `io-ts-types` と書いてあるのは
`experimental/` にある旧パッケージのことで、main にあるものではない。

`event-schedule-app` は 21136 行あり、Blueprint.js・Firebase・自作ルータに依存する
ので最後に回すのが妥当。**実際に最後になった**（#1714）。

### 「連れてくる utils」は 6 つでは済まない

上の表の 6 つは `event-schedule-app` の `dependencies` を直接読んだもので、**その
先は数えていない**。実際に復元して分かった連鎖はこう。

```text
event-schedule-app
└─ react-blueprintjs-utils (4432)
   ├─ react-utils-styled (347)
   │  └─ resize-observer-react-hooks (55)   ← 復元済み
   ├─ syncflow-react-hooks                  ← libs/synstate-react-hooks が後継、復元不要
   ├─ @blueprintjs/{core,datetime,datetime2,icons}
   └─ @emotion/{react,styled}
```

`resize-observer-react-hooks` と `react-utils-styled` は表に載っていない。
`syncflow-react-hooks` だけは既に `libs/synstate-react-hooks` があるので復元不要。

### Blueprint は v6 以外に選択肢が無い

`react-blueprintjs-utils` の依存は `@blueprintjs/core@^5` で、npm の最新は 6.18.0。
当初は「v5 のまま入れるか v6 へ上げるか」の判断だと考えたが、peer dependency を見た
ら選択の余地は無かった。

|                            | react peer              |
| :------------------------- | :---------------------- |
| `@blueprintjs/core@5.16.2` | `^16.8 \|\| 17 \|\| 18` |
| `@blueprintjs/core@6.18.0` | `18 \|\| 19`            |

**このリポジトリの catalog は `react: 19.2.8`。** v5 は React 19 を peer に持たない
ので、そのまま入れると peer の不整合になる。**v6 一択**で、4432 行のラッパに対する
移行がそのまま作業になる。

移行の範囲は測れる。アプリ側が `@blueprintjs/core` から使っている識別子は 21 個
（`Button` / `Card` / `Popover` / `OverlayToaster` / `HTMLSelect` など）、import 箇所
は 52。加えて `@blueprintjs/datetime` が 1 箇所。ラッパ側は `core` 14 / `datetime` 4
/ `datetime2` 3。

### `event-schedule-app` の復元は「移植」ではなく「書き換え」になる

utils を全部揃えたあと、本体の復元を機械的な範囲まで進めて規模を測った。

| 作業                                     |           量 |
| :--------------------------------------- | -----------: |
| `.ts` → `.mts` の改名                    | 190 ファイル |
| パッケージ名の置換                       |      14 種類 |
| **暗黙グローバルの撤廃後に残る型エラー** |  **3567 件** |
| 撤廃対象の識別子                         | **約 90 個** |

**3567 件のほとんどは「宣言されていない識別子」で、原因は `globals.d.ts` の 10 行**。

```text
/// <reference types="@noshiro/global-react" />
/// <reference types="@noshiro/global-syncflow" />
/// <reference types="@noshiro/global-ts-utils" />
…（全 10 個）
```

`useMemo` / `useCallback` / `styled` / `css` / `pipe` / `Result` / `Obj` /
`memoNamed` といった**約 90 個の識別子が import 無しで使える前提**で 21136 行が
書かれている。多い順に `Obj` 143・`Result` 139・`styled` 119・`memoNamed` 111・
`css` 96・`map` 90。

これは poll-discord-app（24 個・39 ファイル）で通った道の 4 倍規模で、**同じ機械的な
手順で進められる**。ただし置換後に API のずれ（`syncflow` → `synstate`、`ts-utils`
→ `ts-data-forge`）が表に出るので、そこからは 1 件ずつになる。

後継が無いものも既に 2 つ見えている。`createVoidEventEmitter` と `setInitialValue`
は `synstate` に無く、旧 `syncflow` から移植が要る（7 ファイルで使用）。

### `event-schedule-app` 本体の実測

| 項目       | 値                                               |
| :--------- | :----------------------------------------------- |
| 行数       | 21136                                            |
| ファイル数 | 314（`.ts` 192・`.tsx` 114・`.svg` 7・`.css` 1） |
| 直接の依存 | 26（うち自作 14）                                |

**拡張子が `.ts` / `.tsx` で、このリポジトリの `.mts` 規約と違う。** 復元時に 192
ファイルの改名と、それに伴う import の書き換えが要る。

宣言された自作依存のうち 2 つは、復元しなくてよい。

- `@noshiro/fast-deep-equal` → `ts-data-forge` の `fastDeepEqual` が後継
- `@noshiro/deep-object-diff` → **`src` から 1 回も import されていない**（宣言のみ）

## 復元が終わった時点で残っているもの（2026-08-31）

step 3 で復元したのは **13 パッケージ**で、内訳は上の「判断が要る」38 のうち
apps 4 / utils 8 と、「後継あり」に入れていた `io-ts-types` である。
**`io-ts-types` の分類は誤っていた** — `ts-fortress` が後継なのは `t.*` の API
だけで、`DatetimeRange` / `Ymdhm` というドメイン型に後継は無い（上節）。

「判断が要る」の残りは 26。

| 分類           |  元 | 復元した | 残り |
| :------------- | --: | -------: | ---: |
| apps           |  19 |        4 |   15 |
| utils          |  13 |        8 |    5 |
| others・slides |   6 |        0 |    6 |

apps の残り 15 のうち 2 つ（`template-react-app-vite` /
`template-preact-app-vite`）はテンプレートなので、実体があるのは 13。

**残りに手を付けていないのは、復元する理由が無いからであって、詰まったからでは
ない。** 使うと決めたときのために、依存の状況だけ記録しておく。

### React 側の apps 7 つは、連れてくる utils が全部揃っている

| app                                     | 行数 | 追加で要る utils |
| :-------------------------------------- | ---: | :--------------- |
| `annotation-tool`                       | 2006 | **なし**         |
| `blueprintjs-playground-styled`         | 1701 | **なし**         |
| `housing-loan-calculator-app`           | 1143 | **なし**         |
| `cant-stop-probability-app`             |  653 | **なし**         |
| `catan-dice-app`                        |  471 | **なし**         |
| ~~`lambda-calculus-interpreter-react`~~ |  196 | 復元済み（下節） |
| `blueprintjs-playground`                |   92 | **なし**         |

| app                                 | 行数 | 追加で要る utils             |
| :---------------------------------- | ---: | :--------------------------- |
| `annotation-tool`                   | 2006 | **なし**                     |
| ~~`blueprintjs-playground-styled`~~ | 1701 | 大半が復元済みだった（下節） |
| `housing-loan-calculator-app`       | 1143 | **なし**                     |
| `cant-stop-probability-app`         |  653 | **なし**                     |
| `catan-dice-app`                    |  471 | **なし**                     |
| `lambda-calculus-interpreter-react` |  196 | **なし**                     |
| `blueprintjs-playground`            |   92 | **なし**                     |

`blueprintjs-playground-styled` が依存する `blueprint-css` は「中身が無い」箱なので、
`@blueprintjs/core` を直接使えばよい。**この 7 つは置換と書き換えだけで済む** —
step 3 で `poll-discord-app` から始めたときと同じ性格の作業になる。

`color-demo-app`（1097 行）だけは `react-mui-utils`（245 行）が要る。

### Preact 側は utils 4 つが前提になる

`algo-app`（5033）・`mahjong-calculator-app`（2428）・`my-portfolio-app-preact`
（1244）・`lambda-calculus-interpreter-preact`（190）・`slack-app`（42）の 5 つは、
`preact-utils`（472）・`tiny-router-preact-hooks`（140）・~~`better-preact-use-state`
（74）~~・`resize-observer-preact-hooks`（55）が先に要る。合計 741 行で、いずれも
React 版が `apps/` にある。`goober` も箱だけなので npm の `goober` を直接使う。

**`better-preact-use-state` は復元済み**（下節）。残る 3 つのうち
`resize-observer-preact-hooks` はこれに依存するので、次はそこになる。

### 復元前後の差分は書き出してある

13 パッケージについて、`src/` の 1 ファイルにつき 1 つの `.diff` を
`experimental/restore-diff/` に置いた。復元前 703 ファイル・復元後 723 ファイルで、
**変更 555 / 同一 143 / 追加 25 / 削除 5**。

- **同一 143 のうち 77 は `index.mts` の barrel。** `pnpm run gi` の生成物で
  中身は `export * from './x.mjs'` の並びだけなので、周りが全部書き換わっても
  ファイルとしては変わらない
- `event-schedule-app` の同一 25 は、`assets/icon_svg/*.svg` 7 件と、
  **`.ts` → `.mts` に改名されただけで中身が 1 文字も変わらなかった 18 件**
  （`constants/color` などの定数と、import を持たない型 alias）
- 追加 25 のほとんどは、後継の無い API を移した先（`src/utils/` ・
  `apps/event-schedule-app/src/utils-ported/`）。削除 5 は暗黙グローバルの
  shim（`globals.d.ts` ・ `load-libs.d.mts`）である

**この差分を読み直して、動作が変わっている箇所が 3 つ見つかった**（partial
message の fetch 落ち・`asSafeUint(NaN)` の例外・`instanceof Promise` の緩和）。
内訳と直し方は [monorepo-consolidation.md](./monorepo-consolidation.md) の step 3
にある。**3 件とも `fmt` / `lint` / `type-check` / `test` が通る状態で残っていた**
ので、型検査に通ったことは移植が等価であることの証明にならない。

`DateUtils` の移植には 1 件だけ元と違う既定値がある。`toLocaleYMD` の区切り文字が
`'/'` から `'-'` になっており、**唯一の呼び出し箇所が区切り文字を明示している**ため
現状は影響しない。

## `lambda-calculus-interpreter-react` の復元（2026-09-01）

上の表の 7 つのうち 1 つ目。**`apps/lambda-calculus-interpreter-core` が既に
リポジトリにあり、その UI だから**という理由で先に選んだ。「追加で要る utils
なし」は正しく、置換と書き換えだけで済んだ。

### 暗黙グローバルは 9 つ

`src/globals.d.ts` が並べていた `@noshiro/global-*` の 8 参照で、実際に使われて
いたのは `styled` / `css` / `memoNamed` / `pipe` / `createState` /
`InitializedObservable` / `debounceTime` / `map` / `useObservableValue` の 9 つ。
すべて明示 import にした。

### `syncflow` → `synstate` は署名が違う

**移植ではなく書き換えになる。** 3 箇所:

| 旧 (`syncflow`)                                                | 新 (`synstate`)                          |
| :------------------------------------------------------------- | :--------------------------------------- |
| `createState` が `{ state, useCurrentValue, setState }` を返す | タプル `[state, setState, utils]` を返す |
| `.chain(op)`                                                   | `.pipe(op)`                              |
| `debounceTime(ms)`                                             | `debounce(ms)`                           |

`useCurrentValue` に対応するものは `synstate` の側に無いので、
`synstate-react-hooks` の `useObservableValue` に置き換え、`state$` を
export するようにした。`event-schedule-app` が `.pipe(debounce(500))` と
書いているのと同じ形になる。

`ts-data-forge` の `pipe` も名前が違う: `.chain` → `.map`、`.chainOptional` →
`.mapNullable`（`parseLambdaTerm` が返すのは `Optional` ではなく
`LambdaTerm | undefined` なので、`mapOptional` ではない）。

### 捨てたもの

- `src/globals.d.ts`・`src/vite-env.d.ts` — 暗黙グローバルの shim。step 3 で
  削除した 5 件と同じ性格のもの
- `src/constants/dictionary/` — 中身が `export const dict = {} as const;` と
  「`typeof dict` が `'object'` である」ことだけを見るテストで、参照は
  `vite-env.d.ts` の global 宣言だけ。テンプレート由来の残骸
- `configs/`・`scripts/`・`e2e/`・firebase 一式・`index.html`・`public/` —
  `event-schedule-app` と同じく、**このリポジトリではビルドしない**ため

### `*.css` の宣言だけは残した

`vite-env.d.ts` の `/// <reference types="vite/client" />` が唯一実仕事を
していた部分で、`main.tsx` の `import './index.css'` がこれを要る。
ビルドしないので `vite` は依存に入っておらず、`src/css.d.mts` に
`declare module '*.css' {}` を 1 行置いた。`event-schedule-app` は同じ import を
持ちながら宣言を持たないが、あちらは依存が多く、どこかの `.d.ts` から
ambient に届いているだけである。自前で宣言するほうが壊れにくい。

### knip

`apps/*` の既定エントリは Astro サイトを仮定しているので、
`event-schedule-app` と同じく `entry: ["src/main.tsx"]` を `knip.jsonc` に
足した。足す前は依存 9 件が「未使用」と報告される。

## `better-preact-use-state` の復元（2026-09-01）

Preact 側 5 app の前提になる utils 4 つのうち 1 つ目。**依存が無い**（peer に
`preact` があるだけ）ので最初に置ける。`resize-observer-preact-hooks` がこれを
使うので、utils の中でも先に要る。

### 置き場は `apps/`

「置き場は npm の公開状況で決まった」の方針どおり private で `apps/` に置いた。
React 版の `better-react-use-state` が `libs/` にあるのは、あちらが復元ではなく
現役の公開パッケージだからで、対応させる必要は無い。

### 直した点は React 版に揃えただけ

移植元と `libs/better-react-use-state` を突き合わせると、差は 3 つとも
**React 版の側が後で直したもの**だった。復元にあたって同じ形にしてある。

| 移植元                                                        | 復元後                                |
| :------------------------------------------------------------ | :------------------------------------ |
| 戻り値のタプルが `[...]`（`useBoolState`）                    | `readonly [...]`                      |
| タプル 3 要素目にラベルが無い                                 | `setters:` を付ける                   |
| `useCallback` の deps を空にして `exhaustive-deps` を disable | `[setState]` / `[updateState]` を書く |

3 つ目は disable が 3 つ消える。`setState` も `updateState` も
`Preact.useCallback` で安定しているので、deps に書いても再生成されない。

`useState<boolean>(...)` の明示型引数を落としてあるのも React 版に合わせたもので、
理由（React Compiler の規則がカスタムフックへの `useState<T>(…)` を呼び出しでは
なく参照と読む）はあちらのコメントに書いてある。

`preact/hooks` の import は `libs/synstate-preact-hooks` と同じ
`import * as Preact from 'preact/hooks'`。移植元が付けていた
`@typescript-eslint/no-restricted-imports` の disable は、現行の設定では不要
だったので落とした。

### `--exclude index.mts` は付けなかった

`gi:src` の雛形にした `apps/resize-observer-react-hooks` は付けているが、
[#1742](https://github.com/noshiro-pf/mono/pull/1742) で調べたとおりこれは
完全な no-op である（`exclude` は index ファイルが何を export してはいけないかを
言うもので、index ファイルはそもそも export 対象から外れている）。同 PR が
残り 10 パッケージから外すので、新しく足す側には最初から書かない。

`pnpm run gi` が手書きの barrel と同じものを生成することは確認済み。

### knip

`apps/*` の既定エントリは Astro サイトを仮定しているので、React 版と同じく
`entry: ["src/index.mts"]` を `knip.jsonc` に足した。無くても現状は素通りする
（報告すべき未使用依存が無いため）が、それは検査されていないだけである。

## `blueprintjs-playground-styled` の復元（2026-09-01）

**1701 行のうち、実際に未復元だったのは 100 行ほどだった。** 残りは
`apps/react-blueprintjs-utils` に既に入っている。行数だけを見て見積もると
14 倍ずれる。

### 何が既に入っていたか

| 移植元（`src/`）                                    | 既にある場所（`apps/react-blueprintjs-utils/src/`） |
| :-------------------------------------------------- | :-------------------------------------------------- |
| `style-definitions/common/` 6 ファイル              | `constants/common/`（差は空行のみ）                 |
| `style-definitions/button/common.ts`                | `constants/button/common.mts`                       |
| `style-definitions/form/common.ts` ・ `controls.ts` | `constants/form/`                                   |
| `style-definitions/form/button-group.ts` ほか       | `components/styled/`（`Styled` 接尾辞付き）         |
| `style-definitions/utils.ts`                        | `utils/utils.mts`                                   |
| `components/numeric-input-view.tsx`                 | `components/view/numeric-input-view.tsx`（発展版）  |
| `hexToRgb`（`@noshiro/ts-utils-additional`）        | `utils/ported.mts`                                  |

差分は「復元時に付けた改良」だけである — 明示 import、`Styled` 接尾辞、
`as const`。つまり **step 3 の `react-blueprintjs-utils` の復元が、この app の
style 部分をまるごと連れてきていた**。

### したがって、そのまま復元してはいけない

docs の方針（「テンプレートが既にあるなら、無いファイルだけを取る」）どおり、
**重複させずに `react-blueprintjs-utils` から import する**形にした。新しく
入ったのは playground の外殻だけである。

- `app.tsx`（デモページ）
- `main.tsx`
- `components/button.tsx`（19 行）・`components/input-group-view.tsx`（38 行）
  — この 2 つだけは後継が無い
- `index.css`

`constants/dictionary/` は中身が `export const dict = {} as const;` の
テンプレート残骸なので、[#1746](https://github.com/noshiro-pf/mono/pull/1746) ・
[#1754](https://github.com/noshiro-pf/mono/pull/1754) と同じく持ち込んでいない。

### `NumericInputView` の props は変わっている

移植元は `<NumericInputView disabled fill value={0} />` だが、`react-blueprintjs-utils`
側の同名コンポーネントは**発展していて** `fillSpace` / `valueAsStr` になっている。
デモページは現行の API に合わせた。**同じ名前の古い実装を持ち込むより、
現行のものを使うほうが playground の目的に合う。**

### `check-destructuring-completeness`

`InputGroupView` の props は移植元では
`React.DetailedHTMLProps<React.InputHTMLAttributes<…>, …>` 全体だった。
`ts-restrictions/check-destructuring-completeness` はこれを拒否する — 300 個
ほどのプロパティのうち 4 つだけを分割代入すると、何を無視しているのかが
隠れるためである。実際に転送している 4 つだけの型に絞った。

### 残りの見積りへの含意

**他の app にも同じことが起きている可能性がある。** インベントリの行数は
「移植元のファイルの合計」であって「未復元の量」ではない。特に step 3 で
utils 系を 8 つ復元しているので、それらを使う app は既に一部が入っている。
着手前に突き合わせるほうがよい。
