# life-plan-simulator

Google スプレッドシートで作っている収支シミュレーターを、
[synstate-dom](../../libs/synstate-dom) の SPA にしていくためのアプリ。

スプレッドシートの各シートをタブにしている。画面で編集できるのは入力値だけで、
計算で導出される値（手取り・税金・評価額・残高など）は表示のみなので、計算式を
壊すことがない。

公開先: <https://noshiro-pf.github.io/mono/life-plan-simulator/>（`main` への push で
`deploy-pages.yml` が載せる）

Google アカウントでサインインし、入力値は「プラン」ごとに Cloud Firestore へ自動で
保存する。プランはいくつでも作れ、ヘッダーで切り替え・作成・複製・名前の変更・削除が
できる。「保存・読み込み」タブでは、開いているプランを JSON ファイルに書き出したり、
JSON ファイルを新しいプランとして（または開いているプランの入力値として）読み込んだり
できる（[プランのファイル](#プランのファイル)）。仕組みは [task-manager-app](../task-manager-app) と
同じ:

- サインインは Firebase Auth の Google サインインで、ポップアップで行う（ページと
  認証ドメインが別のため、リダイレクト方式は Safari のストレージ分離で失敗する）。
- Firestore はオフラインキャッシュ（IndexedDB）を使い、オフライン中の変更は
  接続が戻ったときに送る。
- サインアウトすると端末内のキャッシュを消す。オフライン中の変更が送れていなければ
  サインアウトせずに知らせ、変更を破棄してサインアウトするか選べる。
- 開いているプランの id だけをブラウザの localStorage に残し、次に開いたときに
  同じプランを開く。

見た目は [blueprint-synstate](../../libs/blueprint-synstate) のコンポーネント
（Blueprint のマークアップを synstate-dom で組んだもの）と Blueprint のスタイル
シートで描く。React は読み込まない。テーマはライト・ダーク・「システム設定に
合わせる」から選べ（既定は「システム設定に合わせる」）、選んだテーマはブラウザの
localStorage に残す。ダークは `<body>` の `bp6-dark` で、Blueprint のダークテーマに
グラフなどの色を `src/index.css` で合わせている。

## 構成

- `src/domain/` — 計算。シートごとにモジュールを分けている。
    - `input/` — 入力値の型と既定値（`ts-fortress` のスキーマ）。保存した値は
      `SimulationInput.fill` で欠けた値を既定値で補って読み込む。
    - `salary/` — `年収` シート。月給・賞与から健康保険料・厚生年金保険料・
      雇用保険料・所得税・住民税を引いた手取り。
    - `pension/` — `年金受給額` シート。受給開始年齢ごとの受給額・手取りと損益分岐。
    - `investment/` — `積立NISA` / `投信（課税枠）` シート。
    - `defined-contribution/` — `確定拠出型年金` シート。
    - `housing-loan/` — `住宅ローン` シート。返済スケジュールと住宅ローン控除。
      返済スケジュールの計算は `experimental/life-plan-simulator` から移したもの。
    - `cash-flow/` — `収支` シート。上のすべてをまとめて月ごとの収支と現預金の
      残高を求め、`収支グラフ` シートの判定（現預金が 0 / 下限を下回る月が無いか
      など）を行う。
    - `tax/`, `year-month/` — 税金・保険料の表引きと、年月の扱い。
- `src/data/` — `data_` で始まるシートの表と、制度で決まっている率や額
  （`system-parameters.mts`）。v1 ではハードコードしていて、制度が改定されたら
  ここを直す。協会けんぽの保険料額表は東京都、令和 6 年 3 月分〜。
- `src/repository/` — プランの型と文書の変換、保存先のインターフェース
  （`PlanRepository`）、テストとデモ用のメモリ上の実装。
- `src/firebase/` — Firebase Auth と Firestore の実装。`src/api/` — Firestore の
  読み書きのすべて（書き込む文書をスキーマで刈り込む。ほかのディレクトリからは
  `eslint.config.mts` で読み書きを禁じている）。
- `src/store/` — セッション（サインイン・サインアウト）、プランの一覧と開いている
  プラン、その入力値と計算結果、テーマ。
- `src/components/` — 画面。`src/utils/` — 入力値の変換と金額の表示。
  `src/view-model/` — エミュレータの接続先やサインインのエラー文言など。

## スプレッドシートとの違い

計算はスプレッドシートの式をそのまま移している。実際の値で計算結果を突き合わせて、
次の点だけが違うことを確かめた。

- スプレッドシートで手入力されていた最初の数か月の値（社会保険料・住民税など）も
  年収の推移から計算する。住民税は 12 か月前の月給から求める。
- 住宅ローンの返済額は返済開始月から計上する（スプレッドシートでは `収支` シートの
  参照先の行がずれていた）。
- 厚生年金保険料は報酬月額の範囲で等級を引く（スプレッドシートは標準報酬月額の
  列で引いていた）。
- 年金の住民税の基礎控除と均等割を円単位で計算する（スプレッドシートは 43 円・
  0.5 円になっていた）。所得税と退職所得の所得税は速算表で計算する。
- 給与の源泉徴収税額は月額表の 740,000 円以上の部分も式で計算する。
- 積立 NISA・確定拠出年金の初期値は「開始月の投資の前の評価額」として扱う。
- 何年かおきの支出は「初回の年月から間隔ごと」に出る（スプレッドシートは 2027 年
  1 月を基準にした年に出ていた）。
- 確定拠出年金の掛金は `年収` シートの企業型 DC と iDeCo の掛金から求め、二重に
  入力しないようにした。

実際の収入・資産額・生年月日といった個人の値はこのリポジトリ（公開）には入れず、
既定値は一般的な例にしている。

## データ構造

```text
users/{uid}/plans/{planId}   { name, createdAt, updatedAt, input }
```

- `input` は `SimulationInput` そのもの（`src/domain/input/`）。読み込むときに
  `SimulationInput.fill` で欠けた値を既定値で補うので、入力項目を増やしても
  古いプランはそのまま開ける。
- 自分の `users/{uid}/plans` だけを読み書きでき、ほかは拒む（`firestore.rules`）。
  `users/{uid}` の文書そのものは作らない。
- 初回のサインインではプランが無く、「新しいプラン」で既定値のプランを作る。

## プランのファイル

「保存・読み込み」タブが書き出し、読み込むファイル（`src/repository/plan-file.mts`）:

```text
{ "$schema": "<公開している JSON Schema の URL>", "name": "プラン名", "input": { ... } }
```

- `input` は `SimulationInput` そのもの。読み込むときは保存したプランと同じく
  `SimulationInput.fill` で欠けた値・読めない値を既定値で補い、補った値を画面に
  列挙する。最初の版が書き出した、入力値だけのファイルも読める。
- JSON Schema は `PlanFile` から ts-fortress の `toJsonSchema` で生成した
  `public/plan-file.schema.json`（`pnpm run gen:schema`）で、アプリと一緒に
  `https://noshiro-pf.github.io/mono/life-plan-simulator/plan-file.schema.json` に
  載る。書き出したファイルはその URL を `$schema` に持つので、対応するエディタで
  開くと補完・検査される。`PlanFile` を変えたら `gen:schema` を走らせる
  （生成物が古いと `plan-file.test.mts` が落ちる）。

## Firebase の手作業

Firebase プロジェクトは `life-plan-simulator-9eab3`（`.firebaserc`）。次はリポジトリの
CI では行われないので、オーナーが手で行う。

1. **ログインプロバイダ**: Authentication → ログイン方法で Google を有効にする。
   `firestore.rules` も Google でサインインしたトークンしか受け付けない。
2. **承認済みドメイン**: Authentication → 設定 → 承認済みドメインに `localhost` と
   `noshiro-pf.github.io` を入れる。
3. **セキュリティルールのデプロイ**: Firestore を作り、`pnpm run test:rules` が
   通ることを確かめてから、このディレクトリで
   `firebase deploy --only firestore:rules`。`firestore.rules` を変更しただけでは
   反映されない。`firebase-tools` は依存に入れていないので、手元に入れて使う。

## Run

From the repository root, build the workspace once so that `synstate`,
`synstate-dom` and `blueprint-synstate` have a `dist/`:

```sh
pnpm install
pnpm run ws:build
```

Then start the dev server:

```sh
cd apps/life-plan-simulator
pnpm run dev
```

It listens on <http://localhost:5197/mono/life-plan-simulator/>
(`tools/configs/app-dev-ports.mts`).

### Emulators

The dev server connects to local Firebase emulators (Authentication and
Firestore), not to a real project. Start them first, in this directory:

```sh
firebase emulators:start   # needs firebase-tools and Java 21 or later
```

| Emulator       | Port |
| :------------- | :--- |
| Authentication | 9299 |
| Firestore      | 8280 |
| UI             | 4200 |

The ports are in `firebase.json`, which the app reads too; they do not clash
with task-manager-app's or event-schedule-app's emulators. Sign in through the
Auth emulator's popup with a made-up account. To use the real project instead,
set `VITE_FIREBASE_EMULATORS` to anything but `true` (in an untracked
`.env.development.local`, or on the command line); a production build never
connects to the emulators.

### Demo mode

`?storage=memory` runs the dev server without signing in, on one plan of the
default inputs held in memory (a reload starts over):
<http://localhost:5197/mono/life-plan-simulator/?storage=memory>. The e2e tests use it. It is behind
`import.meta.env.DEV`, so a production build does not contain it.

### Rules tests

`pnpm run test:rules` loads `firestore.rules` into the Firestore emulator and
runs `test/` against it with `@firebase/rules-unit-testing`: a user reads and
writes their own plans, in the shape the rules allow, and nothing else; other
users, signed-out access, tokens from providers other than Google and every
other path are refused. `emulators:exec` starts and stops the emulator, so stop
a running `firebase emulators:start` first. It needs Java 21 or later and is
not a `check:` script, because no CI runner has Java and the emulator. Run it by
hand before deploying a change to `firestore.rules`.
