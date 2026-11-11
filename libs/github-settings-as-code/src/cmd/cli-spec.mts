import dedent from 'dedent';

/**
 * What the `repo-settings` CLI takes, apart from the CLI itself so that a test
 * can read it without running it. `TARGETS` is described twice more by hand, in
 * `HELP` below and in the README's target table; `cli-spec.test.mts` holds both
 * to it.
 */
export const HELP = dedent`
  Usage: repo-settings <command> [target] [options]

  GitHub の repository 設定を JSON ファイルで管理する。

  Commands:
    apply [target]     ローカルの設定ファイルを GitHub に反映する
    backup [target]    GitHub の現在値でローカルの設定ファイルを撮り直す

  Targets:
    all                すべて（既定）
    repository         repo-settings/repository-settings/settings.json
    rulesets           repo-settings/rulesets/*.json
    variables          repo-settings/variables/settings.json
    actions            repo-settings/actions-settings/settings.json
    pages              repo-settings/pages/settings.json
    environments       repo-settings/environments/*.json
    vulnerability-alerts
                       repo-settings/vulnerability-alerts/settings.json

  Options:
        --owner <owner>   対象の owner
        --repo <repo>     対象の repository 名
    -h, --help            このヘルプを表示する

  owner / repo は「コマンドライン引数 → 環境変数 OWNER / REPO_NAME →
  git remote origin → package.json の name 」の順で解決される。
  通常は git remote から決まるため、どちらの指定も不要。

  認証は「環境変数 GITHUB_APP_TOKEN / GH_TOKEN / PERSONAL_ACCESS_TOKEN →
  gh CLI （ gh auth token ）」の順で解決される。ローカルでは gh auth login
  だけで動く。

  Examples:
    repo-settings apply
    repo-settings apply rulesets
    repo-settings backup
    repo-settings apply --owner noshiro-pf --repo ts-repo-utils
`;

export const COMMANDS = ['apply', 'backup'] as const;

export type Command = (typeof COMMANDS)[number];

export const TARGETS = [
  'all',
  'repository',
  'rulesets',
  'variables',
  'actions',
  'pages',
  'environments',
  'vulnerability-alerts',
] as const;

export type Target = (typeof TARGETS)[number];
