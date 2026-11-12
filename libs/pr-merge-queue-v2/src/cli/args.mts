/** Reading a command's arguments, the one way every command reads them. */

import * as util from 'node:util';
import { Arr, Num, Result, unknownToString } from 'ts-data-forge';

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
  const parsed = parseCommandLine(args, options);

  if (Result.isErr(parsed)) {
    return parsed;
  }

  if (parsed.value === 'help') {
    return Result.ok('help');
  }

  const { values, operands } = parsed.value;

  return Arr.isNonEmpty(operands)
    ? Result.err(`unexpected argument: ${operands.join(' ')}`)
    : Result.ok(values);
};

/**
 * {@link parseCommandArgs} for a command that takes operands too
 * (`start-issue <n>`): the values, and the operands in order.
 */
export const parseCommandLine = <const O extends util.ParseArgsOptionsConfig>(
  args: readonly string[],
  options: O,
): Result<
  | Readonly<{
      values: ReturnType<
        typeof util.parseArgs<Readonly<{ args: readonly string[]; options: O }>>
      >['values'];
      operands: readonly string[];
    }>
  | 'help',
  string
> => {
  // `pnpm run <command> -- --flag` forwards the `--`, after which `parseArgs`
  // reads everything as operands.
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
        allowPositionals: true,
      }).values.help,
  );

  if (Result.isOk(help) && help.value === true) {
    return Result.ok('help');
  }

  const parsed = Result.fromThrowable(() =>
    util.parseArgs({ args: argv, options, allowPositionals: true }),
  );

  return Result.isErr(parsed)
    ? Result.err(unknownToString(parsed.value))
    : Result.ok({
        values: parsed.value.values,
        operands: parsed.value.positionals,
      });
};

/** `raw` as an issue or pull request number: `123` or `#123`. */
export const numberOperand = (
  what: string,
  raw: string | undefined,
): Result<number, string> => {
  const parsed =
    raw === undefined ? undefined : wholePositive(raw.replace(/^#/u, ''));

  return parsed !== undefined
    ? Result.ok(parsed)
    : Result.err(
        raw === undefined
          ? `name the ${what} by its number`
          : `the ${what} is named by its number, got ${JSON.stringify(raw)}`,
      );
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

  const parsed = wholePositive(raw);

  return parsed !== undefined
    ? Result.ok(parsed)
    : Result.err(
        `--${flag} must be a positive whole number, got ${JSON.stringify(raw)}`,
      );
};

/**
 * `raw` as a positive whole number written plainly (`12`, not `012`, `+12` or
 * `1e3`), within the safe integers; `undefined` otherwise.
 */
const wholePositive = (raw: string): number | undefined => {
  const parsed = /^[1-9]\d*$/u.test(raw)
    ? Result.unwrapOkOr(Num.safeParseInt(raw), undefined)
    : undefined;

  return parsed !== undefined && Number.isSafeInteger(parsed)
    ? parsed
    : undefined;
};
