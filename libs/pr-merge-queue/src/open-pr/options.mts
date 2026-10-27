/** What the command line says, and how it is read. */

import { SKIP_CI_LABEL } from 'pr-report-core';
import { Arr, Result } from 'ts-data-forge';
import { parseCommandArgs, pullRequestNumber } from '../lib/index.mjs';

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
  /**
   * Open pull requests that are to merge after this one, each to have it
   * written into its `Merge-After:`, in the order given.
   */
  mergeBefore: readonly number[];
  /** Say what would be done, and touch nothing. */
  dryRun: boolean;
}>;

export const HELP = [
  'Usage: open-pr [options]',
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
  '  --merge-before <number> declare a successor: write this one into the',
  '                          Merge-After of that open pull request; repeat for several',
  '  --dry-run               say what would be done, and touch nothing',
  '  -h, --help              show this help',
].join('\n');

export const parseOptions = (
  args: readonly string[],
): Result<Options | 'help', string> => {
  const parsed = parseCommandArgs(args, {
    title: { type: 'string' },
    'body-file': { type: 'string' },
    base: { type: 'string' },
    'merge-after': { type: 'string', multiple: true },
    'merge-before': { type: 'string', multiple: true },
    'dry-run': { type: 'boolean', default: false },
  });

  if (Result.isErr(parsed)) {
    return parsed;
  }

  if (parsed.value === 'help') {
    return Result.ok('help');
  }

  const values = parsed.value;

  const mergeAfter = parseNumbers('--merge-after', values['merge-after'] ?? []);

  if (Result.isErr(mergeAfter)) {
    return mergeAfter;
  }

  const mergeBefore = parseNumbers(
    '--merge-before',
    values['merge-before'] ?? [],
  );

  if (Result.isErr(mergeBefore)) {
    return mergeBefore;
  }

  const both = mergeBefore.value.filter((n) => mergeAfter.value.includes(n));

  if (Arr.isNonEmpty(both)) {
    return Result.err(
      `${both.map((n) => `#${n}`).join(', ')} named by both --merge-after and --merge-before: a cycle, which nothing would ever merge`,
    );
  }

  return Result.ok({
    title: values.title,
    bodyFile: values['body-file'],
    base: values.base,
    mergeAfter: mergeAfter.value,
    mergeBefore: mergeBefore.value,
    dryRun: values['dry-run'],
  });
};

const parseNumbers = (
  flag: '--merge-after' | '--merge-before',
  raw: readonly string[],
): Result<readonly number[], string> => {
  const mut_numbers: number[] = [];

  for (const value of raw) {
    const number = pullRequestNumber(value);

    if (number === undefined) {
      return Result.err(
        `${flag} must be a pull request number, got ${JSON.stringify(value)}`,
      );
    }

    mut_numbers.push(number);
  }

  return Result.ok(mut_numbers);
};
