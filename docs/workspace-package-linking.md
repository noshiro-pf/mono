# workspace パッケージの解決 — `paths` をどこまで削れるか

`apps/*` と `libs/*` の `tsconfig.json` に散っていた `compilerOptions.paths` を
**58 エントリ / 25 ファイルから 18 エントリ / 12 ファイル**へ整理した記録と、
残した 12 エントリが何のために残っているかの根拠。

## 結論

**pnpm の機能では置き換えられない。置き換えるのは pnpm ではなく
「リンク先パッケージの `package.json`」である。**

pnpm の仕事は `node_modules/<name>` に symlink を張るところで終わっており、
それは元から全部張られていた（対象はすべて `workspace:*` を宣言済み）。名前が
**どのファイル**に解決されるかを決めるのは、リンク先の `exports` / `types` で
あって pnpm ではない。`linkWorkspacePackages` を含め、pnpm 側の設定をどう変えて
も `paths` は 1 行も減らない。

減らせたのは、`paths` が肩代わりしていた仕事のほとんどが
**「リンク先が自己記述していれば要らなかったもの」**だったから。

## 前提の実測

TypeScript 6.0.2（このリポジトリが `typescript` に固定しているマイナー）で、
最小のワークスペースを作って確認した。

| #   | 条件                                                                        | 結果                                                                     |
| :-- | :-------------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| 1   | `exports` / `main` / `types` を持たないパッケージへの symlink               | `TS2307: Cannot find module` — **symlink だけでは解決しない**            |
| 2   | `"exports": "./src/index.mts"` を足す                                       | 解決する。`paths` は不要になり、ソース側の型変更にも追従する             |
| 3   | `exports` に `"source"` 条件を足し、消費側で `customConditions: ["source"]` | `src` に解決。指定しなければ `types` 条件（`dist`）に解決                |
| 4   | 自分のパッケージ名で import（自己参照）＋ `customConditions`                | `node_modules` にエントリが無くても `src` に解決する                     |
| 5   | `paths` の指す先のファイルが存在しない                                      | **エラーも警告も出ず**、黙って `exports`（＝`dist`）へフォールバックする |
| 6   | `exports` が条件マップではなく文字列（`"./src/index.mts"`）                 | 解決する。`types` 条件を書き分ける必要はない                             |

5 が今回の整理の動機である。`paths` は間違えても気づけない。実際に 4 件が
存在しないファイルを指したまま放置されており、意図に反して `dist` を見ていた。

## 元々の設計意図

`paths` は**ライブラリパッケージの `samples/` が、自分自身をパッケージ名で
import できるようにするため**に導入されたものだった。

```ts
// libs/ts-data-forge/samples/src/json/parse-example.mts
import { Json, Result } from 'ts-data-forge'; // ← 相対パスにしたくない
```

`samples/` は `doc:embed` で README に**そのまま埋め込まれる**ので、利用者が書く
のと同じ形でなければならない。かといって `dist` に解決させると「いま編集している
ソース」ではなく「前回のビルド結果」に対して型検査することになる。だから自分の
ソースへ向ける、という一点だけが目的だった。

その後の作業でこの意図が読み取られず、**「workspace のパッケージはとりあえず
`paths` でソースに向けるもの」**として横展開されたのが、整理前の 58 エントリで
ある。

## 分類と処理

| 群  | 件数 | 中身                                                                                                          | 処理                                                                                  |
| :-- | ---: | :------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------ |
| A   |   18 | `exports` を一切持たない `apps/*` の private パッケージを指す。実測 1 のとおり `paths` が唯一の解決手段だった | リンク先 10 個に `"exports": "./src/index.mts"` を足し、`paths` を**全廃**            |
| B   |   21 | ビルド成果物を持つ公開ライブラリを、あえて `src` に向けていた                                                 | **全廃**。`check-all` も CI も `ws:build` の後に型検査する設計なので、`dist` で足りる |
| C   |   13 | 自己参照（上記の元々の意図）                                                                                  | 12 を維持（不要な 2 を削除、壊れた 4 を修正、欠けていた 1 を追加）                    |
| —   |    6 | `tools/configs/tsconfig.tsx.json`                                                                             | 維持。目的が違う（下記）                                                              |

### 群 A — `exports` を書けば消える

`apps/*` の 10 パッケージは `exports` も `main` も `types` も `build` も持たない。
symlink の先に「解決できるもの」が何も無いので、実測 1 のとおり名前解決は失敗する。
`paths` はその穴を塞いでいただけで、**pnpm workspace が本来やってくれるはずの
ことを tsconfig が肩代わりしていた**状態だった。

```jsonc
// apps/react-utils/package.json
"type": "module",
"exports": "./src/index.mts",
```

これで tsc も Vite も Vitest も ESLint も同じ 1 つの記述を読む。副次的な効果と
して、依存宣言を経由するようになるので `import-x/no-extraneous-dependencies` と
knip が効くようになった（`paths` は依存宣言を完全にバイパスする）。

ビルドしない private パッケージなので、`types` と `default` を書き分ける必要は
ない（実測 6）。deep import は 0 件だったので `exports` の隠蔽が問題になることも
ない。

### 群 B — `dist` で足りる

`check-all` は `ws:build` → `ws:type-check` の順で走り、その順序には

> A package's `build` only type-checks what it publishes; everything else
> (tests, scripts, configs, lint config) imports siblings that are built
> later, so it is checked here, once every `dist/` exists.

というコメントが付いている。**型検査は `dist` が揃った状態で走ることが前提**で
あり、CI（`.github/workflows/type-check.yml`）も `Build all packages` の後に
matrix コマンドを実行する。

実際、整理前でも `apps/event-schedule-app` は `ts-data-forge` や `ts-fortress` を
`paths` 無しで、つまり `dist` 経由で解決していた。群 B の 21 エントリは一貫性を
足していたのではなく、**同じリポジトリの中に 2 通りの解決経路を作っていた**。

`apps/synstate-docs` が分かりやすい。`type-check` は `paths` で `synstate` の
`src` を見る一方、`astro build`（Vite）は `node_modules` 経由で `dist` を見る。
型検査が通ったものとビルドされたものが別物という状態だった。`paths` を外して
両者は一致した。

### 群 C — 残した 12 エントリ

残っているのは**すべて自己参照**であり、上記「元々の設計意図」そのものである。
各 tsconfig にその旨のコメントを入れた。

| パッケージ                    | エントリ                                |
| :---------------------------- | :-------------------------------------- |
| `eslint-config-typed`         | `eslint-config-typed`                   |
| `synstate`                    | `synstate`                              |
| `synstate-preact-hooks`       | `synstate-preact-hooks`                 |
| `synstate-preact-signals`     | `synstate-preact-signals`               |
| `synstate-react-hooks`        | `synstate-react-hooks`                  |
| `synstate-react-hooks-compat` | `synstate-react-hooks-compat`           |
| `ts-codemod-lib`              | `ts-codemod-lib`                        |
| `ts-data-forge`               | `ts-data-forge`                         |
| `ts-fortress`                 | `ts-fortress`                           |
| `ts-repo-utils`               | `ts-repo-utils`                         |
| `ts-type-forge`               | `ts-type-forge`, `ts-type-forge/global` |

削除した自己参照が 2 件ある。

- **`ts-std-forge`** — 自分の名前で import している箇所が 0 件だった
- **`octokit-safe-types`** — 唯一の自己参照が `test/dist_/named/named-import.mts`
  で、これは**ビルド済み `dist` を実際の `exports` マップ経由で型検査する**ため
  のテストである。自己参照 `paths` はその目的を打ち消していた

### `tools/configs/tsconfig.tsx.json` は別物

ここの 6 エントリは型検査ではなく **`tsx` の実行時解決**である。クリーン
チェックアウトから `pnpm run ws:build` を走らせるとき、ビルドスクリプト自身が
`ts-repo-utils` などを import する。`dist` はまだ無いので、ソースへ向ける以外に
起動手段が無い。CLAUDE.md の "Building from a clean checkout" が根拠であり、
今回の整理の対象外。

## 却下した案

### `exports` の `source` 条件 ＋ `customConditions`

群 C も含めて `paths` をゼロにできる唯一の案で、実測 3・4 のとおり動く。共有
ベース 1 行で全パッケージに効くという利点もある（`paths` は `extends` でマージ
されず子が丸ごと上書きするため、24 ファイルに散らざるを得なかった）。

採らなかった理由は 3 つ。

1. **公開する `package.json` に手を入れることになる。** `source` 条件は npm に
   出る成果物にも載る。`files` に `src` を含めているので実際に解決はできてしまい、
   利用者が別目的で `customConditions` を設定していると意図せずソースを引く
2. **`tsconfig.build.json` に漏れる。** 各パッケージの `configs/tsconfig.build.json`
   は共有ベースを extends しているので、共有ベースに `customConditions` を置くと
   宣言生成時にも兄弟パッケージがソース解決される。明示的なリセットが要る
3. **効果に対して範囲が広い。** 残る `paths` は 12 エントリで、すべて自己参照
   という 1 つの明確な理由に集約されている。これを消すために公開物と宣言生成の
   両方を触るのは割に合わない

将来 `paths` が再び増えるようなら、この案に切り替える。

### TypeScript project references

`composite` と emit が前提になる。`apps/*` は何もビルドしない設計なので合わない。

### pnpm の `publishConfig` による `exports` 差し替え

ローカルは `src`、公開時は `dist` に振り替える案。`pnpm pack` の出力が変わるため
`verify-npm-packages` との突き合わせが必要で、`customConditions` 案と同じ理由で
今回は見送った。

## 整理の過程で見つかった不具合

いずれも実測 5（壊れた `paths` は無言でフォールバックする）が理由で気づかれずに
残っていたもの。

**指す先のファイルが存在しなかった** — 4 件。どれも `src/entry-point.mts` を
指していたが、実在するのは `src/index.mts` である。

- `libs/synstate-preact-hooks/tsconfig.json` — さらに**パッケージ名も誤り**
  （`synstate-preact-hooks` なのに `synstate-react-hooks` と書かれていた）。
  結果としてこのパッケージには自己参照が存在せず、`samples/` は `dist` を見ていた
- `libs/synstate-preact-signals/tsconfig.json`
- `libs/synstate-react-hooks/tsconfig.json`
- `libs/synstate-react-hooks-compat/tsconfig.json`

**依存宣言も import も無い死んだエントリ** — 5 件。

- `apps/event-schedule-app/tsconfig.json` — `react-utils-styled`,
  `resize-observer-react-hooks`
- `apps/react-blueprintjs-utils/tsconfig.json` — 同上
- `libs/synstate-preact-hooks/tsconfig.json` — 上記と重複

## 再発防止 — `check:root:tsconfig-paths`

整理しただけでは同じことが起きる。ここまでの 2 つの失敗はどちらも
**TypeScript が何も言わない**のが原因なので、言う側をリポジトリに置いた。

`tools/scripts/cmd/check-tsconfig-paths.mts` が、パッケージに属する
`tsconfig*.json` をすべて読み、`compilerOptions.paths` の各エントリについて次を
検査する。`check:root:*` の一員なので `pnpm run check:root` に自動的に入り、
必須ステータスチェック `type-check-result` の下（`type-check (check:root)`）で
走る。

| 検査                             | 落ちる例                                                                |
| :------------------------------- | :---------------------------------------------------------------------- |
| キーが自分のパッケージ名か       | `apps/react-utils` が `"better-react-use-state"` を張る                 |
| 指す先が実在するか               | `"synstate-react-hooks": ["./src/entry-point.mts"]`（正は `index.mts`） |
| 指す先がパッケージの外に出ないか | `"ts-data-forge": ["../ts-data-forge/src/entry-point.mts"]`             |

実在しないときは、**同じディレクトリに実際にある入口ファイルを名指しする**
（`Did you mean \`index.mts\`?`）。取り違えの実例が
`entry-point.mts`↔`index.mts` に集中していたため。

読む範囲について。

- JSONC は `ts.parseConfigFileTextToJson` で読む。tsc 自身がこれらの設定を読む
  のと同じ関数なので、コメントや末尾カンマの扱いがコンパイラとずれない
- 各ファイル**自身の** `paths` だけを見る。`paths` は `extends` でマージされず
  子が丸ごと上書きするので、自前のブロックを持たない設定には責任が無い。
  `baseUrl` も同じファイルから読む（共有ベースはどれも設定していない）
- **`tools/configs/tsconfig.tsx.json` は対象外**。除外リストに入れているのでは
  なく、最も近い `package.json` がリポジトリルートで、どのパッケージにも属さない
  から自然に外れる。ここの `paths` は型検査ではなく `tsx` の実行時解決という別の
  機構である
- **`experimental/` と `verify-npm-packages/` は明示的に除外**。前者は pnpm
  workspace の外、後者は tarball と npm からインストールする生成物であって解決
  すべき workspace の兄弟が存在せず、その `@typescript/lib-*` は strict lib の
  README が TypeScript 7 の利用者に書けと言っているものそのもの

例外リストは意図的に持たせていない。正当な例外が出たらスクリプトを編集して理由を
その場に書く。「どこかの ignore リストに 1 行足す」より、理由が残る。

## `paths` を足したくなったときに

以下をすべて満たすときだけ足す。満たさないなら、足すべきものは `paths` ではなく
**リンク先の `exports`** か、**`package.json` の依存宣言**である。

1. **自分自身のパッケージ名か。** 他パッケージを指すなら、それは依存であって
   解決の上書きではない。`dist` で足りるはずである（`check-all` は `ws:build` の
   後に型検査する）— 上記のチェックが落とす
2. **`samples/` など「利用者と同じ書き方」が要求される場所のためか。** テストや
   スクリプトなら相対 import で足りる。ここだけは機械には判定できない
3. **指す先のファイルが実在するか。** 存在しない `paths` はエラーにならない
   — 上記のチェックが落とす
4. **理由を tsconfig にコメントとして書いたか。** 意図の書かれていない `paths`
   は、次に触る人（や coding agent）に「workspace パッケージはソース解決する
   もの」と読まれて横展開される。実際にそうなった。チェックが止められるのは
   「規則に反しているか」までで、「なぜ要るのか」は書き残すしかない
