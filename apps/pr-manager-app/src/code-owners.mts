/**
 * Who `.github/CODEOWNERS` says owns a path.
 *
 * Read because GitHub will not say. `main`'s ruleset has
 * `require_code_owner_review` on, so a pull request touching an owned path
 * waits for an owner to approve it — and nothing on a pull request reports
 * that wait: `reviewDecision` answers `null` for every pull request here,
 * owned paths or not, because it describes branch protection rather than a
 * ruleset. So the page works it out the way GitHub does, from the file.
 *
 * The patterns are the subset of `.gitignore` syntax GitHub documents for
 * this file: a leading `/` or a `/` in the middle anchors a pattern to the
 * root, a trailing `/` makes it a directory, `*` and `?` stay inside one path
 * segment and `**` crosses them. Negation and character ranges are not
 * supported by GitHub here either.
 */

import { Arr } from 'ts-data-forge';

export type CodeOwnersRule = Readonly<{
  pattern: string;
  /**
   * Without the leading `@`. Empty for a pattern that clears the owners of
   * what an earlier line matched.
   */
  owners: readonly string[];
}>;

export const parseCodeOwners = (text: string): readonly CodeOwnersRule[] =>
  text.split('\n').flatMap((line) => {
    const [pattern, ...owners] = stripComment(line).trim().split(/\s+/u);

    return pattern === undefined || pattern === ''
      ? []
      : [
          {
            pattern,
            owners: owners.map((owner) =>
              owner.startsWith('@') ? owner.slice(1) : owner,
            ),
          },
        ];
  });

/**
 * The owners of one path: those of the **last** pattern that matches it,
 * which is how GitHub reads the file — a later line overrides an earlier one
 * rather than adding to it.
 */
export const ownersOf = (
  path: string,
  rules: readonly CodeOwnersRule[],
): readonly string[] =>
  rules.findLast((rule) => toRegExp(rule.pattern).test(path))?.owners ?? [];

const stripComment = (line: string): string => {
  const at = line.indexOf('#');

  return at === -1 ? line : line.slice(0, at);
};

const toRegExp = (pattern: string): RegExp => {
  const directory = pattern.endsWith('/');

  const trimmed = pattern.replaceAll(/^\/|\/$/gu, '');

  // `.gitignore`'s rule: a slash anywhere but at the end ties the pattern to
  // the root, and a pattern without one may match at any depth.
  const anchored = pattern.startsWith('/') || trimmed.includes('/');

  const body = globToRegExpSource(trimmed);

  // A directory owns what is under it and never matches as a file. A name
  // with no trailing slash may be either, so it matches itself and what is
  // under it — unless its last segment is a wildcard, which GitHub reads as
  // files at that level only: `docs/*` owns `docs/a.md` and not
  // `docs/build/a.md`.
  const tail = directory
    ? '/.+'
    : (trimmed.split('/').at(-1) ?? '').includes('*')
      ? ''
      : '(?:/.+)?';

  // eslint-disable-next-line security/detect-non-literal-regexp
  return new RegExp(`^${anchored ? '' : '(?:.+/)?'}${body}${tail}$`, 'u');
};

const globToRegExpSource = (glob: string): string =>
  glob
    .split('/')
    .map((segment, index, segments) =>
      segment === '**'
        ? // `a/**/b` is `a/b` as well as `a/x/y/b`, so the separator that
          // follows is part of what `**` may leave out.
          index === segments.length - 1
          ? '.*'
          : '(?:.*/)?'
        : `${segment
            .split('')
            .map((char) =>
              char === '*' ? '[^/]*' : char === '?' ? '[^/]' : escapeChar(char),
            )
            .join('')}${index === segments.length - 1 ? '' : '/'}`,
    )
    .join('');

// Not `RegExp.escape`: it arrived in Node 24, and `ws:check:test` also runs
// on the `engines.node` floor (`test-node-versions (minimum)`), which is 22.
// Under the `u` flag only the syntax characters and `/` may be escaped, and
// everything else is a literal as it stands.
const escapeChar = (char: string): string =>
  String.raw`^$\.*+?()[]{}|/`.includes(char) ? (`\\${char}` as const) : char;

/**
 * Where a pull request stands with the code owners.
 *
 * `required` lists what is still waiting — the owned paths no owner has
 * approved yet, and who could approve them. `authorOwns` is the case that
 * waits for ever: GitHub does not let an author approve their own pull
 * request, so when the author is the only owner nothing but a ruleset bypass
 * will merge it. `unknown` is a pull request whose changed files were more
 * than could be read, where the unread ones might be owned.
 */
export type CodeOwnerReview = Readonly<
  | { state: 'approved' }
  | { state: 'not-required' }
  | { state: 'unknown' }
  | {
      state: 'required';
      paths: readonly string[];
      owners: readonly string[];
      authorOwns: boolean;
    }
>;

/**
 * What GitHub would say, worked out the way GitHub does: every changed path
 * that has owners needs an approval from one of them. An approval is the
 * latest review of an owner that says so; one dismissed by a later push —
 * the ruleset dismisses stale approvals — no longer counts, and GitHub has
 * already stopped calling it an approval by the time this reads it.
 *
 * Owners are compared by login, case-insensitively, as GitHub compares
 * them. A team owner (`@org/team`) is never matched by one person's
 * approval here, because telling who is on the team takes a permission this
 * page does not ask for; `CODEOWNERS` in this repository names no team.
 */
export const codeOwnerReview = ({
  required,
  rules,
  files,
  filesComplete,
  approvers,
  author,
}: Readonly<{
  /** Whether the ruleset asks for code-owner review at all. */
  required: boolean;
  rules: readonly CodeOwnersRule[];
  files: readonly string[];
  /** Whether `files` is every file the pull request changes. */
  filesComplete: boolean;
  /** Logins whose latest review approves. */
  approvers: readonly string[];
  author: string;
}>): CodeOwnerReview => {
  if (!required) return { state: 'not-required' };

  const approved = new Set(approvers.map((login) => login.toLowerCase()));

  const waiting = files.flatMap((path) => {
    const owners = ownersOf(path, rules);

    return Arr.isNonEmpty(owners) &&
      owners.every((owner) => !approved.has(owner.toLowerCase()))
      ? [{ path, owners }]
      : [];
  });

  if (Arr.isNonEmpty(waiting)) {
    const owners = Arr.uniq(waiting.flatMap((file) => file.owners));

    return {
      state: 'required',
      paths: waiting.map(({ path }) => path),
      owners,
      authorOwns: owners.some(
        (owner) => owner.toLowerCase() === author.toLowerCase(),
      ),
    };
  }

  if (!filesComplete) return { state: 'unknown' };

  const owned = files.some((path) => Arr.isNonEmpty(ownersOf(path, rules)));

  return owned ? { state: 'approved' } : { state: 'not-required' };
};
