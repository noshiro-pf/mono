/** What the command line says, and how it is read. */

import { MERGE_QUEUED_LABEL, SKIP_CI_LABEL } from 'pr-report-core';
import { Result } from 'ts-data-forge';
import { parseCommandArgs, positiveInteger } from '../../lib/cli-args.mjs';

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
  /**
   * Whether a watched pull request whose failure is only a fixer's diff has
   * the fixer run, amended onto its commit and pushed. See `auto-fix.mts`.
   */
  autoFix: boolean;
}>;

export const defaultOptions: Options = {
  once: false,
  dryRun: false,
  activeIntervalSec: 30,
  idleAfter: 10,
  idleIntervalSec: 300,
  pollIntervalSec: 30,
  watchTimeoutMin: 90,
  autoFix: true,
} as const;

export const HELP = [
  'Usage: pnpm run unblock-prs [-- options]',
  '',
  `Takes the ${MERGE_QUEUED_LABEL} pull requests in the order they declare with`,
  '`Merge-After:`, one at a time: rebases the one that is out of date with the',
  `default branch, takes ${SKIP_CI_LABEL} off it, and waits for GitHub to merge it.`,
  'When its checks fail only because a fix: or gen: entry of the check matrices',
  'left a diff, runs that command, amends the result and pushes it, once.',
  '',
  'Options:',
  '  --once                   run one cycle and exit',
  '  --dry-run                survey and report what would be done, then exit',
  `  --active-interval <sec>  wait between surveys while the list is changing (default ${defaultOptions.activeIntervalSec})`,
  `  --idle-after <n>         unchanged surveys before slowing to --idle-interval (default ${defaultOptions.idleAfter})`,
  `  --idle-interval <sec>    wait between surveys once the list has sat still (default ${defaultOptions.idleIntervalSec})`,
  `  --poll-interval <sec>    wait between polls of the watched pull request (default ${defaultOptions.pollIntervalSec})`,
  `  --watch-timeout <min>    give up on a pull request after this long (default ${defaultOptions.watchTimeoutMin})`,
  "  --no-auto-fix            leave a failure that is only a fixer's diff as it is",
  '  -h, --help               show this help',
].join('\n');

export const parseOptions = (
  args: readonly string[],
): Result<Options | 'help', string> => {
  const parsed = parseCommandArgs(args, {
    once: { type: 'boolean', default: false },
    'dry-run': { type: 'boolean', default: false },
    'active-interval': { type: 'string' },
    'idle-after': { type: 'string' },
    'idle-interval': { type: 'string' },
    'poll-interval': { type: 'string' },
    'watch-timeout': { type: 'string' },
    'no-auto-fix': { type: 'boolean', default: false },
  });

  if (Result.isErr(parsed)) {
    return parsed;
  }

  if (parsed.value === 'help') {
    return Result.ok('help');
  }

  const values = parsed.value;

  const activeIntervalSec = positiveInteger(
    'active-interval',
    values['active-interval'],
    defaultOptions.activeIntervalSec,
  );

  if (Result.isErr(activeIntervalSec)) {
    return activeIntervalSec;
  }

  const idleAfter = positiveInteger(
    'idle-after',
    values['idle-after'],
    defaultOptions.idleAfter,
  );

  if (Result.isErr(idleAfter)) {
    return idleAfter;
  }

  const idleIntervalSec = positiveInteger(
    'idle-interval',
    values['idle-interval'],
    defaultOptions.idleIntervalSec,
  );

  if (Result.isErr(idleIntervalSec)) {
    return idleIntervalSec;
  }

  const pollIntervalSec = positiveInteger(
    'poll-interval',
    values['poll-interval'],
    defaultOptions.pollIntervalSec,
  );

  if (Result.isErr(pollIntervalSec)) {
    return pollIntervalSec;
  }

  const watchTimeoutMin = positiveInteger(
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
    autoFix: !values['no-auto-fix'],
  });
};
