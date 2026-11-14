#!/usr/bin/env node

import 'dotenv/config';
import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { HELP, parseCliArgs, type Command, type Target } from './cli-spec.mjs';

// NOTE: 明示的な型注釈を変数側に付けることで、呼び出し後に制御フローが到達
// しないことを TypeScript に認識させる（ narrowing のために必要 ）。
const fail: (message: string) => never = (message) => {
  console.error(`❌ ${message}`);

  console.error('');

  console.error(HELP);

  process.exit(1);
};

// NOTE: 未知のオプションや余分な引数は何も送る前に拒否する（ cli-spec.mts ）。
const parsed = parseCliArgs(Arr.skip(process.argv, 2));

if (parsed.type === 'help') {
  console.info(HELP);

  // Asking for help is not an error, even though being given no command is.
  process.exit(parsed.requested ? 0 : 1);
}

if (parsed.type === 'error') {
  fail(parsed.message);
}

const { command: commandArg, target: targetArg } = parsed;

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

      await github.applyEnvironments();

      await github.applyVulnerabilityAlerts();
    },
    repository: github.applyRepositorySettings,
    rulesets: github.applyRulesets,
    variables: github.applyVariables,
    actions: github.applyActionsSettings,
    pages: github.applyPagesSettings,
    environments: github.applyEnvironments,
    'vulnerability-alerts': github.applyVulnerabilityAlerts,
  },
  backup: {
    all: async () => {
      await github.backupRulesets();

      await github.backupRepositorySettings();

      await github.backupActionsSettings();

      await github.backupPagesSettings();

      await github.backupEnvironments();

      await github.backupVulnerabilityAlerts();

      await github.backupVariables();
    },
    repository: github.backupRepositorySettings,
    rulesets: github.backupRulesets,
    variables: github.backupVariables,
    actions: github.backupActionsSettings,
    pages: github.backupPagesSettings,
    environments: github.backupEnvironments,
    'vulnerability-alerts': github.backupVulnerabilityAlerts,
  },
} as const;

const runner = runners[commandArg][targetArg];

if (runner === undefined) {
  fail(`"${commandArg}" does not support the target "${targetArg}"`);
}

await runner();
