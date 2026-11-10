/** Reading a command's arguments, the one way every command reads them. */

import * as util from 'node:util';
import { Num, Result, unknownToString } from 'ts-data-forge';

/**
 * `util.parseArgs` over `args`: `'help'` when `-h` or `--help` is among them,
 * else the values of `options`. Nothing throws: an unknown flag or a missing
 * value is the error.
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
  // `pnpm run <command> -- --flag` forwards the `--`, after which `parseArgs`
  // reads everything as positionals.
  const [first, ...rest] = args;

  const argv: readonly string[] = Array.from(first === '--' ? rest : args);

  // Asked leniently and first, so that `--help` answers beside a flag the
  // command would refuse.
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
 * `raw` as a positive whole number, or `fallback` when the flag is absent.
 * Refused rather than clamped otherwise: `-3` or `two` is a typo.
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
