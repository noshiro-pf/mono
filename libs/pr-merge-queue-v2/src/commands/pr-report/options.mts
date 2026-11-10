/** What `pr-report`'s command line says (`spec/commands.md`, `pr-report`). */

import { Result } from 'ts-data-forge';
import { parseCommandArgs, positiveInteger } from '../../cli/index.mjs';

export const parseOptions = (
  args: readonly string[],
): Result<Options | 'help', string> => {
  const parsed = parseCommandArgs(args, {
    format: { type: 'string' },
    repo: { type: 'string' },
    'merged-days': { type: 'string' },
    'merged-limit': { type: 'string' },
    'issues-limit': { type: 'string' },
  });

  if (Result.isErr(parsed)) {
    return parsed;
  }

  if (parsed.value === 'help') {
    return Result.ok('help');
  }

  const values = parsed.value;

  const format = values.format ?? 'terminal';

  if (!isFormat(format)) {
    return Result.err(
      `--format must be one of ${FORMATS.join(', ')}, got ${JSON.stringify(format)}`,
    );
  }

  const mergedDays = positiveInteger(
    'merged-days',
    values['merged-days'],
    DEFAULT_MERGED_DAYS,
  );

  if (Result.isErr(mergedDays)) {
    return mergedDays;
  }

  const mergedLimit = positiveInteger(
    'merged-limit',
    values['merged-limit'],
    DEFAULT_MERGED_LIMIT,
  );

  if (Result.isErr(mergedLimit)) {
    return mergedLimit;
  }

  const issuesLimit = positiveInteger(
    'issues-limit',
    values['issues-limit'],
    DEFAULT_ISSUES_LIMIT,
  );

  if (Result.isErr(issuesLimit)) {
    return issuesLimit;
  }

  return Result.ok({
    format,
    repo: values.repo,
    mergedDays: mergedDays.value,
    mergedLimit: mergedLimit.value,
    issuesLimit: issuesLimit.value,
  });
};

/** A set of plain strings, so that the test takes the string it narrows. */
export const FORMATS = ['json', 'markdown', 'terminal'] as const;

export type Format = (typeof FORMATS)[number];

export type Options = Readonly<{
  format: Format;
  /** `owner/name`; the checkout's repository when not given. */
  repo: string | undefined;
  /** How far back "recently merged" goes, and how many it lists. */
  mergedDays: number;
  mergedLimit: number;
  /** How many open issues it lists, most recently updated first. */
  issuesLimit: number;
}>;

/** A week, so that a report read on a Monday still covers the Friday. */
export const DEFAULT_MERGED_DAYS = 7;

/** Enough to answer "did the thing I queued go in"; past it, an archive. */
export const DEFAULT_MERGED_LIMIT = 20;

/** Enough to see what is open without the section becoming the report. */
export const DEFAULT_ISSUES_LIMIT = 30;

export const HELP = [
  'Usage: pr-report [options]',
  '',
  'Reports every open pull request: the order they declare with',
  '`Merge-After:`, the issues they close, their labels, the verdict of the',
  'checks the ruleset requires, and how far each branch is from its base.',
  '',
  'Options:',
  `  --format <${FORMATS.join('|')}>  how to print it (default terminal)`,
  '                                   `json` is the whole report, bodies and all',
  '  --repo <owner/name>              which repository (default: this one)',
  `  --merged-days <n>                how far back "recently merged" goes (default ${DEFAULT_MERGED_DAYS})`,
  `  --merged-limit <n>               how many it lists at most (default ${DEFAULT_MERGED_LIMIT})`,
  `  --issues-limit <n>               how many open issues it lists (default ${DEFAULT_ISSUES_LIMIT})`,
  '  -h, --help                       show this help',
  '',
  'Reads GH_TOKEN, then GITHUB_TOKEN, then `gh auth token`. Without any the',
  'public API allows 60 requests an hour, which is about five pull requests,',
  'and the issue links are the ones the bodies declare rather than GitHub’s',
  'own list.',
].join('\n');

const FORMAT_SET: ReadonlySet<string> = new Set(FORMATS);

const isFormat = (value: string): value is Format => FORMAT_SET.has(value);
