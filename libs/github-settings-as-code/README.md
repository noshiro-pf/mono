# Github Settings as Code

GitHub の repository 設定を JSON ファイルで管理するための CLI。

設定ファイルは repository root の `repo-settings/` から読む。

> **v3.0.0 での破壊的変更**: 読み込み元が `github/` から `repo-settings/` に
> 変わった。`git mv github repo-settings` で移行する。旧名は `.github/` の
> 別名に見えて、workflow もここにあると誤解させるものだった。

## Usage

```sh
repo-settings <command> [target] [options]
```

| Command  | 説明                                         |
| -------- | -------------------------------------------- |
| `apply`  | ローカルの設定ファイルを GitHub に反映する   |
| `backup` | GitHub の現在値をローカルの `bk/` に保存する |

| Target        | 対応するファイル                                  | `apply` | `backup` |
| ------------- | ------------------------------------------------- | ------- | -------- |
| `all`（既定） | すべて                                            | ✅      | ✅       |
| `repository`  | `repo-settings/repository-settings/settings.json` | ✅      | ✅       |
| `rulesets`    | `repo-settings/rulesets/*.json`                   | ✅      | ✅       |
| `variables`   | repository variables                              | ✅      | —        |
| `actions`     | `repo-settings/actions-settings/settings.json`    | ✅      | ✅       |
| `pages`       | `repo-settings/pages/settings.json`               | ✅      | ✅       |

```sh
repo-settings apply
repo-settings apply rulesets
repo-settings backup
repo-settings apply --owner noshiro-pf --repo ts-repo-utils
```

## 対象 repository の解決

以下の順で決まる。通常は `git remote` から決まるため、どちらの指定も不要。

1. コマンドライン引数 `--owner` / `--repo`
2. 環境変数 `OWNER` / `REPO_NAME`
3. `git remote get-url origin`
4. `package.json` の `name`（ repository 名のみ ）

## 認証

以下の順で解決される。ローカルでは `gh auth login` 済みであれば設定不要。

1. 環境変数 `GITHUB_APP_TOKEN` / `GH_TOKEN` / `PERSONAL_ACCESS_TOKEN`
2. `gh auth token`（ gh CLI のログイン情報 ）

CI では GitHub App の installation token を `GH_TOKEN` に渡す。 repository
設定・ruleset の操作には **Administration** 権限が必要で、既定の `GITHUB_TOKEN`
では権限が足りない（`permissions:` に `administration` は存在しない）。

## 管理できる設定

| ファイル                                          | GitHub 上の場所                         |
| ------------------------------------------------- | --------------------------------------- |
| `repo-settings/repository-settings/settings.json` | Settings > General                      |
| `repo-settings/rulesets/*.json`                   | Settings > Rules > Rulesets             |
| `repo-settings/actions-settings/settings.json`    | Settings > Actions > General            |
| `repo-settings/pages/settings.json`               | Settings > Pages > Build and deployment |

`repo-settings/pages/settings.json` を置いていない repository では Pages の操作を行わない
（ Pages を使わない repository で誤って有効化しないため ）。
