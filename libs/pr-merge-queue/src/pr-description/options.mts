/** What the command line says, and how it is read. */

import {
  FILING_PRIORITIES,
  parseIssuePriority,
  type IssuePriority,
} from 'pr-report-core';
import { Arr, isNotUndefined, Result } from 'ts-data-forge';
import { parseCommandArgs, pullRequestNumber } from '../lib/index.mjs';

/** One run of `pr-description`: which command, and what it was given. */
export type Command =
  | CreateCommand
  | PushCommand
  | SimilarCommand
  | Readonly<
      | {
          kind: 'check';
          file: string;
          /** The file is an issue's description, not a pull request's. */
          issue: boolean;
        }
      | {
          kind: 'pull';
          number: number;
          file: string;
          repo: string | undefined;
        }
      | { kind: 'read'; number: number; repo: string | undefined }
    >;

export type PushCommand = Readonly<{
  kind: 'push';
  number: number;
  file: string;
  wordingOnly: boolean;
  repo: string | undefined;
}>;

export type CreateCommand = Readonly<{
  kind: 'create';
  title: string;
  file: string;
  /** Put on as its `priority:<tier>` label (`docs/issue-priority.md`). */
  priority: IssuePriority;
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

export const HELP = [
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
  `                                  one of ${FILING_PRIORITIES.join(', ')} (docs/issue-priority.md);`,
  '                                  refused while an open issue has a close',
  '                                  title, unless named by --not-duplicate',
  '',
  'Options:',
  '  --wording-only  push: allow one half to change alone, for a change of',
  '                  wording that changes no meaning, such as a typo',
  '  --repo <owner/name>  the repository (default: origin)',
  '  -h, --help      show this help',
].join('\n');

export const parseOptions = (
  args: readonly string[],
): Result<Command | 'help', string> => {
  // `pnpm run pr-description -- read 1` forwards the `--` as well.
  const argv = args[0] === '--' ? Arr.tail(args) : args;

  const [kind, ...rest] = argv;

  if (kind === undefined || kind === '-h' || kind === '--help') {
    return Result.ok('help');
  }

  switch (kind) {
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

const parseNumbered = (
  kind: 'pull' | 'push' | 'read',
  args: readonly string[],
): Result<Command | 'help', string> => {
  const [raw, ...rest] = args;

  const number = raw === undefined ? undefined : pullRequestNumber(raw);

  if (number === undefined) {
    return Result.err(
      `${kind} takes the number of a pull request or issue, got ${raw === undefined ? 'nothing' : JSON.stringify(raw)}`,
    );
  }

  const parsed = parseCommandArgs(rest, {
    file: { type: 'string' },
    repo: { type: 'string' },
    'wording-only': { type: 'boolean', default: false },
  });

  if (Result.isErr(parsed)) {
    return parsed;
  }

  if (parsed.value === 'help') {
    return Result.ok('help');
  }

  const { file, repo, 'wording-only': wordingOnly } = parsed.value;

  if (kind === 'read') {
    return file === undefined && !wordingOnly
      ? Result.ok({ kind, number, repo })
      : Result.err('read takes neither --file nor --wording-only');
  }

  if (file === undefined) {
    return Result.err(`${kind} needs --file <path>`);
  }

  if (kind === 'pull') {
    return wordingOnly
      ? Result.err('--wording-only is for push')
      : Result.ok({ kind, number, file, repo });
  }

  return Result.ok({ kind, number, file, wordingOnly, repo });
};

const parseCheck = (
  args: readonly string[],
): Result<Command | 'help', string> => {
  const parsed = parseCommandArgs(args, {
    file: { type: 'string' },
    issue: { type: 'boolean', default: false },
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
    : Result.ok({ kind: 'check', file, issue });
};

const parseCreate = (
  args: readonly string[],
): Result<Command | 'help', string> => {
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

  const {
    title,
    file,
    priority: rawPriority,
    label: labels = [],
    'not-duplicate': rawNotDuplicates = [],
    repo,
  } = parsed.value;

  if (file === undefined || title === undefined || title.trim() === '') {
    return Result.err('create needs --title <text> and --file <path>');
  }

  const priority =
    rawPriority === undefined ? undefined : parseIssuePriority(rawPriority);

  if (
    priority === undefined ||
    FILING_PRIORITIES.every((each) => each !== priority)
  ) {
    return Result.err(
      `create needs --priority <tier>, one of ${FILING_PRIORITIES.join(', ')} (docs/issue-priority.md)${rawPriority === undefined ? '' : `; got ${JSON.stringify(rawPriority)}`}`,
    );
  }

  if (labels.some((label) => label.startsWith('priority:'))) {
    return Result.err(
      'give the tier with --priority, not as a --label: an issue carries exactly one',
    );
  }

  const notDuplicates = rawNotDuplicates
    .map(pullRequestNumber)
    .filter(isNotUndefined);

  if (notDuplicates.length !== rawNotDuplicates.length) {
    return Result.err('--not-duplicate takes the number of an open issue');
  }

  return Result.ok({
    kind: 'create',
    title,
    file,
    priority,
    labels,
    notDuplicates,
    repo,
  });
};

const parseSimilar = (
  args: readonly string[],
): Result<Command | 'help', string> => {
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

  const { title, keyword: keywords = [], repo } = parsed.value;

  return title === undefined || title.trim() === ''
    ? Result.err('similar needs --title <text>')
    : Result.ok({ kind: 'similar', title, keywords, repo });
};
