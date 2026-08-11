# 新しいパッケージの初回リリース手順

`libs/` に追加したパッケージを npm へ**初めて**公開するときの手順。2 回目以降は
changesets が自動で行うので、この文書が要るのは初回だけ。

## なぜ初回だけ手作業なのか

`.github/workflows/release.yml` は npm のトークンを一切持っていない。publish は
**trusted publishing（OIDC）** で認証している。

```yaml
permissions:
    id-token: write # required for OIDC / npm provenance
```

trusted publisher は npm 側で**パッケージごとに**設定するもので、設定するには
そのパッケージが npm 上に存在している必要がある。つまり、

- パッケージが存在しない → trusted publisher を設定できない
- trusted publisher が無い → ワークフローは publish できない

という循環になる。これを断ち切るために、最初の 1 回だけ手元から publish する。

## 手順

以下、例として `ts-codemod-cli` を `1.0.0` で公開する場合を示す。

### 1. パッケージを追加する PR を `main` にマージする

`main` の `package.json` に書かれているバージョンがそのまま初回公開バージョンに
なる。`1.0.0` で出したいなら `main` 上で `1.0.0` になっていること。

### 2. Release PR より先に手動 publish する

`main` が進むと changesets が「chore: version packages」PR を作る（または更新
する）。**この PR をマージする前に**手動 publish を済ませること。順序を逆にすると、
まだ trusted publisher の無いパッケージを OIDC で publish しようとして Release
ワークフローが落ちる。

### 3. クリーンな状態でビルドして publish する

```sh
git switch main && git pull
pnpm install --frozen-lockfile
pnpm run ws:build

cd libs/ts-codemod-cli
pnpm publish --dry-run --no-git-checks --no-provenance   # 中身を確認
pnpm publish --no-git-checks --no-provenance
```

`--dry-run` を外す前に、`pnpm pack` した tarball の `package.json` を開いて
`dependencies` が `workspace:` のまま残っていないかを見ておくと確実。

フラグの理由:

- **`pnpm publish` を使う（`npm publish` ではなく）**。`workspace:^` のような
  指定子を実際のレンジへ展開できるのは pnpm だけ。`npm publish` はそのまま公開
  してしまい、インストールできないパッケージができあがる
- **`--no-provenance`**。`publishConfig.provenance` が `true` なので、何も指定
  しないと npm は provenance の生成を試みて失敗する。provenance は CI の OIDC が
  前提で、手元からは作れない。2 回目以降は CI が生成する
- **`--no-git-checks`**。pnpm は既定でブランチ名や未コミット変更を確認する。
  `main` の clean な状態で実行しているなら省いてもよい

npm 側で 2FA を要求される場合は `--otp <code>` を足す。

### 4. npm で trusted publisher を設定する

<https://www.npmjs.com/package/ts-codemod-cli> → Settings → Trusted publisher で
GitHub Actions を選び、次を登録する。

| 項目                | 値            |
| :------------------ | :------------ |
| Organization / user | `noshiro-pf`  |
| Repository          | `mono`        |
| Workflow filename   | `release.yml` |
| Environment         | 空欄          |

### 5. Release PR をマージして自動化に戻す

以降は changesets が OIDC で publish する。provenance も自動で付く。

## 初回公開バージョンについての注意

新しいパッケージが**同じリリースで一緒に上がる別のパッケージに依存している**
場合、changesets はそれを patch で押し上げる（`.changeset/config.json` の
`updateInternalDependencies: "patch"`）。

`ts-codemod-cli` の例では、`ts-codemod-lib` が 2.2.5 → 3.0.0 になるのに合わせて
`ts-codemod-cli` も 1.0.0 → 1.0.1 になった。依存レンジ `^2.2.5` が 3.0.0 を含まず
書き換えが必要なので、バージョンを上げずには済ませられない。

つまり Release PR をマージすると、手動で公開した 1.0.0 の直後に 1.0.1 が出る。
これは避けられないので、

- **1.0.0 を初回リリースとして残したい** → 手順どおり先に手動 publish する
  （本ドキュメントの前提）
- **番号を飛ばしたくない** → 依存先が上がらないタイミングまで新パッケージの
  リリースを待つ

のどちらかを選ぶ。

## チェックリスト

- [ ] `main` の `package.json` が意図した初回バージョンになっている
- [ ] `publishConfig.access` が `public`（scoped パッケージは特に）
- [ ] `files` に `dist` が入っている
- [ ] `repository.directory` がパッケージのパスを指している
- [ ] Release PR をマージする**前**に手動 publish した
- [ ] `pnpm publish`（`npm publish` ではない）を使った
- [ ] trusted publisher を設定した
- [ ] 公開後、まっさらなディレクトリで実際にインストールして動かした

最後の項目は省略しないこと。`ts-codemod-lib` の CLI は
`peerDependenciesMeta` の `optional: true` のせいで公開物として一度も動いて
おらず、それが発覚したのはこの確認を行ったときだった。

```sh
mkdir /tmp/verify && cd /tmp/verify && npm init -y
npm i -D ts-codemod-cli
npx convert-to-readonly --help
```
