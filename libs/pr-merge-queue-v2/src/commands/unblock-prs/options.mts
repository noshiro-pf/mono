/** What `unblock-prs`'s command line says (`spec/worker.md`, "Options"). */

import { Result } from 'ts-data-forge';
import { parseCommandArgs, positiveInteger } from '../../cli/index.mjs';

export const parseUnblockPrsOptions = (
  args: readonly string[],
): Result<UnblockPrsOptions | 'help', string> => {
  const parsed = parseCommandArgs(args, {
    once: { type: 'boolean' },
    'dry-run': { type: 'boolean' },
    'active-interval': { type: 'string' },
    'idle-after': { type: 'string' },
    'idle-interval': { type: 'string' },
    'poll-interval': { type: 'string' },
    'watch-timeout': { type: 'string' },
    'no-auto-fix': { type: 'boolean' },
    repo: { type: 'string' },
  });

  if (Result.isErr(parsed)) {
    return parsed;
  }

  if (parsed.value === 'help') {
    return Result.ok('help');
  }

  const values = parsed.value;

  const active = positiveInteger(
    'active-interval',
    values['active-interval'],
    60,
  );

  if (Result.isErr(active)) {
    return active;
  }

  const idleAfter = positiveInteger('idle-after', values['idle-after'], 5);

  if (Result.isErr(idleAfter)) {
    return idleAfter;
  }

  const idle = positiveInteger('idle-interval', values['idle-interval'], 300);

  if (Result.isErr(idle)) {
    return idle;
  }

  const poll = positiveInteger('poll-interval', values['poll-interval'], 60);

  if (Result.isErr(poll)) {
    return poll;
  }

  const watchTimeout = positiveInteger(
    'watch-timeout',
    values['watch-timeout'],
    90,
  );

  if (Result.isErr(watchTimeout)) {
    return watchTimeout;
  }

  return Result.ok({
    once: values.once === true,
    dryRun: values['dry-run'] === true,
    activeIntervalMs: active.value * 1000,
    idleAfter: idleAfter.value,
    idleIntervalMs: idle.value * 1000,
    pollIntervalMs: poll.value * 1000,
    watchTimeoutMs: watchTimeout.value * 60_000,
    autoFix: values['no-auto-fix'] !== true,
    repo: values.repo,
  });
};

export type UnblockPrsOptions = Readonly<{
  /** Run one cycle and exit. */
  once: boolean;
  /** Read and plan, change nothing, say what it would do. */
  dryRun: boolean;
  activeIntervalMs: number;
  /** Unchanged snapshots before the long wait. */
  idleAfter: number;
  idleIntervalMs: number;
  /** The wait while one is in flight. */
  pollIntervalMs: number;
  watchTimeoutMs: number;
  /** `false` under `--no-auto-fix`, which turns Regenerate off too. */
  autoFix: boolean;
  /** The repository, when `origin` is not it. */
  repo: string | undefined;
}>;

export const UNBLOCK_PRS_HELP = [
  'Usage: unblock-prs [options]',
  '',
  'Takes the merge-queued pull requests forward one at a time, in the order they',
  'declare, until stopped: rebases, arms auto-merge, takes skip-ci off, and',
  'watches the one released until it merges or is set aside.',
  '',
  'Options:',
  '  --once                    run one cycle and exit',
  '  --dry-run                 read and plan, change nothing, say what it would do',
  '  --active-interval <sec>   wait between cycles while the list moves (60)',
  '  --idle-after <n>          unchanged snapshots before the long wait (5)',
  '  --idle-interval <sec>     wait once it has sat still (300)',
  '  --poll-interval <sec>     wait while one is in flight (60)',
  '  --watch-timeout <min>     give up on one in flight after this (90)',
  '  --no-auto-fix             skip Auto-fix and Regenerate',
  '  --repo <owner/name>       the repository, when origin is not it',
  '  -h, --help                show this help',
].join('\n');
