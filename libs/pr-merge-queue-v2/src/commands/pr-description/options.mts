/** What `pr-description`'s command line says (`spec/commands.md`). */

import { FILING_TIERS, type IssueTier } from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import {
  numberOperand,
  parseCommandArgs,
  parseCommandLine,
} from '../../cli/index.mjs';

export const parsePrDescriptionOptions = (
  args: readonly string[],
): Result<DescriptionCommand | 'help', string> => {
  // `pnpm run pr-description -- read 1` forwards the `--` as well.
  const argv = args[0] === '--' ? Arr.tail(args) : args;

  const [kind, ...rest] = argv;

  switch (kind) {
    case undefined:
    case '-h':
    case '--help':
      return Result.ok('help');

    case 'read':
    case 'pull':
    case 'push':
      return parseNumbered(kind, rest);

    case 'check':
      return parseCheck(rest);

    case 'create':
      return parseCreate(rest);

    case 'similar':
      return parseSimilar(rest);

    default:
      return Result.err(`unknown command ${JSON.stringify(kind)}`);
  }
};

/** One run of `pr-description`: which command, and what it was given. */
export type DescriptionCommand =
  | CheckCommand
  | CreateCommand
  | PullCommand
  | PushCommand
  | ReadCommand
  | SimilarCommand;

export type ReadCommand = Readonly<{
  kind: 'read';
  number: number;
  repo: string | undefined;
}>;

export type PullCommand = Readonly<{
  kind: 'pull';
  number: number;
  file: string;
  repo: string | undefined;
}>;

export type PushCommand = Readonly<{
  kind: 'push';
  number: number;
  file: string;
  /** One half may change alone, for wording that changes no meaning. */
  wordingOnly: boolean;
  repo: string | undefined;
}>;

export type CheckCommand = Readonly<{
  kind: 'check';
  file: string;
  /** The file is an issue's description, not a pull request's. */
  issue: boolean;
}>;

export type CreateCommand = Readonly<{
  kind: 'create';
  title: string;
  file: string;
  /** Put on as its `priority:<tier>` label (`docs/issue-priority.md`). */
  priority: IssueTier;
  labels: readonly string[];
  /** Open issues the filer has read and says this one is not. */
  notDuplicates: readonly number[];
  repo: string | undefined;
}>;

export type SimilarCommand = Readonly<{
  kind: 'similar';
  title: string;
  keywords: readonly string[];
  repo: string | undefined;
}>;

export const PR_DESCRIPTION_HELP = [
  'Usage: pr-description <command> [<number>] [options]',
  '',
  'Reads and writes pull request and issue descriptions. When',
  '.github/unblock-prs.json names a translation heading, a description is the',
  'original, then its translation under "## <heading>" with its headings one',
  'level down, then a "---" rule and the trailers; every write checks that the',
  'halves mirror each other.',
  '',
  'Commands:',
  '  read <number>                   print the description, translation left out',
  '  pull <number> --file <path>     save the description to edit, and what it was',
  '  push <number> --file <path>     write an edited one back: refused when GitHub',
  '                                  changed it since the pull, or one half changed',
  '                                  and the other did not',
  '  check --file <path> [--issue]   check a description before it is posted;',
  "                                  --issue for an issue's, where a closing",
  '                                  keyword is prose rather than a trailer',
  '  similar --title <text> [--keyword <word>]...',
  '                                  list the open issues a new one may repeat:',
  '                                  close titles, and those naming a keyword',
  '  create --title <text> --file <path> --priority <tier> [--label <name>]...',
  '         [--not-duplicate <number>]...',
  '                                  file an issue with that description, under',
  `                                  one of ${FILING_TIERS.join(', ')} (docs/issue-priority.md);`,
  '                                  refused while an open issue has a close',
  '                                  title, unless named by --not-duplicate',
  '',
  'Options:',
  '  --wording-only        push: allow one half to change alone, for a change',
  '                        of wording that changes no meaning, such as a typo',
  '  --repo <owner/name>   the repository (default: origin, else package.json)',
  '  -h, --help            show this help',
].join('\n');

const parseNumbered = (
  kind: 'pull' | 'push' | 'read',
  args: readonly string[],
): Result<DescriptionCommand | 'help', string> => {
  const parsed = parseCommandLine(args, {
    file: { type: 'string' },
    repo: { type: 'string' },
    'wording-only': { type: 'boolean' },
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

  const number = numberOperand('pull request or issue', operands[0]);

  if (Result.isErr(number)) {
    return number;
  }

  const { file, repo } = values;

  const wordingOnly = values['wording-only'] === true;

  switch (kind) {
    case 'read':
      return file === undefined && !wordingOnly
        ? Result.ok({ kind, number: number.value, repo })
        : Result.err('read takes neither --file nor --wording-only');

    case 'pull':
      return file === undefined
        ? Result.err('pull needs --file <path>')
        : wordingOnly
          ? Result.err('--wording-only is for push')
          : Result.ok({ kind, number: number.value, file, repo });

    case 'push':
      return file === undefined
        ? Result.err('push needs --file <path>')
        : Result.ok({ kind, number: number.value, file, wordingOnly, repo });
  }
};

const parseCheck = (
  args: readonly string[],
): Result<DescriptionCommand | 'help', string> => {
  const parsed = parseCommandArgs(args, {
    file: { type: 'string' },
    issue: { type: 'boolean' },
  });

  if (Result.isErr(parsed)) {
    return parsed;
  }

  if (parsed.value === 'help') {
    return Result.ok('help');
  }

  const { file, issue } = parsed.value;

  return file === undefined
    ? Result.err('check needs --file <path>')
    : Result.ok({ kind: 'check', file, issue: issue === true });
};

const parseCreate = (
  args: readonly string[],
): Result<DescriptionCommand | 'help', string> => {
  const parsed = parseCommandArgs(args, {
    title: { type: 'string' },
    file: { type: 'string' },
    priority: { type: 'string' },
    label: { type: 'string', multiple: true },
    'not-duplicate': { type: 'string', multiple: true },
    repo: { type: 'string' },
  });

  if (Result.isErr(parsed)) {
    return parsed;
  }

  if (parsed.value === 'help') {
    return Result.ok('help');
  }

  const { title, file, priority: raw, repo } = parsed.value;

  if (file === undefined || title === undefined || title.trim() === '') {
    return Result.err('create needs --title <text> and --file <path>');
  }

  const labels = parsed.value.label ?? [];

  const priority = FILING_TIERS.find((tier) => tier === raw);

  if (priority === undefined) {
    return Result.err(
      `create needs --priority <tier>, one of ${FILING_TIERS.join(', ')} (docs/issue-priority.md)${raw === undefined ? '' : `; got ${JSON.stringify(raw)}`}`,
    );
  }

  if (labels.some((label) => label.startsWith('priority:'))) {
    return Result.err(
      'give the tier with --priority, not as a --label: an issue carries exactly one',
    );
  }

  const notDuplicates = (parsed.value['not-duplicate'] ?? []).map((each) =>
    numberOperand('open issue', each),
  );

  const refused = notDuplicates.find(Result.isErr);

  if (refused !== undefined) {
    return Result.err(`--not-duplicate: ${refused.value}`);
  }

  return Result.ok({
    kind: 'create',
    title,
    file,
    priority,
    labels,
    notDuplicates: notDuplicates.filter(Result.isOk).map(({ value }) => value),
    repo,
  });
};

const parseSimilar = (
  args: readonly string[],
): Result<DescriptionCommand | 'help', string> => {
  const parsed = parseCommandArgs(args, {
    title: { type: 'string' },
    keyword: { type: 'string', multiple: true },
    repo: { type: 'string' },
  });

  if (Result.isErr(parsed)) {
    return parsed;
  }

  if (parsed.value === 'help') {
    return Result.ok('help');
  }

  const { title, repo } = parsed.value;

  return title === undefined || title.trim() === ''
    ? Result.err('similar needs --title <text>')
    : Result.ok({
        kind: 'similar',
        title,
        keywords: parsed.value.keyword ?? [],
        repo,
      });
};
