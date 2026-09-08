# verify-npm-packages

公開しているパッケージを**実際にインストールして動かす**ための領域。ソースではなく成果物を確認する。

このリポジトリは、手元のチェックをすべて通したうえで「インストールすると壊れているパッケージ」を 3 回出荷している。

- `ts-codemod-lib` の 5 つの実行ファイル — 依存を optional peer にしていたため npm がインストールせず、`npx convert-to-readonly` が `Cannot find package 'cmd-ts'` で落ちていた
- `github-settings-as-code` — 14 モジュールが `ts-repo-utils` を import しているのに依存宣言が無く、`repo-settings backup` が起動しなかった
- `synstate` 系 5 パッケージ — `module` / `types` がビルドの出力しないファイルを指していた

`lint:published-deps` はソースを、`knip` はマニフェストを見る。ここは**成果物そのもの**を見る。

## 2 つの空間

|              | インストール対象                                | 答える問い                                   |
| :----------- | :---------------------------------------------- | :------------------------------------------- |
| `local/`     | このチェックアウトから `pnpm pack` した tarball | 次のリリースは壊れていないか                 |
| `published/` | npm の**固定バージョン**（コミットしてある）    | 今 consumer が使っているものは壊れていないか |

```sh
pnpm run verify:npm-packages              # local
pnpm run verify:npm-packages:published    # published
```

`published/` は `local/` より古いことがある。修正をマージしてからリリースするまでの間は、`published/` だけが落ちているのが正しい状態になる。

`published/` が `latest` ではなく**固定バージョン**（`packages/*/package.json` にコミット）を参照しているのは、リリースが出た瞬間に無関係なブランチが落ち始めるのを避けるため。バージョンは `pnpm-update` workflow が `--update` で更新し、他の依存更新と同じくレビュー可能な差分として PR に乗る。

CI の走らせ方はこの性質に合わせてある。

|              | いつ走るか                                                                            |
| :----------- | :------------------------------------------------------------------------------------ |
| `local/`     | ignore されていない全ブランチ（type-check.yml の matrix）                             |
| `published/` | `verify-npm-packages/published/` に差分があるとき（＝ピンが動いたとき）と手動実行のみ |

## 中身

```text
smoke/<package>.mjs      チェック本体。ここだけが手で書かれている
local/packages/<pkg>/    生成物: package.json と smoke/ のコピー
published/packages/<pkg>/ 同上、依存指定だけが違う
```

`<pkg>/` はそれぞれが独立した pnpm workspace root で、`pnpm-workspace.yaml` と
`node_modules` を自分で持つ。install も 32 回走る。ここは生成物のうち
`pnpm-workspace.yaml` だけ commit していない — pnpm が install 中に
`allowBuilds` を書き戻すため。

**チェックを直すときは `smoke/` を直す。** `local/` `published/` 配下は
`tools/scripts/cmd/verify-npm-packages.mts` が生成し、コミットもされている。
生成物と `smoke/` がずれると CI の「作業ツリーが汚れていないか」チェックが落ちる。

**ただし、まだリリースしていない API のアサーションを足したときは `published/`
を再生成しない。** 再生成すると、ピンの指す公開済みバージョンにはまだ無い名前を
import することになり、`SyntaxError: does not provide an export named ...` で
`verify-published` が落ちる。**ここに存在しない API を書けるのは `local/` だけ**
で、それが 2 つの空間の違いそのもの。手順は次のとおり。

1. `smoke/<pkg>.mjs` にアサーションを足す
2. `pnpm run verify:npm-packages` で `local/` だけを再生成してコミットする
3. `published/<pkg>` は**触らない**

`published/` の生成物が古いままでも「作業ツリーが汚れていないか」は落ちない。
`local/` を再生成するのは `verify:npm-packages`、`published/` を再生成するのは
`verify:npm-packages:published` で、後者が CI で走るのは
`verify-npm-packages/published/` に差分があるときだけ — つまり触らなければ走らない。
`published/` は次にピンが動くとき（`pnpm-update` の `--update`）に、新しい API を
持つバージョンと一緒に追いつく。

## 独立性をどう担保しているか

依存を宣言し忘れたパッケージを検出するには、各 project が**自分の宣言した依存しか
解決できない**必要がある。実測してみると、素直に作っただけでは 4 通りの抜け道があった。
いずれも「未宣言の依存があるパッケージが検査を素通りする」形で、この仕組みが
検出すべきものそのものだった。

| 抜け道                                                                                          | 対策                                         |
| :---------------------------------------------------------------------------------------------- | :------------------------------------------- |
| 1 つの project に全パッケージを入れると、他のパッケージが持ってきた依存を使えてしまう           | パッケージごとに 1 workspace に分ける        |
| pnpm 既定の hoisting で `node_modules/.pnpm/node_modules` 経由で解決できてしまう                | `hoist: false`                               |
| **この領域はリポジトリの中にあるため、Node の解決がリポジトリ root の `node_modules` まで遡る** | `isolate.mjs` の resolve hook                |
| peer dependency が project をまたいで漏れる                                                     | 1 workspace 1 パッケージ + peer を自分で宣言 |

3 つ目が最も厄介で、`ts-fortress` の project から `ts-data-forge` を import すると
`<repo>/libs/ts-data-forge/dist/entry-point.mjs`（tarball ですらなく**ソースのビルド**）
が解決できてしまっていた。`isolate.mjs` は project の外に解決されたものをすべて拒否する。
`NODE_OPTIONS` 経由で渡しているので、パッケージの実行ファイルを spawn するチェックでも
境界が効く。

4 つ目は pnpm 12 で開いた。pnpm 12 は peer dependency を importer 側で解決する
ケースを増やしたため、**何も宣言していない importer には何も入らない**。実測した
2 つの壊れ方はどちらもこの形だった。

- `eslint-config-typed` が連れてくる ESLint plugin が軒並み `eslint` peer を
  失い、`eslint-plugin-unicorn` はリポジトリ root の `eslint` を掴んだ。
  `isolate.mjs` が捕まえるべきものそのもの。
- `eslint-plugin-ts-data-forge` に、自身の peer 範囲 `>=5.0.0 <7.0.0` に反する
  `typescript@7.0.2` が渡った。隣の `ts-type-forge` project が
  `typescript: latest` を要求していたため。1 つの workspace を共有していた頃の、
  上の表の 1 行目がそのまま peer 経由で戻ってきた形になる。

対策は 2 つで、どちらも「consumer が実際にやること」に寄せたもの。project ごとに
workspace を分けたので隣の project の解決は届かず、各 project は**そのパッケージ
自身が宣言する peer 範囲**を dependencies に書く。範囲はパッケージ自身のものなので、
何が検査されるかは変わらない。範囲の出どころだけが空間で違う。

|              | peer 範囲の出どころ                                                   |
| :----------- | :-------------------------------------------------------------------- |
| `local/`     | このチェックアウト（tarball の pack 元）                              |
| `published/` | commit してある値。`--update` で pin を動かすときだけ registry を引く |

公開済みバージョンの manifest は不変なので、commit した答えは正しいままになる。
バージョン pin と同じ扱いで、毎回 32 回 registry を叩かずに済む。

optional な peer は書かない。consumer が持っていないかもしれないから optional
なのであって、持っていない consumer こそ検査する価値がある。

もう 1 つ、インストールの側にも落とし穴がある。tarball はバージョンを含まない固定名で
pack しているため、**中身が変わってもパスが変わらない**。pnpm は `file:` 依存をパスで
識別するので、`--force` を付けてもロックファイルを消しても前回の tarball を再利用する。
`node_modules` を削除しないと再展開されない（実測）。そのため毎回削除してから
install している。

## リポジトリ内パッケージ同士の依存

`pnpm pack` は `workspace:^` を**チェックアウト時点のバージョン**に解決する。
`chore: version packages` ブランチでは、`github-settings-as-code` の tarball が
`octokit-safe-types@^1.2.26` を要求する一方 npm にはまだ 1.2.25 しか無い、という状態に
必ずなる。素直に install すると `ERR_PNPM_NO_MATCHING_VERSION` で落ちる。
リリースするためのブランチでこそ通らないチェックになってしまう。

各 project の `pnpm-workspace.yaml` の `overrides` で、リポジトリ内のパッケージは
すべてこのチェックアウトから pack した tarball に向けている。バージョンブランチ以外でも
解決先は npm 上の**古い方**の sibling だったので、「次のリリース」を見るという
`local/` の目的にはこちらが正しい。ここに入っているパッケージは同時にリリースされる。
宣言した範囲が公開済みのものと合っているかは `published/` 側の問い。

## 効いていることの確認方法

3 つの不具合を再現して、それぞれ検出されることを確認できる。

```sh
# 1. 実行ファイルが使う依存を devDependencies へ移す → Cannot find package
# 2. smoke に未宣言の import を足す        → resolved outside the check space
# 3. module / types に存在しないパスを書く → advertised but not published
```

型しか公開していないパッケージ（`ts-type-forge`）は import ではなく `tsc --noEmit`
でチェックする。実行するものが無いため。
