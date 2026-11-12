/** What the command line says, and how it is read. */

import { Arr, Result } from 'ts-data-forge';
import {
  MAX_INTERVAL_MIN,
  parseIntervalMin,
  parseUsd,
} from '../../agent/index.mjs';
import { parseCommandArgs, positiveInteger } from '../../cli/index.mjs';
import { CAP_PER_AVERAGE, FIRST_CAP_SHARE } from './pool.mjs';

export const parseRunIssueResolverOptions = (
  args: readonly string[],
): Result<RunIssueResolverOptions | 'help', string> => {
  const parsed = parseCommandArgs(args, {
    once: { type: 'boolean' },
    'dry-run': { type: 'boolean' },
    'interval-min': { type: 'string' },
    'max-total-usd': { type: 'string' },
    'max-sessions': { type: 'string' },
    concurrency: { type: 'string' },
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

  const intervalMin = parseIntervalMin(
    values['interval-min'],
    RUN_ISSUE_RESOLVER_INTERVAL_MIN,
  );

  if (Result.isErr(intervalMin)) {
    return intervalMin;
  }

  const maxSessions = positiveInteger(
    'max-sessions',
    values['max-sessions'],
    DEFAULT_MAX_SESSIONS,
  );

  if (Result.isErr(maxSessions)) {
    return maxSessions;
  }

  const concurrency = positiveInteger(
    'concurrency',
    values.concurrency,
    DEFAULT_CONCURRENCY,
  );

  if (Result.isErr(concurrency)) {
    return concurrency;
  }

  if (concurrency.value > MAX_CONCURRENCY) {
    return Result.err(
      `--concurrency must be at most ${MAX_CONCURRENCY}, got ${concurrency.value}`,
    );
  }

  // Required, because the alternative is an amount nobody chose.
  const maxTotalUsd =
    values['max-total-usd'] === undefined
      ? Result.err(
          '--max-total-usd is required: what the run may spend on the Claude API in all',
        )
      : parseUsd('max-total-usd', values['max-total-usd']);

  if (Result.isErr(maxTotalUsd)) {
    return maxTotalUsd;
  }

  const authors = parseAuthors(values.author);

  if (Result.isErr(authors)) {
    return authors;
  }

  return Result.ok({
    once: values.once ?? false,
    dryRun: values['dry-run'] ?? false,
    intervalMin: intervalMin.value,
    maxTotalUsd: maxTotalUsd.value,
    maxSessions: maxSessions.value,
    concurrency: concurrency.value,
    model: values.model,
    authors: authors.value,
  });
};

/**
 * The logins `--author` gave, each once and without a leading `@`, which a
 * person copying a mention from GitHub will paste.
 */
export const parseAuthors = (
  raw: readonly string[] | undefined,
): Result<readonly string[], string> => {
  const authors = Arr.uniq(
    (raw ?? []).map((login) => login.replace(/^@/u, '')),
  );

  return authors.includes('')
    ? Result.err('--author takes a GitHub login, got an empty one')
    : Result.ok(authors);
};

export type RunIssueResolverOptions = Readonly<{
  /** One round, then exit. */
  once: boolean;
  /** Survey and say what it would run, running nothing and labelling nothing. */
  dryRun: boolean;
  /** How long it waits between rounds that find nothing. */
  intervalMin: number;
  /**
   * What the run may spend in all. What each session may spend, passed to
   * `claude --max-budget-usd`, follows from it and from what the issues
   * resolved so far cost (`capForNext` in `pool.mts`).
   */
  maxTotalUsd: number;
  /** How many sessions it runs before it exits. */
  maxSessions: number;
  /** How many sessions it runs at once, each on an issue of its own. */
  concurrency: number;
  /** `claude --model`; Claude Code's own default when not given. */
  model: string | undefined;
  /** Whose issues it starts; the token's own account when empty. */
  authors: readonly string[];
}>;

/**
 * Half an hour. Issues are written far less often than the queue moves, and
 * each look reads every open pull request to tell which issues one closes.
 */
export const RUN_ISSUE_RESOLVER_INTERVAL_MIN = 30;

/**
 * Ten, as many as a person reviews in a sitting. Every session that opens a
 * pull request leaves one more waiting for review, and nothing else bounds how
 * many there will be.
 */
export const DEFAULT_MAX_SESSIONS = 10;

/**
 * Three. Each session builds and checks the repository in worktrees of its own,
 * so a machine pays for every one at once, and each that opens a pull request
 * may touch what another does: more at once is a conflict for `auto-rebase`
 * sooner than it is an issue done sooner.
 */
export const DEFAULT_CONCURRENCY = 3;

/**
 * Eight. A number past it is likelier a slip than a machine that builds the
 * repository that many times over, and it keeps the signal listeners each
 * session adds (`runClaude`), with the stop handler's, within Node's ten.
 */
export const MAX_CONCURRENCY = 8;

export const RUN_ISSUE_RESOLVER_HELP = [
  'Usage: run-issue-resolver --max-total-usd <n> [options]',
  '',
  'Starts the open issues nobody has started, one Claude Code session each,',
  'without a person, on the Claude API: surveys the issues as pr-report',
  'decides how each stands, and starts `claude -p` on one only when it is',
  'startable, unlabelled and written by one of the authors, up to',
  '--concurrency at once, each in a directory of its own.',
  '',
  'Options:',
  '  --max-total-usd <n>   what the run may spend in all (required). The',
  `                        first session, alone, may spend ${FIRST_CAP_SHARE * 100}% of it;`,
  '                        once one has resolved an issue, each may spend',
  `                        ${CAP_PER_AVERAGE} times what one has cost on average, out of`,
  '                        what is left besides those running',
  '  --max-sessions <n>    sessions to run before it exits',
  `                        (default ${DEFAULT_MAX_SESSIONS})`,
  '  --concurrency <n>     sessions to run at once, an issue each',
  `                        (default ${DEFAULT_CONCURRENCY}, at most ${MAX_CONCURRENCY})`,
  '  --author <login>      start only issues this account wrote; repeatable',
  '                        (default: the account GH_TOKEN authenticates as)',
  '  --interval-min <n>    minutes between rounds that find nothing',
  `                        (default ${RUN_ISSUE_RESOLVER_INTERVAL_MIN}, at most ${MAX_INTERVAL_MIN})`,
  '  --model <model>       the model Claude Code runs (default: its own)',
  '  --once                one look: start as many issues as --concurrency',
  '                        and the budget allow, wait for them, then exit',
  '  --dry-run             say what it would run; run and label nothing',
  '  -h, --help            show this help',
  '',
  'Needs ANTHROPIC_API_KEY, and refuses a session that authenticates any',
  'other way; GH_TOKEN or GITHUB_TOKEN of an account that may push branches',
  'and open pull requests; and `claude` on PATH. Run it from the',
  'repository’s root.',
].join('\n');
