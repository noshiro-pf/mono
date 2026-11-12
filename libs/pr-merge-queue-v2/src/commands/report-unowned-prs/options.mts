/** What `report-unowned-prs`'s command line says (`spec/commands.md`). */

import { Arr, Result } from 'ts-data-forge';
import { parseCommandLine } from '../../cli/index.mjs';

export const parseReportUnownedPrsOptions = (
  args: readonly string[],
): Result<ReportUnownedPrsOptions | 'help', string> => {
  const parsed = parseCommandLine(args, {
    'dry-run': { type: 'boolean' },
    repo: { type: 'string' },
  });

  if (Result.isErr(parsed)) {
    return parsed;
  }

  if (parsed.value === 'help') {
    return Result.ok('help');
  }

  const { values, operands } = parsed.value;

  if (Arr.isNonEmpty(operands)) {
    return Result.err(`unexpected argument: ${operands.join(' ')}`);
  }

  return Result.ok({
    dryRun: values['dry-run'] === true,
    repo: values.repo,
  });
};

export type ReportUnownedPrsOptions = Readonly<{
  /** Says what it would file, and files nothing. */
  dryRun: boolean;
  /** `owner/name`; else `origin`, else the root `package.json`. */
  repo: string | undefined;
}>;

export const REPORT_UNOWNED_PRS_HELP = [
  'Usage: report-unowned-prs [--dry-run] [--repo <owner/name>]',
  '',
  'Files an issue for each queued pull request nobody owns: one the',
  'worker, a skill and a person are all waiting on someone else for.',
  'Once per pull request; an open issue this account filed is not filed again.',
  'Each is labelled priority:A, the tier of a merge queue that has stopped.',
  '',
  'Options:',
  '  --dry-run     say what it would file, and file nothing',
  '  --repo <o/n>  the repository (default: origin, else package.json)',
  '  -h, --help    show this help',
].join('\n');
