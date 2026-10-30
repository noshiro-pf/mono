/** What the command line says, and how it is read. */

import { Arr, Num, Result } from 'ts-data-forge';
import { parseCommandArgs, positiveInteger } from '../lib/index.mjs';

export const parseOptions = (
  args: readonly string[],
): Result<Options | 'help', string> => {
  const parsed = parseCommandArgs(args, {
    once: { type: 'boolean' },
    'dry-run': { type: 'boolean' },
    'interval-min': { type: 'string' },
    'max-budget-usd': { type: 'string' },
    model: { type: 'string' },
    skill: { type: 'string' },
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

  const maxBudgetUsd = budget(values['max-budget-usd']);

  if (Result.isErr(maxBudgetUsd)) {
    return maxBudgetUsd;
  }

  if (values.skill?.startsWith('/') === true) {
    return Result.err(
      `--skill takes the skill's name without the slash, got ${JSON.stringify(values.skill)}`,
    );
  }

  return Result.ok({
    once: values.once ?? false,
    dryRun: values['dry-run'] ?? false,
    intervalMin: intervalMin.value,
    maxBudgetUsd: maxBudgetUsd.value,
    model: values.model,
    skill: values.skill,
  });
};

export type Options = Readonly<{
  /** One round, then exit. */
  once: boolean;
  /** Survey and say what it would run, running nothing and filing nothing. */
  dryRun: boolean;
  /** How long it waits between rounds. */
  intervalMin: number;
  /** What one round may spend, passed to `claude --max-budget-usd`. */
  maxBudgetUsd: number;
  /** `claude --model`; Claude Code's own default when not given. */
  model: string | undefined;
  /** The skill's name; read from the checkout when not given. */
  skill: string | undefined;
}>;

/**
 * Ten minutes. A round that finds nothing costs a handful of GitHub requests
 * and no tokens, so it can look more often than the 20–30 minutes the skill
 * waits under `/loop`, where every look is a turn of the model.
 */
export const DEFAULT_INTERVAL_MIN = 10;

/**
 * A day. Past about 24 days the wait overflows `setTimeout`, which then
 * fires at once and turns the loop into a busy one; nothing needs a wait
 * anywhere near that long.
 */
export const MAX_INTERVAL_MIN = 24 * 60;

export const HELP = [
  'Usage: run-unblock-prs-skill --max-budget-usd <n> [options]',
  '',
  'Runs the unblock-prs skill in Claude Code without a person, on the',
  'Claude API: surveys the queue as the skill would, and starts',
  '`claude -p` only when a pull request is the skill’s to fix.',
  '',
  'Options:',
  '  --max-budget-usd <n>  what one round, on one pull request, may spend',
  '                        (required)',
  '  --interval-min <n>    minutes between rounds that find nothing',
  `                        (default ${DEFAULT_INTERVAL_MIN}, at most ${MAX_INTERVAL_MIN})`,
  '  --model <model>       the model Claude Code runs (default: its own)',
  '  --skill <name>        the skill to run (default: unblock-prs where the',
  '                        repository has it, otherwise the plugin’s',
  '                        pr-merge-queue:unblock-prs)',
  '  --once                one round (one pull request at most), then exit',
  '  --dry-run             say what it would run; run and file nothing',
  '  -h, --help            show this help',
  '',
  'Needs ANTHROPIC_API_KEY, and refuses a session that authenticates any',
  'other way; GH_TOKEN or GITHUB_TOKEN of the account unblock-prs runs as;',
  'and `claude` on PATH. Run it from the repository’s root, beside the worker.',
].join('\n');

/**
 * Required, because the alternative is an amount nobody chose: a round that
 * cannot settle a failure keeps going until something stops it, and this is
 * the only thing that does.
 */
const budget = (raw: string | undefined): Result<number, string> => {
  if (raw === undefined) {
    return Result.err(
      '--max-budget-usd is required: what one round may spend on the Claude API',
    );
  }

  // A whole part and an optional fraction, read apart so that neither
  // pattern repeats inside another.
  const [whole = '', fraction, ...rest] = raw.split('.');

  const parsed =
    /^(?:0|[1-9]\d*)$/u.test(whole) &&
    (fraction === undefined || /^\d+$/u.test(fraction)) &&
    !Arr.isNonEmpty(rest)
      ? Result.unwrapOkOr(Num.safeParseFloat(raw), Number.NaN)
      : Number.NaN;

  return Number.isFinite(parsed) && Num.isNonZero(parsed)
    ? Result.ok(parsed)
    : Result.err(
        `--max-budget-usd must be a positive amount in US dollars, got ${JSON.stringify(raw)}`,
      );
};
