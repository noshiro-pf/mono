/** Reading a command's arguments, and the values more than one command takes. */

import * as util from 'node:util';
import { Num, Result, unknownToString } from 'ts-data-forge';

/**
 * `util.parseArgs` over `args`, answering `'help'` when `-h` / `--help` was
 * given and the values of `options` otherwise. `options` does not declare
 * `help`; this does. Nothing throws: an unknown flag or a missing value is the
 * error.
 */
export const parseCommandArgs = <const O extends util.ParseArgsOptionsConfig>(
  args: readonly string[],
  options: O,
): Result<
  | ReturnType<
      typeof util.parseArgs<Readonly<{ args: readonly string[]; options: O }>>
    >['values']
  | 'help',
  string
> => {
  // `pnpm run <command> -- --flag` forwards the `--` as well, and `parseArgs`
  // would read everything after it as positionals.
  const [first, ...rest] = args;

  const argv: readonly string[] = Array.from(first === '--' ? rest : args);

  // Asked first and on its own, leniently, so that `--help` answers even beside
  // a flag the command would refuse.
  const help = Result.fromThrowable(
    () =>
      util.parseArgs({
        args: argv,
        options: { help: { type: 'boolean', short: 'h' } },
        strict: false,
      }).values.help,
  );

  if (Result.isOk(help) && help.value === true) {
    return Result.ok('help');
  }

  const parsed = Result.fromThrowable(() =>
    util.parseArgs({ args: argv, options }),
  );

  return Result.isErr(parsed)
    ? Result.err(unknownToString(parsed.value))
    : Result.ok(parsed.value.values);
};

/**
 * `raw` as a positive whole number, or `fallback` when the flag was not given.
 * Rejected rather than clamped otherwise: `-3` or `two` is a typo, and a
 * command that quietly used the default instead would do something other than
 * what was asked for.
 */
export const positiveInteger = (
  flag: string,
  raw: string | undefined,
  fallback: number,
): Result<number, string> => {
  if (raw === undefined) {
    return Result.ok(fallback);
  }

  const parsed = /^[1-9]\d*$/u.test(raw)
    ? Result.unwrapOkOr(Num.safeParseInt(raw), undefined)
    : undefined;

  return parsed !== undefined && Number.isSafeInteger(parsed)
    ? Result.ok(parsed)
    : Result.err(
        `--${flag} must be a positive whole number, got ${JSON.stringify(raw)}`,
      );
};

/**
 * The pull request `raw` names, or `undefined` when it names none. `#1901` and
 * `1901` both name the same one, and a person copying from GitHub will paste
 * the first.
 */
export const pullRequestNumber = (raw: string): number | undefined =>
  /^#?[1-9]\d*$/u.test(raw)
    ? Result.unwrapOkOr(Num.safeParseInt(raw.replace(/^#/u, '')), undefined)
    : undefined;
