/** What `push-fixed-pr`'s command line says (`spec/commands.md`, `push-fixed-pr`). */

import { isClaimant } from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import { numberOperand, parseCommandLine } from '../../cli/index.mjs';

export const parsePushFixedPrOptions = (
  args: readonly string[],
): Result<PushFixedPrOptions | 'help', string> => {
  const parsed = parseCommandLine(args, {
    by: { type: 'string' },
    head: { type: 'string' },
  });

  if (Result.isErr(parsed)) {
    return parsed;
  }

  if (parsed.value === 'help') {
    return Result.ok('help');
  }

  const { values, operands } = parsed.value;

  if (operands.length > 1) {
    return Result.err(`unexpected argument: ${Arr.tail(operands).join(' ')}`);
  }

  const number = numberOperand('pull request', operands[0]);

  if (Result.isErr(number)) {
    return number;
  }

  if (values.by === undefined || !isClaimant(values.by)) {
    return Result.err(
      '--by names the claimant, as it claimed the pull request',
    );
  }

  return values.head === undefined || !COMMIT.test(values.head)
    ? Result.err('--head names the commit to push, by its SHA')
    : Result.ok({ number: number.value, by: values.by, head: values.head });
};

export type PushFixedPrOptions = Readonly<{
  number: number;
  /** The claimant, as it claimed the pull request. */
  by: string;
  /** The fix: a commit already in this clone's objects, by its SHA. */
  head: string;
}>;

export const PUSH_FIXED_PR_HELP = [
  'Usage: push-fixed-pr <number> --by <claimant> --head <commit>',
  '',
  'Hands a fixed pull request back to unblock-prs: pushes <commit> onto the',
  'branch --by claimed, under skip-ci, and carries the pull requests stacked',
  "on it along. It refuses unless the claim on it is --by's.",
  '',
  'Options:',
  '  --by <claimant>  the claimant, as given to claim-pr',
  "  --head <commit>  the fix, already in this clone's objects",
  '  -h, --help       show this help',
  '',
  "It pushes to this clone's origin, and writes as the token (GH_TOKEN or",
  'GITHUB_TOKEN) account.',
].join('\n');

/** A commit by its SHA, abbreviated or whole, SHA-1 or SHA-256. */
const COMMIT = /^[0-9a-f]{7,64}$/iu;
