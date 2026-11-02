/** What the command line says, and how it is read. */

import { Arr, Result } from 'ts-data-forge';
import { parseCommandArgs, positiveInteger } from '../lib/index.mjs';
import {
  MAX_INTERVAL_MIN,
  parseMaxBudgetUsd,
} from '../run-unblock-prs-skill/index.mjs';

export const parseOptions = (
  args: readonly string[],
): Result<Options | 'help', string> => {
  const parsed = parseCommandArgs(args, {
    once: { type: 'boolean' },
    'dry-run': { type: 'boolean' },
    'interval-min': { type: 'string' },
    'max-budget-usd': { type: 'string' },
    'max-sessions': { type: 'string' },
    model: { type: 'string' },
    author: { type: 'string', multiple: true },
  });

  if (Result.isErr(parsed)) {
    return parsed;
  }

  if (parsed.value === 'help') {
    return Result.ok('help');
  }

  const values = parsed.value;

  const intervalMin = positiveInteger(
    'interval-min',
    values['interval-min'],
    DEFAULT_INTERVAL_MIN,
  );

  if (Result.isErr(intervalMin)) {
    return intervalMin;
  }

  if (intervalMin.value > MAX_INTERVAL_MIN) {
    return Result.err(
      `--interval-min must be at most ${MAX_INTERVAL_MIN} (a day), got ${intervalMin.value}`,
    );
  }

  const maxSessions = positiveInteger(
    'max-sessions',
    values['max-sessions'],
    DEFAULT_MAX_SESSIONS,
  );

  if (Result.isErr(maxSessions)) {
    return maxSessions;
  }

  const maxBudgetUsd = parseMaxBudgetUsd(values['max-budget-usd']);

  if (Result.isErr(maxBudgetUsd)) {
    return maxBudgetUsd;
  }

  const authors = Arr.uniq(
    (values.author ?? []).map((login) => login.replace(/^@/u, '')),
  );

  if (authors.includes('')) {
    return Result.err('--author takes a GitHub login, got an empty one');
  }

  return Result.ok({
    once: values.once ?? false,
    dryRun: values['dry-run'] ?? false,
    intervalMin: intervalMin.value,
    maxBudgetUsd: maxBudgetUsd.value,
    maxSessions: maxSessions.value,
    model: values.model,
    authors,
  });
};

export type Options = Readonly<{
  /** One round, then exit. */
  once: boolean;
  /** Survey and say what it would run, running nothing and labelling nothing. */
  dryRun: boolean;
  /** How long it waits between rounds that find nothing. */
  intervalMin: number;
  /** What one session may spend, passed to `claude --max-budget-usd`. */
  maxBudgetUsd: number;
  /** How many sessions it runs before it exits. */
  maxSessions: number;
  /** `claude --model`; Claude Code's own default when not given. */
  model: string | undefined;
  /** Whose issues it starts; the token's own account when empty. */
  authors: readonly string[];
}>;

/**
 * Half an hour. Issues are written far less often than the queue moves, and
 * each look reads every open pull request to tell which issues one closes.
 */
export const DEFAULT_INTERVAL_MIN = 30;

/**
 * Ten, as many as a person reviews in a sitting. Every session that opens a
 * pull request leaves one more waiting for review, and nothing else bounds how
 * many there will be.
 */
export const DEFAULT_MAX_SESSIONS = 10;

export const HELP = [
  'Usage: run-issue-resolver --max-budget-usd <n> [options]',
  '',
  'Starts the open issues nobody has started, one Claude Code session each,',
  'without a person, on the Claude API: surveys the issues as pr-report',
  'decides how each stands, and starts `claude -p` on one only when it is',
  'startable, unlabelled and written by one of the authors.',
  '',
  'Options:',
  '  --max-budget-usd <n>  what one session, on one issue, may spend',
  '                        (required)',
  '  --max-sessions <n>    sessions to run before it exits',
  `                        (default ${DEFAULT_MAX_SESSIONS})`,
  '  --author <login>      start only issues this account wrote; repeatable',
  '                        (default: the account GH_TOKEN authenticates as)',
  '  --interval-min <n>    minutes between rounds that find nothing',
  `                        (default ${DEFAULT_INTERVAL_MIN}, at most ${MAX_INTERVAL_MIN})`,
  '  --model <model>       the model Claude Code runs (default: its own)',
  '  --once                one round (one issue at most), then exit',
  '  --dry-run             say what it would run; run and label nothing',
  '  -h, --help            show this help',
  '',
  'Needs ANTHROPIC_API_KEY, and refuses a session that authenticates any',
  'other way; GH_TOKEN or GITHUB_TOKEN of an account that may push branches',
  'and open pull requests; and `claude` on PATH. Run it from the',
  'repository’s root.',
].join('\n');
