/** What `start-issue`'s command line says (`spec/commands.md`, `start-issue`). */

import { isClaimant } from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import { numberOperand, parseCommandLine } from '../../cli/index.mjs';

export const parseStartIssueOptions = (
  args: readonly string[],
): Result<StartIssueOptions | 'help', string> => {
  const parsed = parseCommandLine(args, {
    by: { type: 'string' },
    plan: { type: 'boolean' },
    release: { type: 'boolean' },
    force: { type: 'boolean' },
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

  const number = numberOperand('issue', operands[0]);

  if (Result.isErr(number)) {
    return number;
  }

  if (values.plan === true && values.release === true) {
    return Result.err('--plan and --release do not go together');
  }

  if (values.by === undefined || !isClaimant(values.by)) {
    return Result.err(
      '--by names who starts it: a session URL, or any other word unique to you',
    );
  }

  return Result.ok({
    number: number.value,
    by: values.by,
    mode:
      values.release === true
        ? 'release'
        : values.plan === true
          ? 'plan'
          : 'start',
    force: values.force === true,
    repo: values.repo,
  });
};

export type StartIssueOptions = Readonly<{
  number: number;
  /** Who claims it: a session URL, or any other word unique to the claimant. */
  by: string;
  mode: 'plan' | 'release' | 'start';
  /** Goes past a refusal someone may overrule. */
  force: boolean;
  /** `owner/name`; else `origin`, else the root `package.json`. */
  repo: string | undefined;
}>;

export const START_ISSUE_HELP = [
  'Usage: start-issue <number> --by <claimant> [--plan | --release] [--force]',
  '                   [--repo <owner/name>]',
  '',
  'Marks an issue as started before work on it begins: labels it in-progress,',
  'takes planned off, and says in a comment who started it. Refuses one',
  'someone else claimed or labelled in-progress, or one an open pull request',
  'closes, since someone else may be on it.',
  '',
  'Options:',
  '  --by <claimant>  who starts it: a session URL, or any word unique to you',
  '  --plan           label it planned instead: you mean to start it next (lapses after 24 hours)',
  '  --release        take in-progress and planned off again, when the work is dropped',
  '  --force          go on past a refusal, once whoever decides has said to',
  '  --repo <o/n>     the repository (default: origin, else package.json)',
  '  -h, --help       show this help',
].join('\n');
