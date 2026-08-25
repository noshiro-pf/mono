<!-- cspell:ignore kyoukai kenpo -->

# life-plan-simulator

住宅ローンの返済スケジュール計算と、協会けんぽの保険料額表。
`noshiro-pf/life-plan-simulator` から残す価値のある部分だけを取り出したもの。

- `src/housing-loan/` — 元利均等返済の返済スケジュール計算。金利が毎月上がって
  いき上限で頭打ちになるシナリオに対応する。テスト付き。
- `src/data/` — 協会けんぽの保険料額表。`.mts`（型付きの定数）と `.json`（同じ
  データの素の形）の 2 つ。
- `scripts/` — 上のデータを作るのに使った使い捨てのスクリプト。

## Provenance

削除される標準リポジトリ <https://github.com/noshiro-pf/life-plan-simulator> の
ブランチ `implement-react-app` の先端、コミット
`974b0bf5546d21211a64b8d00c0dce8a9a638b08`（2026-01-24、オープンだった PR #3）から
取り込んだ。ファイルの中身は verbatim で、この README だけが追加物。

**`main` ではなくこのブランチから取ったのは、`main` に固有の内容が無いため。**
このリポジトリは
[typescript-template](https://github.com/noshiro-pf/typescript-template) から作られ
たまま `main` は一度もそこから進んでおらず、`src/` はテンプレートの `add.mts` と
browser / node のサンプルだけだった。固有の内容は、下に挙げた 12 ファイルとして
この 1 コミットにだけ存在する。テンプレート本体は現存するので取り込んでいない。

**ブランチ名に反して React アプリは入っていない。** `package.json` には React 19・
Blueprint.js・Emotion と `configs/vite.config.ts` を指す `dev` スクリプトが足されて
いたが、その config も `.tsx` も 1 つも書かれないまま止まっている。実体はコミット
メッセージのとおり "feat: add kenpo-table"。

取り込まなかったもの:

- テンプレート由来のファイル一式（`package.json`、lockfile、`configs/`、
  `.github/workflows/`、`eslint.config.mts`、`src/add.mts` など）。
- `docs/` — TypeDoc の生成物。このブランチが `.gitignore` から `/docs/` を消した
  ために追跡されてしまったもので、`main` では後の PR #71 で再び追跡から外された。
- `src/index.mts` — ここに持ってきていない `add.mjs` / `browser` / `node` を
  再 export しているため。`src/data/index.mts` と `src/housing-loan/index.mts` は
  そのまま入っている。

## 動かすには

`experimental/` は pnpm workspace の glob の外にあり、ESLint・tsc・knip・Prettier・
cspell・markdownlint のいずれの対象でもない。install もビルドもされないので、
**このディレクトリのコードはそのままでは動かない。**

`src/housing-loan/calculate-housing-loan.mts` が依存しているのは `ts-data-forge` の
`Num` だけで、それはこのリポジトリの [libs/ts-data-forge](../../libs/ts-data-forge)
にある。復活させるなら、`libs/` か `apps/` の下に置いて import を張り直すのが早い。

`scripts/` の 5 本は使い捨ての探索用スクリプトで、再実行はできない。4 本が
`xlsx` パッケージで `収支シミュレーター.xlsx` を読むが、そのファイルは
`/home/noshiro/` および `./assets/` にあった手元のもので、リポジトリには入って
いない（`xlsx` も、取り込んでいない `package.json` の devDependency だった）。
`src/data/` の表がどう作られたかの記録として残してある。`test_loan_calc.mjs` だけは
依存が無く、`calculate-housing-loan.mts` と同じ計算式を素の JavaScript で検算する
だけのもの。
