/**
 * What `startable-issues`'s command line says (`spec/commands.md`,
 * `startable-issues`).
 */

import { Arr, Result } from 'ts-data-forge';
import { parseCommandArgs, positiveInteger } from '../../cli/index.mjs';

export const parseStartableIssuesOptions = (
  args: readonly string[],
): Result<StartableIssuesOptions | 'help', string> => {
  const parsed = parseCommandArgs(args, {
    limit: { type: 'string' },
    author: { type: 'string', multiple: true },
    theme: { type: 'string' },
    by: { type: 'string' },
    repo: { type: 'string' },
  });

  if (Result.isErr(parsed)) {
    return parsed;
  }

  if (parsed.value === 'help') {
    return Result.ok('help');
  }

  const values = parsed.value;

  const limit =
    values.limit === undefined
      ? Result.ok(undefined)
      : positiveInteger('limit', values.limit, 0);

  if (Result.isErr(limit)) {
    return limit;
  }

  const theme = values.theme?.trim();

  if (theme === '') {
    return Result.err('--theme needs a name, such as synstate or ci');
  }

  const authors = Arr.uniq(
    (values.author ?? []).map((login) => login.trim().replace(/^@/u, '')),
  );

  if (authors.includes('')) {
    return Result.err('--author takes a GitHub login, got an empty one');
  }

  // Compared exactly with a claim's claimant, which holds no white space.
  const by = values.by?.trim();

  if (by === '') {
    return Result.err('--by needs a claimant, as given to start-issue --by');
  }

  return Result.ok({
    limit: limit.value,
    authors,
    theme,
    by,
    repo: values.repo,
  });
};

export type StartableIssuesOptions = Readonly<{
  /** How many to list; all of them when `undefined`. */
  limit: number | undefined;
  /** Whose issues it lists; the token's own account when empty. */
  authors: readonly string[];
  /** The theme named; theme by theme when `undefined`. */
  theme: string | undefined;
  /**
   * Who asks, as given to `start-issue --by`: the issues it started hold no
   * theme back. Every started issue does when `undefined`.
   */
  by: string | undefined;
  /** `owner/name`; else `origin`, else the root `package.json`. */
  repo: string | undefined;
}>;

export const STARTABLE_ISSUES_HELP = [
  'Usage: startable-issues [--limit <n>] [--author <login>]... [--theme <name>]',
  '                        [--by <claimant>] [--repo <owner/name>]',
  '',
  'Lists the open issues nobody has started, in the order to take them, and',
  'writes nothing. Which are startable is decided as run-issue-resolver decides',
  'it; the order groups them by theme, the scope a title starts with and the',
  'packages its body names by path, shown in braces on each line.',
  '',
  'With no --theme: every priority:S first, then the highest-tier issue left',
  'and the rest of its theme whatever their tier (D only after a D), then the',
  'next. An issue below priority:S mainly about a theme another session is on',
  'is left out, and named at the end. With --theme: that theme alone (synstate',
  'takes synstate-dom too), its own priority:S first; the issues another',
  'session started in it are named on the first line, not listed, and left to',
  'it, and the rest are listed to take without asking.',
  '',
  'Reads GH_TOKEN, then GITHUB_TOKEN, then `gh auth token`; refused without one.',
  '',
  'Options:',
  '  --limit <n>       list the first n (default: all of them)',
  '  --author <login>  list only issues this account wrote; repeatable',
  '                    (default: the account the token authenticates as)',
  '  --theme <name>    list only the issues of this theme',
  '  --by <claimant>   who is asking, as given to start-issue: a theme only',
  '                    its own started issues are on is not held back',
  '  --repo <o/n>      the repository (default: origin, else package.json)',
  '  -h, --help        show this help',
].join('\n');
