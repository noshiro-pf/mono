/** What the command line says, and how it is read. */

import * as util from 'node:util';
import { Num, Result } from 'ts-data-forge';

export const FORMATS = ['json', 'markdown', 'payload', 'terminal'] as const;

export type Format = (typeof FORMATS)[number];

export type Options = Readonly<{
  format: Format;
  /** `owner/name`; the repository this checkout is of when not given. */
  repo: string | undefined;
  /** How far back the "recently merged" section goes. */
  mergedDays: number;
  /** And how many of them it lists, whatever the window turns up. */
  mergedLimit: number;
  /**
   * Where to also write the machine-readable payload, if anywhere.
   *
   * A second output rather than a second run, because a run is twenty or so
   * requests against the API and about a minute of wall clock, and
   * `pr-report.yml` needs both the Markdown and the payload from the same
   * moment: two runs would have the issue and the page describing states
   * that differ by whatever happened in between.
   */
  payloadFile: string | undefined;
}>;

/**
 * A week, so that a report read on a Monday still covers the Friday. Long
 * enough to answer "what landed since I last looked" and short enough that
 * the section stays a list rather than an archive.
 */
export const DEFAULT_MERGED_DAYS = 7;

/**
 * A cap as well as a window, and now a matter of reading rather than of
 * fitting: the report is written to a file, which refuses nothing. Twenty is
 * more than enough to answer "did the thing I queued go in", which is what
 * the section is for, and past that the section stops being a list and
 * starts being an archive.
 */
export const DEFAULT_MERGED_LIMIT = 20;

export const HELP = [
  'Usage: pnpm run pr-report [-- options]',
  '',
  'Reports every open pull request: the order they declare with',
  '`Merge-After:`, the issues they close, their labels, the verdict of the',
  'checks the ruleset requires, and how far each branch is from its base.',
  '',
  'Options:',
  `  --format <${FORMATS.join('|')}>  how to print it (default terminal)`,
  '                                   `payload` is the one the page reads;',
  '                                   `json` is the whole report, bodies and all',
  '  --repo <owner/name>              which repository (default: this one)',
  `  --merged-days <n>                how far back "recently merged" goes (default ${DEFAULT_MERGED_DAYS})`,
  `  --merged-limit <n>               how many it lists at most (default ${DEFAULT_MERGED_LIMIT})`,
  '  --payload-file <path>            also write the payload there, from the',
  '                                   same run that printed the report',
  '  -h, --help                       show this help',
  '',
  'Reads GITHUB_TOKEN or GH_TOKEN when one is set. Without it the public API',
  'allows 60 requests an hour, which is about twenty pull requests, and the',
  'issue links are the ones the bodies declare rather than GitHub’s own list.',
].join('\n');

export const parseOptions = (
  args: readonly string[],
): Result<Options | 'help', string> => {
  // `pnpm run pr-report -- --format json` forwards the `--` as well, and
  // `parseArgs` would read everything after it as positionals.
  const [first, ...rest] = args;

  const argv: readonly string[] = first === '--' ? rest : args;

  const parsed = Result.fromThrowable(() =>
    util.parseArgs({
      args: Array.from(argv),
      options: {
        format: { type: 'string' },
        repo: { type: 'string' },
        'merged-days': { type: 'string' },
        'merged-limit': { type: 'string' },
        'payload-file': { type: 'string' },
        help: { type: 'boolean', short: 'h', default: false },
      },
    }),
  );

  if (Result.isErr(parsed)) return Result.err(parsed.value.message);

  const { values } = parsed.value;

  if (values.help) return Result.ok('help');

  const format = values.format ?? 'terminal';

  if (!isFormat(format)) {
    return Result.err(
      `--format must be one of ${FORMATS.join(', ')}, got ${JSON.stringify(format)}`,
    );
  }

  const mergedDays = positive(
    'merged-days',
    values['merged-days'],
    DEFAULT_MERGED_DAYS,
  );

  if (Result.isErr(mergedDays)) return mergedDays;

  const mergedLimit = positive(
    'merged-limit',
    values['merged-limit'],
    DEFAULT_MERGED_LIMIT,
  );

  if (Result.isErr(mergedLimit)) return mergedLimit;

  return Result.ok({
    format,
    repo: values.repo,
    mergedDays: mergedDays.value,
    mergedLimit: mergedLimit.value,
    payloadFile: values['payload-file'],
  });
};

/**
 * Rejected rather than clamped when it is not a positive whole number: `-3`
 * or `two` is a typo, and a report that quietly used the default instead
 * would be a report saying something other than what was asked for.
 */
const positive = (
  name: string,
  raw: string | undefined,
  fallback: number,
): Result<number, string> => {
  if (raw === undefined) return Result.ok(fallback);

  const parsed = Result.unwrapOkOr(Num.safeParseFloat(raw), Number.NaN);

  return Number.isSafeInteger(parsed) && parsed > 0
    ? Result.ok(parsed)
    : Result.err(
        `--${name} must be a positive whole number, got ${JSON.stringify(raw)}`,
      );
};

/**
 * Typed as a set of plain strings so that the membership test takes the
 * string it is narrowing. `FORMATS.includes(value)` does not compile against
 * the strict standard library, whose `includes` accepts only the element
 * type — which is the very thing being established here.
 */
const FORMAT_SET: ReadonlySet<string> = new Set(FORMATS);

const isFormat = (value: string): value is Format => FORMAT_SET.has(value);
