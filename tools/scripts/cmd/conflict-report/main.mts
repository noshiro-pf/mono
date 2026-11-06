import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  parseCommandArgs,
  positiveInteger,
  resolveApiContext,
  viewerLogin,
} from 'pr-merge-queue';
import { Arr, isRecord, Result } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../../project-root-path.mjs';
import { headsOf, listMerged, setAsidesOn } from './github.mjs';
import { ensureCommits, replayPull } from './replay.mjs';
import { renderMarkdown, summarize, type ConflictEvent } from './report.mjs';

/**
 * The options of `conflict-report`, which replays the rebases of the pull
 * requests merged in the last `--days` and counts the conflicts and the
 * set-asides (`README.md`). Resolves to `'help'` for `--help`.
 */
export const parseOptions = (
  args: readonly string[],
): Result<Options | 'help', string> => {
  const parsed = parseCommandArgs(args, {
    days: { type: 'string' },
    format: { type: 'string' },
    base: { type: 'string' },
  });

  if (Result.isErr(parsed)) {
    return parsed;
  }

  if (parsed.value === 'help') {
    return Result.ok('help');
  }

  const {
    days = DEFAULT_DAYS.toString(),
    format = 'md',
    base = 'main',
  } = parsed.value;

  if (format !== 'md' && format !== 'json') {
    return Result.err(
      `--format must be md or json, got ${JSON.stringify(format)}`,
    );
  }

  return Result.map(positiveInteger('days', days, 1), (count) => ({
    days: count,
    format,
    base,
  }));
};

/**
 * The `regenerate` patterns of `.github/unblock-prs.json`: what the report
 * counts as generated. None when the file or the key is not there.
 */
export const generatedPatterns = (config: unknown): readonly RegExp[] => {
  const generators =
    isRecord(config) && isRecord(config['regenerate'])
      ? config['regenerate']['generators']
      : undefined;

  return Arr.isArray(generators)
    ? Arr.generate<RegExp>(function* () {
        for (const generator of generators) {
          if (isRecord(generator) && typeof generator['path'] === 'string') {
            // eslint-disable-next-line security/detect-non-literal-regexp -- the repository's own configuration
            yield new RegExp(generator['path'], 'u');
          }
        }
      })
    : [];
};

export type Options = Readonly<{
  days: number;
  format: 'json' | 'md';
  base: string;
}>;

const DEFAULT_DAYS = 7;

/** How many pull requests are read and replayed at once. */
const CONCURRENCY = 8;

const USAGE = [
  'Usage: pnpm run conflict-report -- [--days N] [--format md|json] [--base main]',
  '',
  '  --days    merged in the last N days (default: 7)',
  '  --format  md (default) or json',
  '  --base    the branch they merged into (default: main)',
  '',
  'Reads GH_TOKEN or GITHUB_TOKEN, and fetches the heads it replays from origin.',
].join('\n');

const readGenerated = async (): Promise<readonly RegExp[]> => {
  const read = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a fixed path under the repository root
    fs.readFile(
      path.join(projectRootPath, '.github', 'unblock-prs.json'),
      'utf8',
    ),
  );

  if (Result.isErr(read)) {
    return [];
  }

  const parsed = Result.fromThrowable((): unknown => JSON.parse(read.value));

  return Result.isOk(parsed) ? generatedPatterns(parsed.value) : [];
};

if (isDirectlyExecuted(import.meta.url)) {
  const options = parseOptions(Arr.skip(process.argv, 2));

  if (Result.isErr(options)) {
    console.error(`${options.value}\n\n${USAGE}`);

    process.exit(1);
  }

  if (options.value === 'help') {
    console.log(USAGE);

    process.exit(0);
  }

  const { days, format, base } = options.value;

  const context = await resolveApiContext();

  const viewer = Result.isOk(context)
    ? await viewerLogin(context.value.token)
    : context;

  if (Result.isErr(context) || Result.isErr(viewer)) {
    console.error(Result.isErr(context) ? context.value : viewer.value);

    process.exit(1);
  }

  const since = Temporal.Now.instant()
    .subtract({ hours: days * 24 })
    .toString({ smallestUnit: 'second' });

  const merged = await listMerged(context.value, base, since);

  if (Result.isErr(merged)) {
    console.error(merged.value);

    process.exit(1);
  }

  console.error(
    `Replaying ${merged.value.length} pull requests merged since ${since}.`,
  );

  const mut_read: Readonly<{
    pull: (typeof merged.value)[number];
    heads: readonly string[];
  }>[] = [];

  const mut_setAsides: Parameters<typeof summarize>[0]['setAsides'][number][] =
    [];

  for (const chunk of Arr.chunk(merged.value, CONCURRENCY)) {
    const read = await Promise.all(
      chunk.map(async (pull) => ({
        pull,
        heads: await headsOf(context.value, pull),
        setAsides: await setAsidesOn(context.value, pull.number, viewer.value),
      })),
    );

    for (const { pull, heads, setAsides } of read) {
      if (Result.isErr(heads) || Result.isErr(setAsides)) {
        console.error(
          `#${pull.number}: ${Result.isErr(heads) ? heads.value : Result.isErr(setAsides) ? setAsides.value : ''}`,
        );

        continue;
      }

      mut_setAsides.push(
        ...setAsides.value.map((seen) => ({ pr: pull.number, ...seen })),
      );

      mut_read.push({ pull, heads: heads.value });
    }
  }

  // One fetch for every head the clone lacks, rather than one per pull request.
  const unreachable = await ensureCommits(
    mut_read.flatMap(({ pull, heads }) => Arr.toPushed(heads, pull.mergeSha)),
  );

  if (Arr.isNonEmpty(unreachable)) {
    console.error(
      `Not served any more, so not replayed: ${unreachable.map((sha) => sha.slice(0, 10)).join(', ')}.`,
    );
  }

  const mut_events: ConflictEvent[] = [];

  for (const { pull, heads } of mut_read) {
    mut_events.push(...(await replayPull(pull.number, heads, pull.mergeSha)));
  }

  const report = summarize({
    days,
    merged: merged.value.map(({ number }) => number),
    events: mut_events,
    setAsides: mut_setAsides,
    generated: await readGenerated(),
  });

  process.stdout.write(
    format === 'json'
      ? `${JSON.stringify({ report, events: mut_events }, undefined, 2)}\n`
      : renderMarkdown(report),
  );
}
