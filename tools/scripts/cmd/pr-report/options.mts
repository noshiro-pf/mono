/** What the command line says, and how it is read. */

import * as util from 'node:util';
import { Result } from 'ts-data-forge';

export const FORMATS = ['json', 'markdown', 'terminal'] as const;

export type Format = (typeof FORMATS)[number];

export type Options = Readonly<{
  format: Format;
  /** `owner/name`; the repository this checkout is of when not given. */
  repo: string | undefined;
}>;

export const HELP = [
  'Usage: pnpm run pr-report [-- options]',
  '',
  'Reports every open pull request: the order they declare with',
  '`Merge-After:`, the issues they close, their labels, the verdict of the',
  'checks the ruleset requires, and how far each branch is from its base.',
  '',
  'Options:',
  `  --format <${FORMATS.join('|')}>  how to print it (default terminal)`,
  '  --repo <owner/name>              which repository (default: this one)',
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

  return Result.ok({ format, repo: values.repo });
};

/**
 * Typed as a set of plain strings so that the membership test takes the
 * string it is narrowing. `FORMATS.includes(value)` does not compile against
 * the strict standard library, whose `includes` accepts only the element
 * type — which is the very thing being established here.
 */
const FORMAT_SET: ReadonlySet<string> = new Set(FORMATS);

const isFormat = (value: string): value is Format => FORMAT_SET.has(value);
