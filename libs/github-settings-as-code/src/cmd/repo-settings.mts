#!/usr/bin/env node

import 'dotenv/config';
import * as util from 'node:util';
import { Arr } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';

const HELP = `
Usage: repo-settings <command> [target] [options]

GitHub の repository 設定を JSON ファイルで管理する。

Commands:
  apply [target]     ローカルの設定ファイルを GitHub に反映する
  backup [target]    GitHub の現在値をローカルの bk/ に保存する

Targets:
  all                すべて（既定）
  repository         repo-settings/repository-settings/settings.json
  rulesets           repo-settings/rulesets/*.json
  variables          repository variables （ apply のみ ）
  actions            repo-settings/actions-settings/settings.json
  pages              repo-settings/pages/settings.json

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
`.trim();

const COMMANDS = ['apply', 'backup'] as const;

type Command = (typeof COMMANDS)[number];

const TARGETS = [
  'all',
  'repository',
  'rulesets',
  'variables',
  'actions',
  'pages',
] as const;

type Target = (typeof TARGETS)[number];

const COMMAND_SET: ReadonlySet<string> = new Set(COMMANDS);

const isCommand = (value: string): value is Command => COMMAND_SET.has(value);

const TARGET_SET: ReadonlySet<string> = new Set(TARGETS);

const isTarget = (value: string): value is Target => TARGET_SET.has(value);

// NOTE: 明示的な型注釈を変数側に付けることで、呼び出し後に制御フローが到達
// しないことを TypeScript に認識させる（ narrowing のために必要 ）。
const fail: (message: string) => never = (message) => {
  console.error(`❌ ${message}`);

  console.error('');

  console.error(HELP);

  process.exit(1);
};

const { values, positionals } = util.parseArgs({
  args: Arr.skip(process.argv, 2),
  options: {
    owner: { type: 'string' },
    repo: { type: 'string' },
    help: { type: 'boolean', short: 'h', default: false },
  },
  strict: false,
  allowPositionals: true,
});

if (values.help === true || Arr.isEmpty(positionals)) {
  console.info(HELP);

  // Asking for help is not an error, even though being given no command is.
  process.exit(values.help === true ? 0 : 1);
}

const [commandArg, targetArg = 'all'] = positionals;

if (commandArg === undefined || !isCommand(commandArg)) {
  fail(`Unknown command: "${commandArg ?? ''}"`);
}

if (!isTarget(targetArg)) {
  fail(`Unknown target: "${targetArg}"`);
}

// NOTE: ここで初めて設定モジュールを読み込む。 owner / repo の解決は import 時に
// 走るため、 --help や引数エラーの時点では評価させたくない。
const github = await import('../github/index.mjs');

const runners: ReadonlyRecord<
  Command,
  Partial<ReadonlyRecord<Target, () => Promise<void>>>
> = {
  apply: {
    all: async () => {
      await github.applyVariables();

      await github.applyRulesets();

      await github.applyRepositorySettings();

      await github.applyActionsSettings();

      await github.applyPagesSettings();
    },
    repository: github.applyRepositorySettings,
    rulesets: github.applyRulesets,
    variables: github.applyVariables,
    actions: github.applyActionsSettings,
    pages: github.applyPagesSettings,
  },
  backup: {
    all: async () => {
      await github.backupRulesets();

      await github.backupRepositorySettings();

      await github.backupActionsSettings();

      await github.backupPagesSettings();
    },
    repository: github.backupRepositorySettings,
    rulesets: github.backupRulesets,
    actions: github.backupActionsSettings,
    pages: github.backupPagesSettings,
  },
} as const;

const runner = runners[commandArg][targetArg];

if (runner === undefined) {
  fail(`"${commandArg}" does not support the target "${targetArg}"`);
}

await runner();
