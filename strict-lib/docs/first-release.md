# npm への初回 publish 手順

新しいパッケージ名を npm に**初めて**公開するときの手順。TypeScript のマイナーが
増えるたび（v7.1、v7.2 …）に、その系統の 2 パッケージ分だけ必要になる。

配布経路は npm だけになった（GitHub Release の tarball 配布は廃止。
[distribution.md](./distribution.md)）。

## なぜ手作業が要るのか

理由は 2 つあり、どちらも「初回だけ」の性質を持つ。

**1. 2FA。** アカウントが書き込みに 2FA を要求する設定だと、publish は
one-time password を求める。npm 自身のドキュメント（`npm help 7 config`）は
`otp` についてこう書いている。

> This is a one-time password from a two-factor authenticator. It's needed when
> publishing or changing package permissions with `npm access`. If not set, and
> a registry response fails with a challenge for a one-time password, npm will
> prompt on the command line for one.

`dist:npm-publish` は `child_process.exec` 経由でコマンドを実行するので **TTY が
無く、この「prompt on the command line」が成立しない**。結果、素の
`pnpm dist:npm-publish --publish` は次で止まる。

```text
npm error code EOTP
npm error This operation requires a one-time password.
```

**2. trusted publishing は後からしか設定できない。** CI から publish する場合、
npm 側の trusted publisher は**パッケージごとに**設定するもので、設定するには
そのパッケージが npm 上に既に存在している必要がある。存在しない → 設定できない →
CI から publish できない、という循環になる。最初の 1 回を手元から通すことで切れる。

## 手順

例として TypeScript 7.1 系（`strict-ts-lib-v7.1`）を初めて公開する場合を示す。
**branded 版は別パッケージではなくなった**ので、1 系統につきパッケージは 1 つである。

### 1. 公開するバージョンを確定させる

`main` の `packages/v7.1/output/lib/package.json` にあるバージョンがそのまま
初回公開バージョンになる。changesets の version PR がマージ済みであること。

```sh
git switch main && git pull
pnpm install --frozen-lockfile
```

### 2. 中身を確認する

```sh
pnpm dist:npm-publish --version=7.1                # dry-run（何も publish しない）
```

`npm notice` の `total files` と `unpacked size` を見る。`libs/**/index.d.ts` と
`libs-branded/**/index.d.ts` が 107 前後ずつ、それに `package.json` と `README.md`
が加わった数になるはず（v7.0 なら 216 ファイル）。

### 3. publish する

**方法 A — 認証コードを渡す（推奨）**

```sh
pnpm dist:npm-publish --version=7.1 --publish --otp=123456
```

`otp` を渡すと npm は `auth-type` を `legacy` として扱い、ブラウザ認証を試みない
（これも `npm help 7 config` に明記されている）。コードの有効期間は約 30 秒で、
1 系統＝ 2 パッケージなら十分間に合う。

**方法 B — tarball だけ作って自分で publish する**

プロンプトやブラウザ認証を自分の端末で普通に通したいとき、あるいは tarball の
中身を開いて確認したいときはこちら。

```sh
pnpm dist:npm-publish --version=7.1 --pack-only
# → npm-tarballs/ に .tgz が出る（*.tgz は .gitignore 済み）

npm publish npm-tarballs/strict-ts-lib-v7.1-0.1.0.tgz --access public
npm publish npm-tarballs/strict-ts-lib-v7.1-branded-0.1.0.tgz --access public
```

**最新でない系統を公開するときは `--tag` を付ける。** 付けないと npm はその
パッケージの `latest` を動かす。名前が系統ごとに分かれている現状では実害は
小さいが、既存系統の再公開では意識しておくこと。

```sh
pnpm dist:npm-publish --version=5.9 --publish --otp=123456 --tag=v5.9
```

### 4. 公開されたことを確認する

```sh
npm view strict-ts-lib-v7.1 version
npm view strict-ts-lib-v7.1 dist.tarball
```

### 5. trusted publisher を設定する

<https://www.npmjs.com/package/strict-ts-lib-v7.1> → Settings → Trusted publisher
で GitHub Actions を選ぶ。

| 項目                | 値                      |
| :------------------ | :---------------------- |
| Organization / user | `noshiro-pf`            |
| Repository          | `strict-typescript-lib` |
| Workflow filename   | `release.yml`           |
| Environment         | 空欄                    |

**この設定を済ませると、その系統は以降 CI が publish する。** `release.yml` は
GitHub Release を作ったあとに `dist:npm-publish --publish` を実行し、OIDC で
認証する（トークンは持たない）。既にレジストリにあるバージョンは skip されるので、
リリースが無い push では何もしない。

> **v5.0 〜 v7.0 は設定済みで、手動 publish も完了している**（2026-08-21）。
> 以降この文書が要るのは、**新しい TypeScript 系統を足したとき**だけ。

## 複数系統をまとめて publish する場合

`--otp` のコードは約 30 秒で失効するので、12 系統を一度に流すと
途中で `EOTP` になる。`dist:npm-publish` は系統ごとに逐次実行し、失敗した系統を
最後にまとめて報告するので、**系統を絞って新しいコードで繰り返す**のが確実。

```sh
pnpm dist:npm-publish --version=7.0 --publish --otp=<code>
pnpm dist:npm-publish --version=6.0 --publish --otp=<新しい code> --tag=v6.0
# …以下同様
```

## この手順が残る範囲

既存の系統については、もう手作業は要らない。CI が publish し、`pnpm update` が
利用者側のバージョンを動かす。**残るのは新しい系統を足したときの初回だけ**で、
それも次の節の設計変更で消せる。

## この手順を将来なくすには

**毎回この作業が必要なのは、系統ごとにパッケージ名が違うからである。**
`strict-ts-lib-v7.1` は npm から見れば新しいパッケージで、だから初回 publish も
trusted publisher 設定も新たに要る。

名前を系統に紐付けるのをやめ、**flavor をパッケージ名、TypeScript のマイナーを
バージョンの `major.minor`** に寄せると、この作業は消える。

| | 現在 | 名前をバージョンに寄せた場合 |
| :-- | :-- | :-- |
| パッケージ名 | `strict-ts-lib-v7.1` / `-branded`（系統ごとに 2 つずつ、計 24） | `strict-ts-lib` / `strict-ts-lib-branded`（計 2） |
| 利用者の指定 | URL または `strict-ts-lib-v7.1@^0.1.0` | `strict-ts-lib@~7.1.0` |
| TS 7.2 が出たとき | 新しい名前 → **初回 publish を手作業**、trusted publisher も新規に設定 | 既存パッケージの新バージョン → **手作業なし** |
| trusted publisher の設定回数 | 系統 × flavor（24） | 2 |

`@types/node` が Node のメジャーに追随するのと同じ流儀で、前例のある設計。
semver の major/minor を TypeScript のバージョンに使い切るため、lib 自体の破壊的
変更を semver で表現できなくなる点だけが引き換えになる（patch と、系統ごとの
dist-tag で運用することになる）。

移行するなら、npm publish が実際に通ることを確認したあと、changesets の
バージョン運用をどう変えるかとセットで検討する。
