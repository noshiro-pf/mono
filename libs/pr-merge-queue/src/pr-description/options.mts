/** What the command line says, and how it is read. */

import { Arr, Result } from 'ts-data-forge';
import { parseCommandArgs, pullRequestNumber } from '../lib/index.mjs';

/** One run of `pr-description`: which command, and what it was given. */
export type Command =
  | CreateCommand
  | PushCommand
  | Readonly<
      | { kind: 'check'; file: string }
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
  labels: readonly string[];
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
  '  check --file <path>             check a description before it is posted',
  '  create --title <text> --file <path> [--label <name>]...',
  '                                  file an issue with that description',
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
  const parsed = parseCommandArgs(args, { file: { type: 'string' } });

  if (Result.isErr(parsed)) {
    return parsed;
  }

  if (parsed.value === 'help') {
    return Result.ok('help');
  }

  const { file } = parsed.value;

  return file === undefined
    ? Result.err('check needs --file <path>')
    : Result.ok({ kind: 'check', file });
};

const parseCreate = (
  args: readonly string[],
): Result<Command | 'help', string> => {
  const parsed = parseCommandArgs(args, {
    title: { type: 'string' },
    file: { type: 'string' },
    label: { type: 'string', multiple: true },
    repo: { type: 'string' },
  });

  if (Result.isErr(parsed)) {
    return parsed;
  }

  if (parsed.value === 'help') {
    return Result.ok('help');
  }

  const { title, file, label, repo } = parsed.value;

  return file === undefined || title === undefined || title.trim() === ''
    ? Result.err('create needs --title <text> and --file <path>')
    : Result.ok({ kind: 'create', title, file, labels: label ?? [], repo });
};
