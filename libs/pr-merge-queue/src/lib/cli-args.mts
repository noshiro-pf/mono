/** Reading a command's arguments, and the values more than one command takes. */

import * as util from 'node:util';
import { Num, Result, unknownToString } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * `util.parseArgs` over `args`, answering `'help'` when `-h` / `--help` was
 * given and the values of `options` otherwise. `options` does not declare
 * `help`; this does. Nothing throws: an unknown flag or a missing value is the
 * error.
 */
export const parseCommandArgs = <const O extends CommandOptions>(
  args: readonly string[],
  options: O,
): Result<CommandValues<O> | 'help', string> => {
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

  const config: util.ParseArgsConfig = { args: argv, options } as const;

  const parsed = Result.fromThrowable(
    (): CommandValues<O> =>
      // `CommandValues` restates, read-only, the type Node gives these values
      // for `options`, which TypeScript cannot see through a type parameter.
      // The test checks that Node's type is assignable to it.
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      util.parseArgs(config).values as CommandValues<O>,
  );

  return Result.mapErr(parsed, unknownToString);
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

/**
 * A flag {@link parseCommandArgs} reads, as `util.parseArgs` takes it. Written
 * here rather than taken from `node:util`, so that the published declarations
 * need no `@types/node`. A flag's `default` has the flag's type, and a flag
 * that is `multiple` takes none, since `util.parseArgs` wants one as a mutable
 * array.
 */
export type CommandOption = Readonly<
  | { type: 'string'; short?: string; multiple?: false; default?: string }
  | { type: 'boolean'; short?: string; multiple?: false; default?: boolean }
  | {
      type: 'string' | 'boolean';
      short?: string;
      multiple: true;
      default?: never;
    }
>;

/** The flags a command reads, by their long names. */
export type CommandOptions = ReadonlyRecord<string, CommandOption>;

/**
 * What {@link parseCommandArgs} reads for `O`: as `util.parseArgs` types its
 * `values`, read-only. A flag with a `default` is always there; the others may
 * be missing.
 */
export type CommandValues<O extends CommandOptions> = Flatten<
  Readonly<{ [K in keyof O]?: FlagValue<O[K]> }> &
    Readonly<{
      [
        K in keyof O as O[K] extends Readonly<{ default: string | boolean }>
          ? K
          : never
      ]: FlagValue<O[K]>;
    }>
>;

/**
 * The value one flag declared as `D` reads. Distributes over `D`, so that a
 * flag typed as any `CommandOption` may be either.
 *
 * @internal Reached through {@link CommandValues}, by indexing it with a flag's
 * name; a consumer has no need to spell it.
 */
type FlagValue<D extends CommandOption> =
  D extends Readonly<{ multiple: true }>
    ? readonly TypeValue<D['type']>[]
    : TypeValue<D['type']>;

type TypeValue<T extends CommandOption['type']> = [T] extends ['string']
  ? string
  : [T] extends ['boolean']
    ? boolean
    : string | boolean;

/**
 * `T` with an intersection of object types merged into one, so that an editor
 * shows {@link CommandValues} as one object.
 *
 * @internal Only shapes how {@link CommandValues} is shown; a consumer has no
 * need to spell it.
 */
type Flatten<T> = Readonly<{ [K in keyof T]: T[K] }>;
