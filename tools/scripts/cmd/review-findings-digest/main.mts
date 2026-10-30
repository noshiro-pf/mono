import {
  parseCommandArgs,
  positiveInteger,
  resolveApiContext,
} from 'pr-merge-queue';
import { Arr, Result } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { buildDigest, renderMarkdown } from './digest.mjs';
import { listMergedPulls, type PullRange } from './github.mjs';

/**
 * The options of `review-findings-digest`, which prints a digest of the
 * `## Review` sections of merged pull requests: the rounds each one ran, and
 * its findings counted by class, for finding the classes that recur and
 * deserve a check (`docs/checks-over-fixes.md`). See `README.md`.
 *
 * Resolves to `'help'` for `--help`. `today` (`YYYY-MM-DD`, UTC) is what the
 * default `--since`, 30 days back, counts from.
 */
export const parseOptions = (
  args: readonly string[],
  today: string,
): Result<Options | 'help', string> => {
  const parsed = parseCommandArgs(args, {
    since: { type: 'string' },
    last: { type: 'string' },
    format: { type: 'string' },
    repo: { type: 'string' },
  });

  if (Result.isErr(parsed)) {
    return parsed;
  }

  if (parsed.value === 'help') {
    return Result.ok('help');
  }

  const { since, last, format = 'md', repo } = parsed.value;

  if (format !== 'md' && format !== 'json') {
    return Result.err(
      `--format must be md or json, got ${JSON.stringify(format)}`,
    );
  }

  if (since !== undefined && last !== undefined) {
    return Result.err('give --since or --last, not both');
  }

  if (last !== undefined) {
    return Result.map(positiveInteger('last', last, 1), (count) => ({
      range: { kind: 'last', count },
      format,
      repo,
    }));
  }

  const date = since ?? defaultSince(today);

  if (
    !/^\d{4}-\d{2}-\d{2}$/u.test(date) ||
    Result.isErr(
      Result.fromThrowable(() =>
        Temporal.PlainDate.from(date, { overflow: 'reject' }),
      ),
    )
  ) {
    return Result.err(
      `--since must be YYYY-MM-DD, got ${JSON.stringify(date)}`,
    );
  }

  return Result.ok({ range: { kind: 'since', date }, format, repo });
};

/** The range in words, as the digest's first line says it. */
export const describeRange = (range: PullRange): string =>
  range.kind === 'since'
    ? (`Merged since ${range.date}` as const)
    : (`The last ${range.count} merged` as const);

export type Options = Readonly<{
  range: PullRange;
  format: 'json' | 'md';
  repo: string | undefined;
}>;

const USAGE = [
  'Usage: pnpm run review-findings-digest -- [--since YYYY-MM-DD | --last N] [--format md|json] [--repo owner/name]',
  '',
  '  --since   merged on or after this date (UTC); default: 30 days ago',
  '  --last    the N most recently merged instead',
  '  --format  md (default) or json',
  '  --repo    default: origin, else the root package.json',
  '',
  'Reads GH_TOKEN or GITHUB_TOKEN (or `gh auth token`).',
].join('\n');

const DEFAULT_DAYS = 30;

const defaultSince = (today: string): string =>
  Temporal.PlainDate.from(today).subtract({ days: DEFAULT_DAYS }).toString();

if (isDirectlyExecuted(import.meta.url)) {
  const options = parseOptions(
    Arr.skip(process.argv, 2),
    Temporal.Now.plainDateISO('UTC').toString(),
  );

  if (Result.isErr(options)) {
    console.error(`${options.value}\n\n${USAGE}`);

    process.exit(1);
  }

  if (options.value === 'help') {
    console.log(USAGE);

    process.exit(0);
  }

  const { range, format, repo } = options.value;

  const context = await resolveApiContext(repo);

  if (Result.isErr(context)) {
    console.error(context.value);

    process.exit(1);
  }

  const pulls = await listMergedPulls(context.value, range, (message) => {
    console.error(message);
  });

  if (Result.isErr(pulls)) {
    console.error(pulls.value);

    process.exit(1);
  }

  const digest = buildDigest({
    range: describeRange(range),
    pulls: pulls.value,
  });

  process.stdout.write(
    format === 'json'
      ? `${JSON.stringify(digest, undefined, 2)}\n`
      : renderMarkdown(digest),
  );
}
