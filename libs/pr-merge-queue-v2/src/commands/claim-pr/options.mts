/** What `claim-pr`'s command line says (`spec/commands.md`, `claim-pr`). */

import { isClaimant } from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import { numberOperand, parseCommandLine } from '../../cli/index.mjs';

export const parseClaimPrOptions = (
  args: readonly string[],
): Result<ClaimPrOptions | 'help', string> => {
  const parsed = parseCommandLine(args, {
    by: { type: 'string' },
    release: { type: 'boolean' },
    repo: { type: 'string' },
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
      '--by names who claims it: a session URL, or any other word unique to you',
    );
  }

  return Result.ok({
    number: number.value,
    by: values.by,
    release: values.release === true,
    repo: values.repo,
  });
};

export type ClaimPrOptions = Readonly<{
  number: number;
  /** Who claims it: a session URL, or any other word unique to the claimant. */
  by: string;
  /** Gives the claim up rather than taking it. */
  release: boolean;
  /** `owner/name`; else `origin`, else the root `package.json`. */
  repo: string | undefined;
}>;

export const CLAIM_PR_HELP = [
  'Usage: claim-pr <number> --by <claimant> [--release] [--repo <owner/name>]',
  '',
  'Claims a pull request unblock-prs set aside, before fixing it, so that',
  'unblock-prs and every other session leave it alone meanwhile. A push to',
  'the branch ends the claim; --release gives it up without one.',
  '',
  'Options:',
  '  --by <claimant>  who claims it: a session URL, or any word unique to you',
  '  --release        give the claim up',
  '  --repo <o/n>     the repository (default: origin, else package.json)',
  '  -h, --help       show this help',
  '',
  'It writes as the token (GH_TOKEN or GITHUB_TOKEN) account, which has to',
  'be the one unblock-prs runs as.',
].join('\n');
