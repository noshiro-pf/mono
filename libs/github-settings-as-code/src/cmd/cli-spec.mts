import dedent from 'dedent';
import * as util from 'node:util';
// NOTE: Result は ts-repo-utils ではなく ts-data-forge から読む。 ts-repo-utils
// は import 時に TypeScript を読み込み、引数の検証と --help を重くするため。
import {
  Arr,
  Result,
  hasKey,
  isRecord,
  isString,
  unknownToString,
} from 'ts-data-forge';
import { TARGET_REPO_OPTIONS } from '../target-repo-options.mjs';

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

  上記以外のオプション、値のない（空の値を含む） --owner / --repo 、
  3 つ目以降の引数は何も送らずにエラーにする。

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

/**
 * What the `repo-settings` CLI goes on with, decided from its command line
 * before anything is sent to GitHub.
 *
 * - `help`: print the help; `requested` is `false` when no command was given,
 *   which exits 1.
 * - `run`: the command and target to run.
 * - `error`: a command line the CLI refuses — an option it does not have, an
 *   `--owner` / `--repo` without a value or with an empty one, an unknown
 *   command or target, a third positional argument. Ignoring any of these
 *   would apply to something other than what was typed (`apply --dry-run`
 *   applying for real).
 */
export const parseCliArgs = (args: readonly string[]): ParsedCliArgs => {
  const parsed = parseStrictly(args);

  if (Result.isErr(parsed)) {
    return { type: 'error', message: parsed.value };
  }

  const { values, positionals } = parsed.value;

  // `--repo ""` (an unset variable) would otherwise read as no `--repo` at all,
  // and the repository would come from git remote origin.
  const emptyOption = Object.entries(values).find(
    ([name, value]) => hasKey(TARGET_REPO_OPTIONS, name) && value === '',
  );

  if (emptyOption !== undefined) {
    return {
      type: 'error',
      message: `Empty option value: ${JSON.stringify(`--${emptyOption[0]}`)}`,
    };
  }

  // NOTE: --help は位置引数の誤りより優先するが、オプションの誤りより後になる
  // （ strict な parseArgs はそこで止まり、 values を返さない）。その場合も
  // fail がヘルプを表示するため、利用者に見えないのは終了コードの違いだけ。
  if (values.help) {
    return { type: 'help', requested: true };
  }

  if (!Arr.isNonEmpty(positionals)) {
    return { type: 'help', requested: false };
  }

  const [commandArg, targetArg = 'all', ...rest] = positionals;

  if (!isCommand(commandArg)) {
    return {
      type: 'error',
      message: `Unknown command: ${JSON.stringify(commandArg)}`,
    };
  }

  if (!isTarget(targetArg)) {
    return {
      type: 'error',
      message: `Unknown target: ${JSON.stringify(targetArg)}`,
    };
  }

  return Arr.isNonEmpty(rest)
    ? {
        type: 'error',
        message: `Unexpected argument(s): ${rest.map((arg) => JSON.stringify(arg)).join(', ')}`,
      }
    : { type: 'run', command: commandArg, target: targetArg };
};

export type ParsedCliArgs = Readonly<
  | { type: 'help'; requested: boolean }
  | { type: 'run'; command: Command; target: Target }
  | { type: 'error'; message: string }
>;

const PARSE_ARGS_CONFIG = {
  options: {
    ...TARGET_REPO_OPTIONS,
    help: { type: 'boolean', short: 'h', default: false },
  },
  strict: true,
  allowPositionals: true,
} as const satisfies util.ParseArgsConfig;

const COMMAND_SET: ReadonlySet<string> = new Set(COMMANDS);

const TARGET_SET: ReadonlySet<string> = new Set(TARGETS);

const isCommand = (value: string): value is Command => COMMAND_SET.has(value);

const isTarget = (value: string): value is Target => TARGET_SET.has(value);

/** The first option on the command line that `PARSE_ARGS_CONFIG` does not declare. */
const findUnknownOption = (args: readonly string[]): string | undefined =>
  Arr.generate(function* () {
    for (const token of util.parseArgs({
      ...PARSE_ARGS_CONFIG,
      args: Array.from(args),
      strict: false,
      tokens: true,
    }).tokens) {
      if (
        token.kind === 'option' &&
        !hasKey(PARSE_ARGS_CONFIG.options, token.name)
      ) {
        yield token.rawName;
      }
    }
  }).at(0);

const parseStrictly = (
  args: readonly string[],
): Result<
  ReturnType<typeof util.parseArgs<typeof PARSE_ARGS_CONFIG>>,
  string
> => {
  const result = Result.fromThrowable(() =>
    util.parseArgs({ ...PARSE_ARGS_CONFIG, args: Array.from(args) }),
  );

  if (Result.isOk(result)) {
    return result;
  }

  const error: unknown = result.value;

  const code =
    isRecord(error) && hasKey(error, 'code') && isString(error.code)
      ? error.code
      : '';

  // Anything but a refused command line is a bug in the declaration above, and
  // is thrown rather than reported as a mistyped command.
  if (!code.startsWith('ERR_PARSE_ARGS_')) {
    throw new Error('util.parseArgs failed', { cause: error });
  }

  // Node's message for an unknown option goes on to suggest passing it after
  // `--`, which this CLI would refuse as a target or an extra argument, so the
  // message is written here from the option token instead.
  if (code === 'ERR_PARSE_ARGS_UNKNOWN_OPTION') {
    const unknownOption = findUnknownOption(args);

    if (unknownOption !== undefined) {
      return Result.err(`Unknown option: ${JSON.stringify(unknownOption)}`);
    }
  }

  return Result.err(unknownToString(error));
};
