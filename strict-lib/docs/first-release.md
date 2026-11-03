# npm への初回 publish 手順

新しい TypeScript の系統（例: `strict-ts-lib-v7.1`）を npm に**初めて**公開する
ときの手順。パッケージに共通の手順は [libs/first-release.md](../../libs/first-release.md)
にあり、ここにはそれと違うところだけを書く。既にある系統には要らない — 2 回目
以降は `.github/workflows/release.yml` の `changeset publish` が OIDC で publish
する。

## libs/first-release.md と同じところ

- **初回だけ手作業になる理由**: trusted publisher は npm 上に存在するパッケージに
  しか設定できないので、最初の 1 回は手元から publish する。
- **順序**: 系統を追加する pull request を `main` にマージしたあと、changesets の
  version pull request をマージする**前に**手動 publish を済ませる。そのために、
  系統を追加する pull request には、新しい系統を含むすべての `-source` ハーネスを
  名指す changeset を付ける。changeset が無いと、マージした push で
  `release.yml` が version pull request を作らずに publish へ進み、まだ npm に
  無い系統の OIDC publish が 404 で落ちる。
- **trusted publisher の設定値**: 下の「5. trusted publisher を設定する」の通り、
  Repository は `mono`、Environment は `release`。

## strict-lib で違うところ

- **1 系統につきパッケージは 1 つ**。系統のディレクトリの `output/lib/`（7.0 なら
  `strict-lib/v7.0/output/lib/`）がそのまま `strict-ts-lib-vX.Y` で、branded 版は別パッケージではなく同じパッケージの
  `libs-branded/` にある。
- **publish は `pnpm publish` ではなく `pnpm run strict-lib:publish`**
  （`strict-lib/scripts/cmd/dist-npm-publish.mts`）。バンドルを `npm pack` して
  `npm publish` する。既定は dry-run で、`--publish` を付けたときだけ公開する。
- **2FA のコードを `--otp` で渡す**。このスクリプトは `child_process.exec` 経由で
  コマンドを実行するので TTY が無く、npm の one-time password の対話入力
  （`npm help 7 config` の `otp` にある「prompt on the command line」）が成立
  しない。`--otp` 無しで 2FA が要ると、次で止まる。

    ```text
    npm error code EOTP
    npm error This operation requires a one-time password.
    ```

## 手順

例として TypeScript 7.1 系（`strict-ts-lib-v7.1`）を初めて公開する場合を示す。

### 1. 公開するバージョンを確定させる

`main` の、その系統の `output/lib/package.json`（7.0 なら
`strict-lib/v7.0/output/lib/package.json`）にあるバージョンがそのまま
初回公開バージョンになる。各系統のハーネス（`strict-ts-lib-vX.Y-source`）は
changesets の `fixed` グループで同じバージョンに揃い、`strict-lib:gen:packages`
がそれをバンドルの `package.json` に写す。

```sh
git switch main && git pull
pnpm install --frozen-lockfile
```

### 2. 中身を確認する

```sh
pnpm run strict-lib:publish -- --version=7.1   # dry-run（何も publish しない）
```

`npm notice` の `total files` と `unpacked size` を、既にある系統（例えば
`--version=7.0`）の dry-run と比べる。`libs/` と `libs-branded/` の lib ごとの
`index.d.ts`、それに `package.json`、`README.md` などが入っているはず。

### 3. publish する

**方法 A — 認証コードを渡す（推奨）**

```sh
pnpm run strict-lib:publish -- --version=7.1 --publish --otp=123456
```

`otp` を渡すと npm は `auth-type` を `legacy` として扱い、ブラウザ認証を試みない
（これも `npm help 7 config` に明記されている）。コードの有効期間は約 30 秒で、
1 系統 1 パッケージなら十分間に合う。

**方法 B — tarball だけ作って自分で publish する**

プロンプトやブラウザ認証を自分の端末で普通に通したいとき、あるいは tarball の
中身を開いて確認したいときはこちら。

```sh
pnpm run strict-lib:publish -- --version=7.1 --pack-only
# → strict-lib/npm-tarballs/ に .tgz が出る（*.tgz は .gitignore 済み）

npm publish strict-lib/npm-tarballs/strict-ts-lib-v7.1-<version>.tgz --access public
```

**最新でない系統を公開するときは `--tag` を付ける。** 付けないと npm はその
パッケージの `latest` を動かす。名前が系統ごとに分かれている現状では実害は
小さいが、既存系統の再公開では意識しておくこと。

```sh
pnpm run strict-lib:publish -- --version=5.9 --publish --otp=123456 --tag=v5.9
```

### 4. 公開されたことを確認する

```sh
npm view strict-ts-lib-v7.1 version
npm view strict-ts-lib-v7.1 dist.tarball
```

### 5. trusted publisher を設定する

<https://www.npmjs.com/package/strict-ts-lib-v7.1> → Settings → Trusted publisher
で GitHub Actions を選び、[libs/first-release.md](../../libs/first-release.md)
の「4. npm で trusted publisher を設定する」の表の値を登録する。Repository は
`mono`、Environment は `release` で、Environment を空欄にしないこと（理由もそこに
ある）。

**この設定を済ませると、その系統は以降 CI が publish する。** `release.yml` は
`changeset publish` を `release` environment で実行し、OIDC で認証する（トークンは
持たない）。設定を飛ばした、あるいは値を間違えたときに Release が 404 で落ちる
様子と、その切り分けも `libs/first-release.md` にある。

## 複数系統をまとめて publish する場合

`--otp` のコードは約 30 秒で失効するので、多くの系統を一度に流すと途中で
`EOTP` になる。`strict-lib:publish` は系統ごとに逐次実行し、失敗した系統を
最後にまとめて報告し、既にレジストリにあるバージョンは skip するので、**系統を
絞って新しいコードで繰り返す**のが確実。

```sh
pnpm run strict-lib:publish -- --version=7.0 --publish --otp=<code>
pnpm run strict-lib:publish -- --version=6.0 --publish --otp=<新しい code> --tag=v6.0
# …以下同様
```

## この手順を将来なくすには

**毎回この作業が必要なのは、系統ごとにパッケージ名が違うからである。**
`strict-ts-lib-v7.1` は npm から見れば新しいパッケージで、だから初回 publish も
trusted publisher 設定も新たに要る。

名前を系統に紐付けるのをやめ、**TypeScript のマイナーをバージョンの
`major.minor`** に寄せると、この作業は消える。

| | 現在 | 名前をバージョンに寄せた場合 |
| :-- | :-- | :-- |
| パッケージ名 | `strict-ts-lib-v7.1` など（系統ごとに 1 つ） | `strict-ts-lib`（1 つ） |
| 利用者の指定 | `strict-ts-lib-v7.1@^0.6.0` | `strict-ts-lib@~7.1.0` |
| TS 7.2 が出たとき | 新しい名前 → **初回 publish を手作業**、trusted publisher も新規に設定 | 既存パッケージの新バージョン → **手作業なし** |
| trusted publisher の設定回数 | 系統の数 | 1 |

`@types/node` が Node のメジャーに追随するのと同じ流儀で、前例のある設計。
semver の major/minor を TypeScript のバージョンに使い切るため、lib 自体の破壊的
変更を semver で表現できなくなる点だけが引き換えになる（patch と、系統ごとの
dist-tag で運用することになる）。

移行するなら、changesets のバージョン運用をどう変えるかとセットで検討する。
