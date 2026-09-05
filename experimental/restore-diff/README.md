# `experimental/` からの復元 — src のファイル単位差分

`docs/monorepo-consolidation.md` の step 3「旧 mono の復元」で
`experimental/` から復元した 13 パッケージについて、**復元前の `src/` と
復元後の `src/` を 1 ファイルずつ突き合わせた差分**を置いてある。

- 1 ファイル 1 `.diff`。パスは**復元後**の `src/` からの相対パスで、
  復元前にしか無いファイルだけ復元前のパスで置いてある
- 内容が同一のファイルには `.diff` を作っていない。一覧は各パッケージの
  `_index.md` にあり、`identical` として載っている
- 対応付けは「拡張子を除いた相対パス」で行っている。`event-schedule-app` の
  `.ts` → `.mts` 190 件のような改名はこれで繋がる。それ以外の改名は
  生成器の `RENAMES` に手で書いてある（現在 1 件）

## パッケージ別

| パッケージ                                                                           | 復元先                                   |  復元前 |  復元後 |    変更 |    同一 |   追加 |   削除 |
| :----------------------------------------------------------------------------------- | :--------------------------------------- | ------: | ------: | ------: | ------: | -----: | -----: |
| [`poll-discord-app`](./poll-discord-app/_index.md)                                   | `apps/poll-discord-app`                  |      39 |      45 |      30 |       8 |      7 |      1 |
| [`lambda-calculus-interpreter-core`](./lambda-calculus-interpreter-core/_index.md)   | `apps/lambda-calculus-interpreter-core`  |      42 |      44 |      31 |      11 |      2 |      0 |
| [`io-ts-types`](./io-ts-types/_index.md)                                             | `apps/ts-fortress-types`                 |      14 |      16 |      13 |       1 |      2 |      0 |
| [`event-schedule-app-shared`](./event-schedule-app-shared/_index.md)                 | `apps/event-schedule-app-shared`         |     183 |     185 |     117 |      66 |      2 |      0 |
| [`better-react-use-state`](./better-react-use-state/_index.md)                       | `libs/better-react-use-state`            |       4 |       3 |       2 |       1 |      0 |      1 |
| [`tiny-router-observable`](./tiny-router-observable/_index.md)                       | `apps/tiny-router-observable`            |       2 |       2 |       1 |       1 |      0 |      0 |
| [`tiny-router-react-hooks`](./tiny-router-react-hooks/_index.md)                     | `apps/tiny-router-react-hooks`           |       2 |       2 |       1 |       1 |      0 |      0 |
| [`numeric-input-utils`](./numeric-input-utils/_index.md)                             | `apps/numeric-input-utils`               |       4 |       4 |       3 |       1 |      0 |      0 |
| [`react-utils`](./react-utils/_index.md)                                             | `apps/react-utils`                       |      25 |      27 |      22 |       2 |      3 |      1 |
| [`resize-observer-react-hooks`](./resize-observer-react-hooks/_index.md)             | `apps/resize-observer-react-hooks`       |       2 |       2 |       1 |       1 |      0 |      0 |
| [`react-utils-styled`](./react-utils-styled/_index.md)                               | `apps/react-utils-styled`                |       9 |      10 |       7 |       1 |      2 |      1 |
| [`react-blueprintjs-utils`](./react-blueprintjs-utils/_index.md)                     | `apps/react-blueprintjs-utils`           |      63 |      64 |      39 |      24 |      1 |      0 |
| [`event-schedule-app`](./event-schedule-app/_index.md)                               | `apps/event-schedule-app`                |     314 |     319 |     288 |      25 |      6 |      1 |
| [`lambda-calculus-interpreter-react`](./lambda-calculus-interpreter-react/_index.md) | `apps/lambda-calculus-interpreter-react` |      12 |       7 |       5 |       0 |      2 |      7 |
| [`better-preact-use-state`](./better-preact-use-state/_index.md)                     | `libs/better-preact-use-state`           |       4 |       3 |       1 |       0 |      2 |      3 |
| [`cant-stop-probability-app`](./cant-stop-probability-app/_index.md)                 | `apps/cant-stop-probability-app`         |      30 |      28 |      24 |       1 |      3 |      5 |
| [`housing-loan-calculator-app`](./housing-loan-calculator-app/_index.md)             | `apps/housing-loan-calculator-app`       |      45 |      44 |      40 |       2 |      2 |      3 |
| [`blueprintjs-playground-styled`](./blueprintjs-playground-styled/_index.md)         | `apps/blueprintjs-playground-styled`     |      30 |       7 |       6 |       0 |      1 |     24 |
| **合計**                                                                             |                                          | **824** | **812** | **631** | **146** | **35** | **47** |

## 生成

```sh
node scripts/gen-restore-diff.mjs <repo root>
```

`experimental/` は pnpm workspace の glob の外にあり、Prettier・cspell・
ESLint・markdownlint のいずれからも除外されているので、ここの内容は
リポジトリのチェックには掛からない。生成器も同じ理由でここに置いてある。
