/** What the command line says, and how it is read. */

import * as util from 'node:util';
import { MERGE_QUEUED_LABEL, SKIP_CI_LABEL } from 'pr-report-core';
import { Num, Result } from 'ts-data-forge';

export type Options = Readonly<{
  /** Run one cycle — survey, act on one pull request, report — and exit. */
  once: boolean;
  /** Survey and say what would be done, without rebasing or pushing. */
  dryRun: boolean;
  /** How long to wait between surveys while the list is still changing. */
  activeIntervalSec: number;
  /**
   * How many surveys in a row must see an unchanged list before the wait
   * between them grows to `idleIntervalSec`.
   */
  idleAfter: number;
  /** How long to wait between surveys once the list has sat still. */
  idleIntervalSec: number;
  /** How often to poll the pull request being watched. */
  pollIntervalSec: number;
  /** How long to watch one pull request before giving up on it. */
  watchTimeoutMin: number;
}>;

export const defaultOptions: Options = {
  once: false,
  dryRun: false,
  activeIntervalSec: 30,
  idleAfter: 10,
  idleIntervalSec: 300,
  pollIntervalSec: 30,
  watchTimeoutMin: 90,
} as const;

export const HELP = [
  'Usage: pnpm run unblock-prs [-- options]',
  '',
  `Takes the ${MERGE_QUEUED_LABEL} pull requests in the order they declare with`,
  '`Merge-After:`, one at a time: rebases the one that is out of date with the',
  `default branch, takes ${SKIP_CI_LABEL} off it, and waits for GitHub to merge it.`,
  '',
  'Options:',
  '  --once                   run one cycle and exit',
  '  --dry-run                survey and report what would be done, then exit',
  `  --active-interval <sec>  wait between surveys while the list is changing (default ${defaultOptions.activeIntervalSec})`,
  `  --idle-after <n>         unchanged surveys before slowing to --idle-interval (default ${defaultOptions.idleAfter})`,
  `  --idle-interval <sec>    wait between surveys once the list has sat still (default ${defaultOptions.idleIntervalSec})`,
  `  --poll-interval <sec>    wait between polls of the watched pull request (default ${defaultOptions.pollIntervalSec})`,
  `  --watch-timeout <min>    give up on a pull request after this long (default ${defaultOptions.watchTimeoutMin})`,
  '  -h, --help               show this help',
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
        'active-interval': { type: 'string' },
        'idle-after': { type: 'string' },
        'idle-interval': { type: 'string' },
        'poll-interval': { type: 'string' },
        'watch-timeout': { type: 'string' },
        help: { type: 'boolean', short: 'h', default: false },
      },
    }),
  );

  if (Result.isErr(parsed)) {
    return Result.err(parsed.value.message);
  }

  const { values } = parsed.value;

  if (values.help) {
    return Result.ok('help');
  }

  const positive = (
    name: string,
    raw: string | undefined,
    fallback: number,
  ): Result<number, string> => {
    if (raw === undefined) {
      return Result.ok(fallback);
    }

    const n = Num.safeParseInt(raw);

    return Result.isOk(n) && n.value > 0
      ? Result.ok(n.value)
      : Result.err(
          `--${name} must be a positive integer, got ${JSON.stringify(raw)}`,
        );
  };

  const activeIntervalSec = positive(
    'active-interval',
    values['active-interval'],
    defaultOptions.activeIntervalSec,
  );

  if (Result.isErr(activeIntervalSec)) {
    return activeIntervalSec;
  }

  const idleAfter = positive(
    'idle-after',
    values['idle-after'],
    defaultOptions.idleAfter,
  );

  if (Result.isErr(idleAfter)) {
    return idleAfter;
  }

  const idleIntervalSec = positive(
    'idle-interval',
    values['idle-interval'],
    defaultOptions.idleIntervalSec,
  );

  if (Result.isErr(idleIntervalSec)) {
    return idleIntervalSec;
  }

  const pollIntervalSec = positive(
    'poll-interval',
    values['poll-interval'],
    defaultOptions.pollIntervalSec,
  );

  if (Result.isErr(pollIntervalSec)) {
    return pollIntervalSec;
  }

  const watchTimeoutMin = positive(
    'watch-timeout',
    values['watch-timeout'],
    defaultOptions.watchTimeoutMin,
  );

  if (Result.isErr(watchTimeoutMin)) {
    return watchTimeoutMin;
  }

  return Result.ok({
    once: values.once,
    dryRun: values['dry-run'],
    activeIntervalSec: activeIntervalSec.value,
    idleAfter: idleAfter.value,
    idleIntervalSec: idleIntervalSec.value,
    pollIntervalSec: pollIntervalSec.value,
    watchTimeoutMin: watchTimeoutMin.value,
  });
};
