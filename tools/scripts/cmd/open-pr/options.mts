/** What the command line says, and how it is read. */

import * as util from 'node:util';
import { SKIP_CI_LABEL } from 'pr-report-core';
import { Num, Result } from 'ts-data-forge';

export type Options = Readonly<{
  /** The pull request title; the branch's last commit subject when absent. */
  title: string | undefined;
  /** A file to take the body from; only the trailer, or nothing, when absent. */
  bodyFile: string | undefined;
  /**
   * What to target; the repository's default branch when absent. Another
   * open pull request's branch stacks it on that pull request.
   */
  base: string | undefined;
  /** Pull requests to declare with `Merge-After:`, in the order given. */
  mergeAfter: readonly number[];
  /** Say what would be done, and touch nothing. */
  dryRun: boolean;
}>;

export const HELP = [
  'Usage: pnpm run open-pr [-- options]',
  '',
  'Opens the pull request for the current branch the way this repository',
  'wants one opened: push, create it ready for review, and add the',
  `${SKIP_CI_LABEL} label. It never arms auto-merge: unblock-prs does, when it`,
  'picks the pull request once it is labelled merge-queued.',
  '',
  'Re-running is safe: each step is skipped when it is already done, so a run',
  'that failed part way through is finished by running it again.',
  '',
  'The description is yours to write — say in it which checks you ran, since',
  `while ${SKIP_CI_LABEL} is on they are the only checks the branch gets.`,
  '',
  'Options:',
  '  --title <text>          pull request title (default: the last commit subject)',
  '  --body-file <path>      file to take the body from (default: the trailer alone)',
  '  --base <branch>         what to target (default: the repository default branch);',
  '                          the branch of an open pull request stacks it on that one',
  '  --merge-after <number>  declare a predecessor; repeat for several',
  '  --dry-run               say what would be done, and touch nothing',
  '  -h, --help              show this help',
].join('\n');

export const parseOptions = (
  args: readonly string[],
): Result<Options | 'help', string> => {
  // `pnpm run open-pr -- --dry-run` forwards the `--` as well, and
  // `parseArgs` would read everything after it as positionals.
  const [first, ...rest] = args;

  const argv: readonly string[] = first === '--' ? rest : args;

  const parsed = Result.fromThrowable(() =>
    util.parseArgs({
      args: Array.from(argv),
      options: {
        title: { type: 'string' },
        'body-file': { type: 'string' },
        base: { type: 'string' },
        'merge-after': { type: 'string', multiple: true },
        'dry-run': { type: 'boolean', default: false },
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

  const mergeAfter = parseMergeAfter(values['merge-after'] ?? []);

  if (Result.isErr(mergeAfter)) {
    return mergeAfter;
  }

  return Result.ok({
    title: values.title,
    bodyFile: values['body-file'],
    base: values.base,
    mergeAfter: mergeAfter.value,
    dryRun: values['dry-run'],
  });
};

/**
 * `#1901` and `1901` both name the same pull request, and a person copying
 * from GitHub will paste the first.
 */
const parseMergeAfter = (
  raw: readonly string[],
): Result<readonly number[], string> => {
  const mut_numbers: number[] = [];

  for (const value of raw) {
    const parsed = Num.safeParseInt(value.replace(/^#/u, ''));

    if (Result.isErr(parsed) || parsed.value <= 0) {
      return Result.err(
        `--merge-after must be a pull request number, got ${JSON.stringify(value)}`,
      );
    }

    mut_numbers.push(parsed.value);
  }

  return Result.ok(mut_numbers);
};
