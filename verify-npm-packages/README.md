# verify-npm-packages

公開しているパッケージを**実際にインストールして動かす**ための領域。ソースではなく成果物を確認する。

このリポジトリは、手元のチェックをすべて通したうえで「インストールすると壊れているパッケージ」を 3 回出荷している。

- `ts-codemod-lib` の 5 つの実行ファイル — 依存を optional peer にしていたため npm がインストールせず、`npx convert-to-readonly` が `Cannot find package 'cmd-ts'` で落ちていた
- `github-settings-as-code` — 14 モジュールが `ts-repo-utils` を import しているのに依存宣言が無く、`repo-settings backup` が起動しなかった
- `synstate` 系 5 パッケージ — `module` / `types` がビルドの出力しないファイルを指していた

`check:published-deps` はソースを、`check:knip` はマニフェストを見る。ここは**成果物そのもの**を見る。

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
| `local/`     | ignore されていない全ブランチ（code-check.yml の matrix）                             |
| `published/` | `verify-npm-packages/published/` に差分があるとき（＝ピンが動いたとき）と手動実行のみ |

## 中身

```text
smoke/<package>.mjs      チェック本体。ここだけが手で書かれている
local/packages/<pkg>/    生成物: package.json と smoke/ のコピー
published/packages/<pkg>/ 同上。依存指定が違い、コピーは smoke/ より古いことがある
```

`<pkg>/` はそれぞれが独立した pnpm workspace root で、`pnpm-workspace.yaml` と
`node_modules` を自分で持つ。install もパッケージの数だけ走る。ここは生成物のうち
`pnpm-workspace.yaml` だけ commit していない — pnpm が install 中に
`allowBuilds` を書き戻すため。

**チェックを直すときは `smoke/` を直す。** `local/` `published/` 配下は
`tools/scripts/cmd/verify-npm-packages.mts` が生成し、コミットもされている。
`local/` の生成物と `smoke/` がずれると CI の「作業ツリーが汚れていないか」チェックが落ちる。
どの公開対象の package にも対応しない `smoke/` のファイル（package の名前を
変えたり、削除したり、private にしたりした後に残ったもの）があると、生成が
そのファイルを名指して失敗する。何も実行しないのに生きたチェックに見えるので、
削除するか、今チェックする package の名前に変える。

### `published/` のチェックは `smoke/` より古くてよい

`published/packages/<pkg>/<pkg>.mjs` は、**そのピンのバージョンで最後に通った
チェック**で、`published/` の実行（`verify:npm-packages:published`）が走らせるのは
`smoke/` ではなくこのコミット済みのコピー。`smoke/` には、まだリリースしていない API
のアサーションを書ける。`local/` はこのチェックアウトから pack するのでその API を
持つが、ピンの指す公開済みバージョンには無く、同じチェックを走らせると
`SyntaxError: does not provide an export named ...` で落ちる。**ここに存在しない API
を書けるのは `local/` だけ**で、それが 2 つの空間の違いそのもの。

そのため生成は空間で違う。

|              | `<pkg>.mjs` をいつ書くか                                                              |
| :----------- | :------------------------------------------------------------------------------------ |
| `local/`     | 生成のたびに `smoke/` から上書きする                                                  |
| `published/` | project にチェックがまだ無いとき（npm に出たばかりのパッケージ）と、`--update` のとき |

`--update`（`verify:npm-packages:published:update`、`pnpm-update` workflow が実行する）
は、ピンを動かして install した後、コピーが `smoke/` と違うパッケージごとに `smoke/`
のチェックを新しいピンで走らせる。通ればコピーを置き換え、落ちればコミット済みの
コピーに戻して `kept the committed check of <pkg>` と、新しいチェックの出力を表示する。
これは「その API がまだリリースされていない」とみなして失敗にはしない。コピーは、
その API を持つバージョンにピンが動いた回に追いつく。ただしこの実行には、まさに
その箇所が壊れているリリースと区別がつかない。リリースしたはずなのにコピーが
追いつかないときは、`pnpm-update` の実行ログでその出力を読む。

`published/` のチェックは生成のときに整形もしない。この実行が書いてよいのは `smoke/`
にあるバイト列だけで、同じ実行で上がった Prettier が書き直したコピーは、もう `smoke/`
のバイト列ではない。

`pnpm-update` workflow の `commit` ジョブは、パッチに入ったコピーが `main` の
`smoke/` にあるものと 1 バイトも違わないことを確かめてからコミットする（`smoke/`
自体はパッチに入れられない）。

アサーションを足すときの手順は次のとおり。

1. `smoke/<pkg>.mjs` にアサーションを足す
2. `pnpm run gen:verify-npm-packages`（`check-changed` も実行する）で `local/` を再生成してコミットし、`pnpm run verify:npm-packages` で実際にインストールして動かす
3. `published/<pkg>` は**触らない**。手で `smoke/` を写すと、`published/` に差分が
   できて `verify-published` が走り、古いピンに対して落ちる

`pnpm run verify:npm-packages:published` を手元で走らせても、`smoke/` が先に進んで
いるだけなら作業ツリーは変わらない。

`local/` の生成物はこのチェックアウトの manifest だけで決まる（tarball のパスに
バージョンは入らず、peer 範囲は workspace から読む）。pack も install もせずに
生成だけするのが `pnpm run gen:verify-npm-packages` で、`changeset:version-packages`
がこれを呼ぶ。peer に取っている `synstate` がメジャーを上げると `changeset version`
が `synstate-dom` の peer 範囲を書き換えるので、version PR はこれ無しでは
「作業ツリーが汚れていないか」で落ちる。

生成はどちらの空間でも、publish されるパッケージのどれでもない
`packages/<name>/` を消す（改名・削除・private 化されたパッケージの残骸）。
`published/` の残りはレジストリを読まないと書けないが、何を残してよいかは読まずに
決まるので、`local/` を生成する `gen:verify-npm-packages` と `verify:npm-packages`
は `published/` からもそれを消す（`local/` の生成が `published/` に触れる唯一の
場合）。そうしないとパッケージを消した
PR では `published/` の残骸が残り、次の `pnpm-update` のパッチにその削除が入って
弾かれる。逆に `verify:npm-packages:published` は `local/` に触れない。

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
バージョン pin と同じ扱いで、毎回パッケージの数だけ registry を叩かずに済む。

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
