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

| もの                              | 行数 | 中身                                       |
| :-------------------------------- | ---: | :----------------------------------------- |
| ~~`others/slack-archive-tools`~~  |  952 | Slack エクスポートの整形（復元済み・下節） |
| ~~`others/mahjong-scoring-tool`~~ |  276 | 点数計算（復元済み・下節）                 |
| `others/ts_playground`            |  104 | 型の実験場                                 |
| `others/implement-react-hooks`    |   56 | hooks の自作実装（学習用）                 |
| `slides/dezero_06_to_16`          |    — | reveal.js のスライド（HTML 直書き）        |
| `slides/chain_rule`               |    — | 同上                                       |

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

| app                                     | 行数 | 追加で要る utils             |
| :-------------------------------------- | ---: | :--------------------------- |
| `annotation-tool`                       | 2006 | **なし**                     |
| ~~`blueprintjs-playground-styled`~~     | 1701 | 大半が復元済みだった（下節） |
| ~~`housing-loan-calculator-app`~~       | 1143 | 復元済み（下節）             |
| ~~`cant-stop-probability-app`~~         |  653 | 復元済み（下節）             |
| ~~`catan-dice-app`~~                    |  471 | **なし**                     |
| ~~`lambda-calculus-interpreter-react`~~ |  196 | 復元済み（下節）             |
| ~~`blueprintjs-playground`~~            |   92 | 復元済み（下節）             |

`blueprintjs-playground-styled` が依存する `blueprint-css` は「中身が無い」箱なので、
`@blueprintjs/core` を直接使えばよい。**この 7 つは置換と書き換えだけで済む** —
step 3 で `poll-discord-app` から始めたときと同じ性格の作業になる。

`color-demo-app`（1097 行）だけは `react-mui-utils`（245 行）が要る。

### Preact 側は utils 4 つが前提になる

`algo-app`（5033）・`mahjong-calculator-app`（2428）・`my-portfolio-app-preact`
（1244）・`lambda-calculus-interpreter-preact`（190）・`slack-app`（42）の 5 つは、
`preact-utils`（472）・`tiny-router-preact-hooks`（140）・~~`better-preact-use-state`
（74）~~・~~`resize-observer-preact-hooks`（55）~~ が先に要る。合計 741 行で、いずれも
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

### 置き場は `apps/`（2026-09-04 に `libs/` へ移した）

復元時は「置き場は npm の公開状況で決まった」の方針どおり private で `apps/` に
置いた。React 版の `better-react-use-state` が `libs/` にあるのは、あちらが復元では
なく現役の公開パッケージだからで、対応させる必要は無い、と判断していた。

**この判断は 2026-09-04 に覆した。** 実装が 1 対 1 で対応する（違いは
`preact/hooks` を import するか `react` を import するかだけの）パッケージが、
片方だけ公開されていて片方は非公開、という状態を保つ理由が無い。`libs/` へ移し、
React 版と同じ形に揃えた — `private` を外し、`exports` / `files` /
`publishConfig`、rollup ビルド（`configs/` と `scripts/`）、LICENSE、
`libReplacement` の opt-in と probe（`test/strict-lib-active.mts`）を足してある。

**初回 publish の手作業（[libs/first-release.md](../libs/first-release.md)）は
要らない。** このパッケージは旧単独リポジトリから 2025-02 に npm へ出ている
（`1.0.0` / `1.0.1` / `1.0.3`）。復元時に「未公開だから `apps/`」と判断したのは
**事実の確認を飛ばしていた**ということでもある — 方針そのもの（置き場は npm の
公開状況で決まる）に照らしても、最初から `libs/` が正しかった。

そのため `package.json` の version は `1.0.0` ではなく npm の最新に合わせた
`1.0.3` である。`1.0.0` のまま置くと、次の changeset の patch が既に存在する
`1.0.1` を作ろうとして release が落ちる。

> **React 版には同じ問題が残っている。** `libs/better-react-use-state/package.json`
> は `1.0.0` だが、npm には同じく `1.0.3` まで出ている。まだ changeset が 1 つも
> 出ていないので表面化していないだけで、最初の patch で落ちる。別途直すこと。

移した結果、`knip.jsonc` の `apps/better-preact-use-state` エントリは要らなく
なった（`libs/*` の既定が同じ `src/index.mts` を見る）。`verify-npm-packages` は
公開パッケージを自動で拾うので、`smoke/better-preact-use-state.mjs` を足した。
npm に既にあるので `notYetPublished` は空のままで、local（tarball）と published
（`1.0.3` ピン）の両方の空間で検査される。

### README は移植元から復元した — React 版も直した

`libs/better-react-use-state/README.md` は復元時に**移行作業のメモ**として書かれて
いた（「`experimental/` から復元した」「戻す途中で何が変わったか」）。それは
この文書が書く内容であって、npm のパッケージページに出るものではない。**両方とも
`experimental/packages/utils/*/README.md` から復元した** — Overview・
Installation・Usage・API Reference・Benefits があり、ライブラリの使い方を説明して
いる。移植元との違いは 2 つだけで、見出しレベルを `##` から `#` に上げたことと、
末尾の License を `MIT` から実際に同梱している `Apache-2.0` に直したことである。

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

## `cant-stop-probability-app` の復元（2026-09-01）

React 側 7 app のうち 2 つ目。**追加の npm 依存が要らない**ことを理由に選んだ
（下節）。

### 「追加で要る utils なし」は npm 依存については何も言っていない

上の表は**ワークスペース内の utils** を数えたもので、外部依存は別である。実際に
7 app の import を調べると、そのままでは入らないものが混ざっている。

| app                             | リポジトリに無い npm 依存                      |
| :------------------------------ | :--------------------------------------------- |
| `blueprintjs-playground`        | なし                                           |
| `cant-stop-probability-app`     | **なし** ← 今回                                |
| `blueprintjs-playground-styled` | なし（`ts-utils-additional` の後継確認は要る） |
| `housing-loan-calculator-app`   | なし                                           |
| `catan-dice-app`                | `@mui/material`                                |
| `color-demo-app`                | `@mui/material`                                |
| `annotation-tool`               | `pixi.js-legacy` / `uuid`                      |

`@mui/material` と `pixi.js-legacy` はどちらも小さくない依存で、**入れるかどうかは
復元とは別の判断**になる。先に「何も足さずに入るもの」から片付けるほうがよい。

### API の対応

| 移植元                                | 復元後                                         |
| :------------------------------------ | :--------------------------------------------- |
| `@noshiro/io-ts` の `t.uintRange`     | `ts-fortress` の `uintRange`（引数形は同じ）   |
| `t.TypeOf`                            | `ts-fortress` の `TypeOf`                      |
| `toSafeUint` / `toPositiveSafeInt`    | `asSafeUint` / `asPositiveSafeInt`             |
| `ISet.new`                            | `ISet.create`                                  |
| `ArrayOfLength<N, T>`                 | `FixedLengthTuple` / `MutableFixedLengthTuple` |
| `Tpl.sorted`                          | 後継なし（不要だった。下節）                   |
| `createState`（オブジェクト分割代入） | タプル + `useObservableValue`                  |
| `pipe().chain()`                      | `pipe().map()`                                 |

**ts-type-forge のグローバル型はこれらの app では効かない。** `event-schedule-app`
が `import { type ReadonlyRecord } from 'ts-type-forge'` と明示 import している
とおりで、`DeepReadonly` / `FixedLengthTuple` / `Mutable` / `UintRange` /
`SafeUint` もすべて名前で import する必要がある。

### 直した 2 箇所は、直さないと lint が通らなかった

どちらも `unicorn/no-break-in-nested-loop`（入れ子ループの中で `continue` を
使うな）に引っかかる。

1. **`selected3List`** — 3 重ループで `y <= x` / `z <= y` を `continue` で飛ばし、
   最後に `Tpl.sorted` していた。`values.slice(i + 1)` で「前より後ろから選ぶ」と
   書けば**昇順は構成上保証される**ので、`Tpl.sorted` は元から何もしていない。
   後継が無いことが問題にならなかった理由でもある
2. **`countSuccess`** — 4 重ループの最内側で `continue` を 3 通りの分岐に使って
   いた。最内側の本体を `progressFor`（`'noLine' | 'oneLine' | 'twoLine'` を返す）
   に切り出し、ループは `mut_count[progressFor(...)] += 1` だけにした

**等価性は型検査ではなく実測で確かめた。** 移植元の実装と復元後の実装を素の
JavaScript に写して突き合わせ、`selected3List` は 165 組が順序まで一致、
`countSuccess` は 165 組すべてで 1296 通りの出目の内訳が一致することを確認した。
step 3 で「型検査に通ったことは移植が等価であることの証明にならない」と書いた
とおりなので、**この 2 つにはテストも足した**（`toHaveLength(165)` / 昇順 /
重複なし / 3 カウンタの和が 6^4 / 既知の 1 組）。

### `variant={'minimal'}`

Blueprint 6 で `minimal` が `@deprecated` になっており、`event-schedule-app` は
既に `variant={'minimal'}` に移っている。同じ形にした。

### `paths` にはあるが `dependencies` には無いもの

`react-blueprintjs-utils` をソース解決すると、そこが import している
`ts-fortress-types` / `better-react-use-state` / `react-utils-styled` /
`resize-observer-react-hooks` も解決できる必要がある。ただし**このパッケージ自身は
どれも import していない**ので、`paths` にだけ書いて `dependencies` には入れない。
knip がこれを正しく指摘する。

## `housing-loan-calculator-app` の復元（2026-09-01）

React 側 7 app のうち 2 つ目。45 ファイル・1178 行で、ここまでで最大。追加の
npm 依存は要らない。

### 45 ファイルは手書きせず機械変換した

1 つずつ書き直すには大きすぎるので、`src` をコピーしてから順に機械変換し、
**残りは type-check に列挙させた**。

1. `.ts` → `.mts` に改名（`.tsx` はそのまま）
2. 相対 import に拡張子を付与（ディレクトリは `/index.mjs`、`.tsx` は `.js`、
   `.mts` は `.mjs`）。`@noshiro/*` はパッケージ名を置換
3. 関数名の一括置換（下表）
4. ファイルごとに使われている名前を見て import 行を挿入

この時点で型エラーは 158 → 43 → 0 と落ちた。**4 の推測は完全ではなく**、
`.map(` を `map` の使用と読むなどして余計な import を 4 件足したが、
`TS6133`（未使用）で全部挙がるので取り除けばよい。

| 移植元                            | 復元後                                      |
| :-------------------------------- | :------------------------------------------ |
| `toUint32` / `toSafeUint`         | `asUint32` / `asSafeUint`                   |
| `toNonZeroFiniteNumber`           | `asNonZeroFiniteNumber`                     |
| `toPositiveFiniteNumber`          | `asPositiveFiniteNumber`                    |
| `toPositiveSafeInt`               | `asPositiveSafeInt`                         |
| `createVoidEventEmitter`          | `createEventEmitter`                        |
| `debounceTime`                    | `debounce`                                  |
| `setInitialValue`                 | `withInitialValue`                          |
| `.chain(`                         | `.pipe(`                                    |
| `t.simpleBrandedNumber('Yen', 0)` | `brandedNumber({ typeName, defaultValue })` |
| `mapOptional(x, f)`               | `pipe(x).mapNullable(f).value`              |
| `ArrayOfLength`                   | `FixedLengthTuple`                          |

`simpleBrandedNumber` は `ts-fortress` にあるが `@deprecated`（`brandedNumber`
を使え）で、**引数もオプションオブジェクトに変わっている**。

### `withSlash` を `tiny-router-observable` から export した

`uriWithQueryParams` は `Router.utils.withSlash` しか使っていないのに、
`Router` を import するために `createRouter()` が走り、**import しただけで
`window.location` を読む**。付属のテストは Node で動かないので落ちる。

`withSlash` は純粋な文字列変換で、`Router.utils` として既に公開されている。
**module-private だったのを export しただけ**で、新しい API ではない。これで
`uriWithQueryParams` は router に依存しなくなり、テスト 5 件が Node で通る。

### 財務計算は実測で等価性を確かめた

`ith-borrowing-balance-in-pier.mts` の `q ** (-1 * n)` は、`lint:fix` が
`q ** -n` に書き換え、そこを `@typescript-eslint/no-unsafe-unary-minus` が
「branded な整数に単項マイナスを付けるな」と拒否する — **2 つの規則が互いを
打ち消す**。`const numPayments: number = n;` と広げてから負号を付けて解いた。

指数の書き換えなので、丸めが変わっていないことを確かめる必要がある。移植元と
復元後を素の JavaScript に写し、期間 6 通り × 金利 6 通り × 元本 4 通り ×
支払い回数 4 通りの **576 ケースで `Object.is` 一致**（最大絶対差 0）。

### `useMemo` は名前空間経由で

`react-coding-style/import-style` が `import * as React from 'react'` を要求
するので、`useMemo` / `useCallback` / `StrictMode` はすべて `React.` 経由に
した。`StrictMode` を落とさなかったのは、実行時の挙動（開発時の二重描画）が
変わるためで、`event-schedule-app` が持っていないことに合わせる理由は無い。

## `blueprintjs-playground` の復元（2026-09-01）

`blueprintjs-playground-styled` の**素の双子**。同じデモページを、こちらは
Blueprint 自身の `NumericInput` / `InputGroup` で描く。2 つ並んで初めて
「Blueprint の実物」対「スクラッチで組んだ同等品」という比較になる。

中身は `app.tsx` ・ `main.tsx` ・ `index.css` の 3 つだけで、
`apps/` 側との重複は無い（`@blueprintjs/core` を直接使うため）。`#1758` で
styled 版に起きたような「大半が既に入っていた」ということは無かった。

### `index.css` は原文のまま

`normalize.css` ・ `@blueprintjs/icons` ・ `datetime2` ・ `datetime` ・ `select`
の `@import` が並ぶが、**`event-schedule-app` も同じ一覧を持ったまま
`@blueprintjs/core` と `datetime` しか宣言していない**。スタイルシートは
bundler の関心事で、このリポジトリでは何もビルドしない。同じ扱いに揃えた。

最初はこの playground が描かない `datetime` 系と `select` を削ったが、
**兄弟に合わせるほうが正しい** — 差を作る理由が無い。

### `noop` はローカルに置いた

移植元では暗黙グローバルだった。後継は `react-blueprintjs-utils` の
`utils/ported.mts` にあるが、**この playground が同パッケージを要る理由は
それしかない**。`() => undefined` 1 行のためにパッケージ依存を足すのは
釣り合わないので、`app.tsx` の中に置いて理由をコメントにした。

`constants/dictionary/` は `export const dict = {} as const;` の
テンプレート残骸なので持ち込んでいない（#1746 ・ #1754 ・ #1758 と同じ）。

### これで「追加の npm 依存が要らない React app」は片付いた

`#1754` で分けた 4 つ（`blueprintjs-playground` ・
`cant-stop-probability-app` ・ `blueprintjs-playground-styled` ・
`housing-loan-calculator-app`）がすべて復元済みになった。React 側に残るのは
**外部依存の判断が要る 3 つ**である。

| app               | 要る npm 依存                                  |
| :---------------- | :--------------------------------------------- |
| `catan-dice-app`  | `@mui/material`                                |
| `color-demo-app`  | `@mui/material` ＋ `react-mui-utils`（未復元） |
| `annotation-tool` | `pixi.js-legacy` ・ `uuid`                     |

## `others/` の 6 つを見た（2026-09-01）

`apps` 側で「追加の npm 依存が要らないもの」を出し切ったので、`others` を
1 つずつ見た。**6 つのうち復元する価値があるのは 2 つ**である。

| もの                           | 判断                                                 |
| :----------------------------- | :--------------------------------------------------- |
| `others/mahjong-scoring-tool`  | **復元した**（下節）                                 |
| `others/slack-archive-tools`   | **復元した**（下節）                                 |
| `others/implement-react-hooks` | **復元しない**。未完成の学習用スクラッチ             |
| `others/ts_playground`         | **復元しない**。TypeScript ハンドブックの写経        |
| `slides/dezero_06_to_16`       | HTML 直書きの reveal.js スライド。パッケージではない |
| `slides/chain_rule`            | 同上                                                 |

`implement-react-hooks` は `useState` が `initialState` をそのまま返し、
`useEffect` が引数を `console.log` するだけの**書きかけ**で、トップレベルに
`console.log` が並ぶ。`ts_playground` は `20200928_modules` ・
`20201016_namespaces` という日付ディレクトリに TypeScript 公式ドキュメントの
例（`ZipCodeValidator` など）が置いてあるもので、**存在しないモジュール**
（`'hot-new-module'` ・ `'math-lib'` ・ `'json!http://example.com/data.json'`）を
import しているのでそもそもコンパイルできない。どちらも「取っておく価値の
あるものだけ持ってくる」の対象外である。

## `mahjong-scoring-tool` の復元（2026-09-01）

外部依存は無く、import している名前は 2 つだけだった。

| 移植元                                          | 復元後                        |
| :---------------------------------------------- | :---------------------------- |
| `toUint32`（`@noshiro/mono-utils`）             | `asUint32`（`ts-data-forge`） |
| `getShuffled`（`@noshiro/ts-utils-additional`） | 後継が無いので同梱（下記）    |

`getShuffled` は `react-blueprintjs-utils` の `utils/ported.mts` と同じ扱いで、
**後継が無いものはそれを使うパッケージに置く**。ここでは `createPointMap` の
テスト 1 箇所だけが使う（生の点数の並び順で結果が変わらないことの確認）。

### `as` を 5 つ消した

移植元は `ArrayOfLength4<T>`（= `readonly [T,T,T,T]`）を自前で定義し、
`.map()` の結果を毎回そこへキャストしていた。`Array.prototype.map` はタプルを
`U[]` に広げるためで、**5 箇所すべてに
`total-functions/no-unsafe-type-assertion` の disable が付いていた**。

4 要素ぶんを書き下す `map4` を置けば全部要らなくなる。

```ts
const map4 = <T, U>(
  tuple: FixedLengthTuple<4, T>,
  mapFn: (value: T, index: 0 | 1 | 2 | 3) => U,
): FixedLengthTuple<4, U> => [ mapFn(tuple[0], 0), … ];
```

**添字を `number` ではなくリテラル union にするのが要点。** 呼び出し側は
その添字で別の 4-タプルを引くので、`noUncheckedIndexedAccess` の下では
リテラルでないと `number | undefined` になり、移植元にあった `!`（非 null
アサーション）が必要になってしまう。

`toSorted` だけは長さを型で保てないので、4 要素を書き下して `?? 0` で受けた。
`ArrayOfLength4` は `ts-type-forge` の `FixedLengthTuple<4, …>` に置き換えた。

**テスト 6 件が通ることで等価性を確認している。** そのうちの 1 つが
`getShuffled` で順序を入れ替えて同じ結果になることを見ているので、
`map4` の書き換えはそこで実際に効いている。

## `slack-archive-tools` の復元（2026-09-01）

`others/` の 2 つ目。952 行 10 ファイル。**これで `others/` は片付いた**
（残り 4 つのうち 2 つは復元しない判断、2 つは reveal.js のスライド）。

### `zx` の暗黙グローバルが 42 箇所

`import 'zx/globals'` が `path` と `fs` をグローバルに生やしていた。型エラー
68 件のうち 42 件がこれで、`node:path` と `node:fs/promises` の明示 import に
置き換えた。**`node:fs` ではなく `node:fs/promises`** である — zx の `fs` は
`fs-extra` で、`readFile` などが Promise を返す。

| 移植元                               | 復元後                               |
| :----------------------------------- | :----------------------------------- |
| `@noshiro/io-ts`（`t.*` 12 種）      | `ts-fortress`（全部そろっている）    |
| `@noshiro/ts-utils`                  | `ts-data-forge`                      |
| `execAsync`（`@noshiro/mono-utils`） | `$`（`ts-repo-utils`）               |
| `zx/globals` の `path` / `fs`        | `node:path` / `node:fs/promises`     |
| `ISet.new` / `toUint32` / `.chain(`  | `ISet.create` / `asUint32` / `.map(` |

io-ts の 12 種（`enumType` ・ `mergeRecords` ・ `nonEmptyArray` ・ `partial` ・
`positiveSafeInt` ほか）は**すべて `ts-fortress` にある**。`export function` の
オーバーロードなので `export const` で grep すると見つからない点に注意。

### `Json.stringify` は `undefined` を返し得る

`JSON.stringify` は `undefined` ・関数 ・ symbol に対して `undefined` を返す。
`ts-data-forge` の `Json.stringify` はそれを型に書いているので、`Result` を
剥がしたあとに `string | undefined` が残る。ここでは `Json.parse` の結果を
書き戻すだけなので実際には起きないが、書かないと通らない。ガードを 1 つ足した。

### 規則同士が打ち消し合う 3 例目

`unicorn/no-break-in-nested-loop`（入れ子ループで `continue` を使うな）と
`unicorn/prefer-continue`（ループ本体を丸ごと `if` で包むな）が正面から
ぶつかる。#1756 の `-1 * n`、#1762 の `includes` / `some` に続く 3 例目。

**前者の警告文が答えを書いている** — 「入れ子のループを関数に切り出せ」。
`collectSubKeys` ・ `collectSubArrayKeys` ・ `collectRecordKeys` に切り出すと、
`continue` はそれぞれの関数で最外周のループに属することになり、どちらの規則
にも触れない。ネストが 1 段深いほうは 2 段階に分ける必要があった。

### barrel は作らない

10 モジュールのうち **5 つは import した時点で `await main()` が走る**道具で
ある。`pnpm run gi` が生成した `index.mts` はそれらを再エクスポートするので、
barrel を読むだけでツールが動いてしまう。ライブラリとしての面が無いので、
`gi` スクリプトごと外した。knip には 5 つの入口を個別に登録している。

（`main` という名前が 2 モジュールで衝突して `TS2308` になったことで気付いた。）

## `catan-dice-app` の復元（2026-09-01）

MUI を使う 3 app の 2 つ目。**依存はすべて main にあるので、スタックに載せず
`main` の直上に置いた。**

### 宣言と実態がまた食い違っていた

移植元の `dependencies` は `@mui/icons-material` と `better-react-use-state` を
挙げているが、**ソースはどちらも import していない**（knip が検出）。
実際に増えた npm 依存は `@mui/material` と emotion ・ `@fontsource/roboto`
だけで、**アイコンパッケージは要らなかった**。

「`package.json` ではなく import を見る」は #1750・#1778 で 2 度書いたが、
MUI 待ちにしていた 4 つを数え直したときの表（#1777）で
`catan-dice-app` を「1/21 ファイルが MUI」としたのも同じ話で、
実際に必要だったのは `@mui/material` 1 つだった。

### synstate に `interval` は無い — `counter` がそれ

`syncflow` の `interval(50)` は `synstate` では `counter(50)`
（`libs/synstate/src/core/create/counter.mts`）。
一定間隔で増える整数を流すので、`interval(50).chain(take(11))` は
`counter(50).pipe(take(11))` にそのまま置き換わる。

observable の `.chain(op)` は `.pipe(op)`、`pipe()` の `.chain(f)` は `.map(f)`
で、**同じ名前のメソッドが 2 つの別物に対応する**点に注意が要る。

### `Reducer` はここでも移植した

`@noshiro/react-utils` のグローバルにあった `Reducer<S, A>` に後継は無い。
`apps/react-utils` が `src/utils/` に同じ 1 行を移植しているので、
それに倣って利用箇所の隣に置いた。

### 型の爆発は 11 要素でも起きる

`Arr.zip(domain, sumCount)`（どちらも 11 要素タプル）で `TS2589` ・ `TS2590`
になった。#1779 の 360 要素ほどでなくても、`const` 型引数で両方のタプル形状を
再構成しようとすれば十分に重い。受け手が求めているのは
`readonly (readonly [number, number])[]` なので、素の `.map` にした。

### そのほか

- `constants/dictionary/` は**今回も残骸**で、参照していたのは削除対象の
  `vite-env.d.ts`（グローバル宣言）だけだった。`constants/` はこれしか
  持っていなかったので、ディレクトリごと落ちている。
- `@fontsource/roboto` は #1779 と同じく `src/index.css` の `@import`。
- `NumberType.ArraySize` は `Uint32` に置き換えた（`Uint32.add` ・
  `Uint32.random` を使っているので、これが元の意図）。
- `Arr.pushed` → `Arr.toPushed`、`Arr.asMut` → `castMutable`、
  `MutableArrayOfLength<N, T>` → `Mutable<FixedLengthTuple<N, T>>`。

## `preact-utils` の復元（2026-09-01）

Preact 側 utils 4 つのうち 3 つ目。**`better-preact-use-state` を使うので
#1748 の上に積んである。**

### React 版が答えを全部持っていた

`apps/react-utils` は同じ 23 ファイルの React 版で、復元済み・lint 通過済み。
ファイル一覧を突き合わせると差は 3 つだけで、**詰まった箇所はすべてあちらに
解決済みの形があった**。

| 詰まった点                                | `react-utils` の答え                                           |
| :---------------------------------------- | :------------------------------------------------------------- |
| `getPlatform` / `PromiseState` の後継無し | `src/utils/` に移植済み。そのままコピーした                    |
| `TimerId` が未定義                        | `type TimerId = Parameters<typeof clearTimeout>[0];`           |
| `Reducer` が未定義                        | `type Reducer<S, A> = (prev: S, action: A) => S;`              |
| `createTinyObservable` の後継無し         | `synstate` の `source` を使う `use-observable.mts` に置換      |
| `usePrevious` が render 中に ref を読む   | state で書き直す（前の _描画_ ではなく前の _異なる値_ になる） |
| codemod が `resolvers` を readonly にする | `mut_resolvers` に改名                                         |

**`TimerId` の形は #1761 で `synstate` に提案したものと同じだった。**
あちらは独立に導いたものだが、リポジトリには既に前例があったことになる。

### `preact.FunctionComponent` が props を広げる

規則同士がぶつかる 4 例目。`memoNamed` の引数を
`preact.FunctionComponent<Props>` と書くと、その型は `RenderableProps<Props>`
＝ `Props` ＋ `children` ・ `ref` ・ `key` ・ `jsx` なので、
`ts-restrictions/check-destructuring-completeness`（全プロパティを分割代入せよ）
を**構造的に満たせない**。分割代入に `Readonly<Props>` の注釈を足すと、今度は
`@typescript-eslint/prefer-readonly-parameter-types` が
「`ComponentChild` は deeply readonly ではない」と言う。

`memoNamed` の引数を素の関数型 `(props: Readonly<Props>) => preact.VNode | null`
にすると両方消える。React 19 の `FC` も `children` を足さなくなっているので、
**2 つのパッケージが揃うことにもなる**。

### 依存の食い違い

インベントリは 5 つの Preact app すべてが utils 4 つを要ると書いているが、
**import を見ると違う**。`slack-app` と `lambda-calculus-interpreter-preact` は
`goober` と `preact` しか import していない（#1750 の
`tiny-router-preact-hooks` と同じ、manifest と import の食い違い）。

ただし `slack-app` は復元しない。`app.tsx` が
`<div data-e2e={'root'}>{'root'}</div>` を返すだけの**空の雛形**で、
`dict` もテンプレート残骸である。中身が無い。

## `lambda-calculus-interpreter-preact` の復元（2026-09-01）

Preact 側 app の 1 つ目。**`preact-utils` を使うので #1770 の上に積んである**
（#1770 は #1748 の上）。

### インベントリより依存が少ない

インベントリは utils 4 つ（`preact-utils` ・ `better-preact-use-state` ほか）が
要ると書いているが、**実際に必要なのは `preact-utils` の `memoNamed` だけ**で
ある。`better-preact-use-state` は `preact-utils` 経由で解決に要るだけなので、
`paths` に書いて `dependencies` には入れていない。

`state.mts` は React 版（#1746、マージ済み）と**1 文字も違わなかった**ので、
そちらの書き換えをそのまま使った。

| 移植元                                | 復元後                         |
| :------------------------------------ | :----------------------------- |
| `createState` のオブジェクト分割代入  | タプル ＋ `useObservableValue` |
| `.chain(debounceTime(200))`           | `.pipe(debounce(200))`         |
| `pipe().chain()` / `.chainOptional()` | `.map()` / `.mapNullable()`    |
| `@noshiro/goober`                     | npm の `goober`                |

### `goober` を足した理由

インベントリが**そう指示している** — 「`blueprint-css` と `goober` は名前こそ
utils だが、実体はベンダのファイルを置いただけの箱。復元するなら npm の本家
（`@blueprintjs/core`、`goober`）を直接使う」。

`@mui/material` や `pixi.js-legacy` とはここが違う。あちらはインベントリが
「その app が依存している」と記録しているだけで、**採用してよいとは書いて
いない**。goober は後継が名指しされている。

### `onChange` の型

React 版は `React.ChangeEventHandler<HTMLTextAreaElement>` を使っていた。
Preact の同名の型は `JSX` 名前空間側が `@deprecated`（#1750 の
`MouseEventHandler` と同じ）なので、`ev.target` を `EventTarget | null` で
受けて `instanceof HTMLTextAreaElement` で絞る形にした。**型としても
そのほうが正確**である — `target` は本当に他の要素でもあり得る。

### 残りの Preact app

utils が 4 つとも揃ったので、`algo-app`（5033）・`mahjong-calculator-app`
（2428）・`my-portfolio-app-preact`（1244）が着手可能になる。ただし
`my-portfolio-app-preact` は `preact-media-hook` という別の npm 依存も要る。
`slack-app` は中身が無いので復元しない（#1770）。

## `mahjong-calculator-app` の復元（2026-09-01）

Preact 側 app の 2 つ目。38 ファイル・3196 行。**#1772 の上に積んである**
（`preact-utils` と `goober` を使うため）。

### import だけを見ると依存を読み違える

#1750 ・ #1770 ・ #1772 で「manifest ではなく import を見よ」と書いたが、
**この app ではそれだけでは足りなかった**。explicit import には Preact utils が
1 つも現れないのに、`memoNamed` を暗黙グローバルとして使っている。

`globals.d.ts` が並べていた `@noshiro/global-*` の参照ぶんを足して初めて
本当の依存が出る。**import ＋ globals.d.ts の両方を見る**のが正しい。

### `dict` は本物だった

`constants/dictionary/` を、#1746 ・ #1754 ・ #1758 ・ #1760 と同じ
「テンプレート残骸」だと判断していったん削除したが、**この app のものは
中身がある**（39 行の日本語ラベル）。コミット前に気付いて戻した。
`dict = {} as const` かどうかを app ごとに見る必要がある。

### 対応表

| 移植元                                   | 復元後                                                       |
| :--------------------------------------- | :----------------------------------------------------------- |
| `Maybe.isNone` / `isSome`                | `Optional.isNone` / `isSome`                                 |
| `Arr.pushed(a, x)` / `Arr.removed(a, i)` | `[...a, x]` / `a.toSpliced(i, 1)`（後継なし）                |
| `Arr.asMut`                              | `castMutable`                                                |
| `Arr.head`                               | 戻りが `Optional` になったので `=== undefined` では絞れない  |
| `Tpl.map`                                | 後継なし。長さが要る場所は先頭 3 つを書き下す                |
| `ArrayOfLength` / `ArrayAtLeastLen`      | `FixedLengthTuple` / `MinLengthTuple`                        |
| `createBooleanState`                     | 戻りは `[state, utils]` の 2 要素（`createState` は 3 要素） |
| `Record` / `Exclude` / `Extract`         | `ReadonlyRecord` / `StrictExclude` / `StrictExtract`         |

`Json.stringify` が `string | undefined` を返す件（#1769）もここで出た。

### `memoNamed` の戻り型が狭すぎた

#1770 で `memoNamed` の引数を素の関数型にしたとき、戻りを
`preact.VNode | null` と書いた。**`VNode` は props について不変**なので、
`createElement` が返す `VNode<具体的なprops>` を代入できない。この app の
button-group 3 つで初めて露見した。

`preact.ComponentChildren` に直し、**#1770 側を修正して**このブランチを
その上に rebase してある。#1770 単体でも直っている。

### `src/services/` は UI から呼ばれていない

`calculate` ・ `downloadProblemAsImage` ・ `downloadHmrFormatText` を import
しているコンポーネントが無い。**移植元でも同じ**なので、移植で落としたもの
ではない。knip の entry に `src/services/index.mts` を並べて、dead code では
なく入口として扱っている。

## `resize-observer-preact-hooks` の復元（2026-09-01）

Preact 側 utils の 4 つ目。これで 4 つとも揃う。

**復元スタックの一番上に積み直した。** `better-preact-use-state` を使うので
当初は #1748 の直上に置いたが、`algo-app` がこのパッケージと `goober`
（#1772）の両方を必要とし、兄弟ブランチをまたぐ菱形になってしまう。
#1773 の上に載せ替えて一直線にしてある。

React 版（`apps/resize-observer-react-hooks`）が復元済みなので、そちらの
判断をそのまま引き継いだ。

| 移植元                                  | 復元後（React 版と同じ）                                               |
| :-------------------------------------- | :--------------------------------------------------------------------- |
| `resize-observer` の polyfill           | 使わない。今のブラウザは `ResizeObserver` を持ち、`lib.dom` が型を持つ |
| `preact.RefObject<E>`                   | `preact.RefObject<E \| null>`                                          |
| 戻り値 `[Size, Ref]`                    | `readonly [size: Size, ref: …]`（ラベル付き）                          |
| `RefObject<E \| null>`（React 版の字面） | `preact.RefObject<E>` — 下記                                            |
| `@noshiro/ts-utils` の `Arr`            | `ts-data-forge`                                                        |
| `useState`（`better-preact-use-state`） | そのまま（#1748 で復元済み）                                           |

`gi:src` に `--exclude index.mts` は付けていない。React 版は付けているが、
[#1742](https://github.com/noshiro-pf/mono/pull/1742) のとおり no-op であり、
同 PR が既存パッケージからも外している。

**初回から type-check・lint とも 0 件**だったが、これは**利用者がまだ
いなかったから**でもあった。

### preact の `RefObject` は React 19 と意味が違う

React 版に揃えて戻り値を `React.RefObject<E | null>` の字面どおり
`preact.RefObject<E | null>` と書いていたが、これは誤りだった。

| | `RefObject<T>` の定義 | null を含む書き方 |
| :--- | :--- | :--- |
| React 19 | `{ current: T }` | `RefObject<E \| null>` |
| Preact 10 | `{ current: T \| null }` | `RefObject<E>` |

preact では二重に null を付けたことになり、`<div ref={ref}>` が受け取らない。
`my-portfolio-app-preact` がこのフックの最初の利用者になって露見した。
`Preact.useRef<E>(null)` はオーバーロード
`useRef<T>(initialValue: T | null): RefObject<T>` に当たるので、
React 版の `React.useRef<E>(null)` とも形が揃う。

**型の意味ではなく字面を写すと、こうなる。**
