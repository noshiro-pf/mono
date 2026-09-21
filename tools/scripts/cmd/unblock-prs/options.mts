/** What the command line says, and how it is read. */

import * as util from 'node:util';
import { Num, Result } from 'ts-data-forge';
import { MERGE_QUEUED_LABEL, SKIP_CI_LABEL } from './labels.mjs';

export type Options = Readonly<{
  /** Run one cycle — survey, act on one pull request, report — and exit. */
  once: boolean;
  /** Survey and say what would be done, without rebasing or pushing. */
  dryRun: boolean;
  /** How long to wait between surveys when nothing is out of date. */
  idleIntervalSec: number;
  /** How often to poll the pull request being watched. */
  pollIntervalSec: number;
  /** How long to watch one pull request before giving up on it. */
  watchTimeoutMin: number;
  /**
   * Whether a run that acted on something writes what it did to the
   * `data/unblock-prs-log` branch. On by default: the whole point of a log
   * is that
   * it is there without anyone having asked for it that time.
   */
  writeLog: boolean;
}>;

export const defaultOptions: Options = {
  once: false,
  dryRun: false,
  idleIntervalSec: 300,
  pollIntervalSec: 60,
  watchTimeoutMin: 90,
  writeLog: true,
} as const;

export const HELP = [
  'Usage: pnpm run unblock-prs [-- options]',
  '',
  `Takes the ${MERGE_QUEUED_LABEL} pull requests in the order they declare with`,
  '`Merge-After:`, one at a time: rebases the one that is out of date with the',
  `default branch, takes ${SKIP_CI_LABEL} off it, and waits for GitHub to merge it.`,
  '',
  'Options:',
  '  --once                 run one cycle and exit',
  '  --dry-run              survey and report what would be done, then exit',
  `  --idle-interval <sec>  wait between surveys when nothing is behind (default ${defaultOptions.idleIntervalSec})`,
  `  --poll-interval <sec>  wait between polls of the watched pull request (default ${defaultOptions.pollIntervalSec})`,
  `  --watch-timeout <min>  give up on a pull request after this long (default ${defaultOptions.watchTimeoutMin})`,
  '  --no-log               do not write this run to the data/unblock-prs-log branch',
  '  -h, --help             show this help',
].join('\n');

export const parseOptions = (
  args: readonly string[],
): Result<Options | 'help', string> => {
  // `pnpm run unblock-prs -- --once` forwards the `--` as well, and
  // `parseArgs` would read everything after it as positionals.
  const [first, ...rest] = args;

  const argv: readonly string[] = first === '--' ? rest : args;

  const parsed = Result.fromThrowable(() =>
    util.parseArgs({
      args: Array.from(argv),
      options: {
        once: { type: 'boolean', default: false },
        'dry-run': { type: 'boolean', default: false },
        'idle-interval': { type: 'string' },
        'poll-interval': { type: 'string' },
        'watch-timeout': { type: 'string' },
        // Spelled as its own flag rather than as a negatable `--log`:
        // `parseArgs` does not read `--no-x` as the negation of `x`, and a
        // flag that looks like one and is not would be worse than neither.
        'no-log': { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
      },
    }),
  );

  if (Result.isErr(parsed)) return Result.err(parsed.value.message);

  const { values } = parsed.value;

  if (values.help) return Result.ok('help');

  const positive = (
    name: string,
    raw: string | undefined,
    fallback: number,
  ): Result<number, string> => {
    if (raw === undefined) return Result.ok(fallback);

    const n = Num.safeParseInt(raw);

    return Result.isOk(n) && n.value > 0
      ? Result.ok(n.value)
      : Result.err(
          `--${name} must be a positive integer, got ${JSON.stringify(raw)}`,
        );
  };

  const idleIntervalSec = positive(
    'idle-interval',
    values['idle-interval'],
    defaultOptions.idleIntervalSec,
  );

  if (Result.isErr(idleIntervalSec)) return idleIntervalSec;

  const pollIntervalSec = positive(
    'poll-interval',
    values['poll-interval'],
    defaultOptions.pollIntervalSec,
  );

  if (Result.isErr(pollIntervalSec)) return pollIntervalSec;

  const watchTimeoutMin = positive(
    'watch-timeout',
    values['watch-timeout'],
    defaultOptions.watchTimeoutMin,
  );

  if (Result.isErr(watchTimeoutMin)) return watchTimeoutMin;

  return Result.ok({
    once: values.once,
    dryRun: values['dry-run'],
    idleIntervalSec: idleIntervalSec.value,
    pollIntervalSec: pollIntervalSec.value,
    watchTimeoutMin: watchTimeoutMin.value,
    writeLog: !values['no-log'],
  });
};
