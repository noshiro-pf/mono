/** What `rework-pr`'s command line says (`spec/commands.md`, `rework-pr`). */

import { PullRequestLabel, type ReworkHandBack } from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import { parseCommandLine } from '../../cli/index.mjs';

export const parseReworkPrOptions = (
  args: readonly string[],
): Result<ReworkPrOptions | 'help', string> => {
  const parsed = parseCommandLine(args, {
    'dry-run': { type: 'boolean' },
    requeue: { type: 'boolean' },
    review: { type: 'boolean' },
  });

  if (Result.isErr(parsed)) {
    return parsed;
  }

  if (parsed.value === 'help') {
    return Result.ok('help');
  }

  const { values, operands } = parsed.value;

  const [phase] = operands;

  if (
    !Arr.isFixedLengthArray(1, operands) ||
    (phase !== 'start' && phase !== 'done')
  ) {
    return Result.err(
      Arr.isNonEmpty(operands) && operands.length > 1
        ? `unexpected argument: ${Arr.tail(operands).join(' ')}`
        : 'give one of start or done',
    );
  }

  const dryRun = values['dry-run'] === true;

  const requeue = values.requeue === true;

  const review = values.review === true;

  if (phase === 'start') {
    return requeue || review
      ? Result.err('--requeue and --review go with done, not start')
      : Result.ok({ phase, dryRun });
  }

  return requeue === review
    ? Result.err(
        'done takes one of --requeue (the work changes nothing the description says) or --review (it does)',
      )
    : Result.ok({ phase, handBack: requeue ? 'requeue' : 'review', dryRun });
};

export type ReworkPrOptions = Readonly<
  | { phase: 'start'; dryRun: boolean }
  | { phase: 'done'; handBack: ReworkHandBack; dryRun: boolean }
>;

export const REWORK_PR_HELP = [
  'Usage: rework-pr start [--dry-run]',
  '       rework-pr done <--requeue|--review> [--dry-run]',
  '',
  'Takes the pull request of the current branch out of the merge queue while',
  'more work goes into it, and gives it back once that is pushed.',
  '',
  `  start  put ${PullRequestLabel.skipCi} on, take ${PullRequestLabel.mergeQueued} off, disarm auto-merge,`,
  '         and make it a draft; a draft refused is said, and is not a',
  '         failure, since the labels hold it without one',
  '  done   refuse uncommitted changes and untracked files, push the commit',
  '         checked out, leased against the head the queue read, carry along',
  '         the pull requests stacked on it, then mark it ready for review,',
  '         and then:',
  '           --requeue  the work changes nothing the description says: put',
  `                      ${PullRequestLabel.mergeQueued} back, if start took it off, and the queue`,
  '                      takes it from there',
  `           --review   it does: ${PullRequestLabel.mergeQueued} stays off, so that the author`,
  '                      reviews it again, the description rewritten first',
  '',
  'Each step is skipped when it is already done, so a run that failed part way',
  'through is finished by running it again.',
  '',
  'Both refuse a pull request someone has claimed, or that unblock-prs set aside',
  'for a skill to fix: that is claim-pr and push-fixed-pr.',
  '',
  'Options:',
  '  --dry-run   say what would be done, and touch nothing',
  '  -h, --help  show this help',
].join('\n');
