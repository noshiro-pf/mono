/**
 * Who `.github/CODEOWNERS` says owns a path.
 *
 * Read because GitHub will not say. A pull request touching an owned path waits
 * for an owner to approve it — under a ruleset's `require_code_owner_review`,
 * or under a required check that enforces the file instead
 * ({@link codeOwnersEnforcedBy}) — and nothing on a pull request reports that
 * wait: `reviewDecision` answers `null` for every pull request here, owned
 * paths or not, because it describes branch protection rather than a ruleset.
 * So it is worked out the way GitHub does, from the file — by the
 * Pull Requests Manager page, to show the wait, and by `unblock-prs`, to leave
 * a pull request that waits in the queue rather than run its checks.
 *
 * The patterns are the subset of `.gitignore` syntax GitHub documents for this
 * file: a leading `/` or a `/` in the middle anchors a pattern to the root, a
 * trailing `/` makes it a directory, `*` and `?` stay inside one path segment
 * and `**` crosses them. Negation and character ranges are not supported by
 * GitHub here either.
 */

import { Arr } from 'ts-data-forge';

export type CodeOwnersRule = Readonly<{
  pattern: string;
  /**
   * Without the leading `@`. Empty for a pattern that clears the owners of what
   * an earlier line matched.
   */
  owners: readonly string[];
}>;

export const parseCodeOwners = (text: string): readonly CodeOwnersRule[] =>
  Arr.generate(function* () {
    for (const line of text.split('\n')) {
      const [pattern, ...owners] = stripComment(line).trim().split(/\s+/u);

      if (pattern !== undefined && pattern !== '') {
        yield {
          pattern,
          owners: owners.map((owner) =>
            owner.startsWith('@') ? owner.slice(1) : owner,
          ),
        };
      }
    }
  });

/**
 * The required check a `CODEOWNERS` file says enforces it, from a comment line
 * `# enforced-by: <context>` in the file's head — the comments before its first
 * rule — or `undefined` when the head names none. A comment further down
 * explains a rule and declares nothing.
 *
 * A ruleset's `require_code_owner_review` cannot tell an author from anyone
 * else, and GitHub does not let an author approve their own pull request, so a
 * path its only owner changes merges by a ruleset bypass or not at all. A
 * repository can turn that rule off and have a required check enforce the file
 * instead, counting the author as approving what they own; this line is how it
 * says so, in the file the check reads. It is believed only where the ruleset
 * really requires that check ({@link codeOwnerGate}).
 */
export const codeOwnersEnforcedBy = (text: string): string | undefined => {
  const lines = text.split('\n');

  const firstRule = lines.findIndex((line) => stripComment(line).trim() !== '');

  return (firstRule === -1 ? lines : lines.slice(0, firstRule))
    .map(enforcedByOfLine)
    .find((context) => context !== undefined);
};

/**
 * What enforces code-owner review on the default branch: the ruleset's own
 * rule, a required check that `CODEOWNERS` names ({@link codeOwnersEnforcedBy}),
 * or nothing. The ruleset's rule wins when both are there, since the check
 * cannot satisfy it for an author.
 */
export const codeOwnerGate = (
  requirements: Readonly<{
    requireCodeOwnerReview: boolean;
    requiredContexts: readonly string[];
  }>,
  enforcedBy: string | undefined,
): CodeOwnerGate =>
  requirements.requireCodeOwnerReview
    ? 'ruleset'
    : enforcedBy !== undefined &&
        requirements.requiredContexts.includes(enforcedBy)
      ? 'check'
      : undefined;

/**
 * Whether GraphQL's changed files name every path a pull request changes, as
 * far as `nodes` go: a renamed or copied file's old path is a changed path too
 * — REST's `previous_filename`, which a check that enforces `CODEOWNERS` counts
 * — and `files` names only the new one. A reader passes `false` for
 * `filesComplete` where this is.
 */
export const namesEveryChangedPath = (
  nodes: readonly Readonly<{ changeType: string }>[],
): boolean =>
  nodes.every(
    ({ changeType }) => changeType !== 'RENAMED' && changeType !== 'COPIED',
  );

/**
 * Who pushed to a branch whose head is `head`, from the repository's activity
 * on it (`GET /repos/{owner}/{repo}/activity?ref=refs/heads/<branch>`, oldest
 * first) — the one place GitHub names each push's actor; a pull request's
 * timeline does not. Every push since the branch was last created, chained
 * `before` to `after` and ending at `head`, or `'unknown'`: a gap, a push with
 * no actor, a creation older than the activity GitHub keeps, or a push not
 * recorded yet. `codeOwnerReview`'s `pushers`, and what the check that enforces
 * `CODEOWNERS` in this repository reads the same way.
 */
export const pushersOf = (
  activities: readonly BranchActivity[],
  head: string,
): readonly string[] | 'unknown' => {
  const { chain, pushers } = activities.reduce(followPush, NO_BRANCH);

  return chain === head && Arr.isNonEmpty(pushers)
    ? Arr.uniq(pushers)
    : 'unknown';
};

/** One entry of a branch's activity, as {@link pushersOf} reads it. */
export type BranchActivity = Readonly<{
  activityType: string;
  before: string;
  after: string;
  /** The login of whoever did it, `undefined` for a deleted account. */
  actor: string | undefined;
}>;

/**
 * The owners of one path: those of the **last** pattern that matches it, which
 * is how GitHub reads the file — a later line overrides an earlier one rather
 * than adding to it.
 */
export const ownersOf = (
  path: string,
  rules: readonly CodeOwnersRule[],
): readonly string[] =>
  rules.findLast((rule) => toRegExp(rule.pattern).test(path))?.owners ?? [];

/**
 * What GitHub would say, worked out the way GitHub does: every changed path
 * that has owners needs an approval from one of them. An approval is the latest
 * review of an owner that says so; one dismissed by a later push — the ruleset
 * dismisses stale approvals — no longer counts, and GitHub has already stopped
 * calling it an approval by the time this reads it.
 *
 * Owners are compared by login, case-insensitively, as GitHub compares them. A
 * team owner (`@org/team`) cannot be: telling who is on the team takes
 * `read:org`, which neither reader asks for. So a path a team owns waits while
 * nobody at all has approved, is approved by a person owning it beside the
 * team, and otherwise — someone approved, and might be on the team — cannot be
 * told, which makes the whole `unknown` unless another path is plainly still
 * waiting. `CODEOWNERS` in this repository names no team.
 */
export const codeOwnerReview = ({
  required,
  rules,
  files,
  filesComplete,
  approvers,
  author,
  authorApproves = false,
  pushers,
}: Readonly<{
  /** Whether code-owner review is asked for at all. */
  required: boolean;
  rules: readonly CodeOwnersRule[];
  files: readonly string[];
  /** Whether `files` is every file the pull request changes. */
  filesComplete: boolean;
  /** Logins whose latest review approves. */
  approvers: readonly string[];
  author: string;
  /**
   * Whether the author counts as approving the paths they own: so where a check
   * enforces the file ({@link codeOwnerGate} is `'check'`), and not under the
   * ruleset's rule.
   */
  authorApproves?: boolean;
  /**
   * Who pushed to the pull request's branch, or `'unknown'` where that cannot
   * be told. With `authorApproves`, the author stands for a path they own only
   * where everyone who pushed owns it too: a commit someone else pushed to the
   * author's branch is not the author's to vouch for. Absent, the author alone
   * is taken to have written it, for a reader that does not ask.
   */
  pushers?: readonly string[] | 'unknown';
}>): CodeOwnerReview => {
  if (!required) {
    return { state: 'not-required' };
  }

  const approved = new Set(approvers.map((login) => login.toLowerCase()));

  const authorLogin = author.toLowerCase();

  // Whether the author's ownership of a path counts as its approval.
  const authorStands = (owners: readonly string[]): boolean => {
    if (!authorApproves) {
      return false;
    }

    const owning = new Set(owners.map((owner) => owner.toLowerCase()));

    return (
      owning.has(authorLogin) &&
      (pushers === undefined ||
        (pushers !== 'unknown' &&
          pushers.every((login) => owning.has(login.toLowerCase()))))
    );
  };

  // The author is applied path by path rather than added to `approved`: an
  // approver there is someone a team might count, and the author has approved
  // nothing.
  const unapproved = Arr.generate(function* () {
    for (const path of files) {
      const owners = ownersOf(path, rules);

      if (
        Arr.isNonEmpty(owners) &&
        owners.every((owner) => !approved.has(owner.toLowerCase())) &&
        !authorStands(owners)
      ) {
        yield { path, owners };
      }
    }
  });

  // An approval by someone not named might be a team member's.
  const waiting = unapproved.filter(
    ({ owners }) => approved.size === 0 || !owners.some(isTeam),
  );

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

  // A path past those read waits only on a rule nobody has satisfied, so where
  // every rule is satisfied already the unread paths change nothing.
  if (
    !filesComplete &&
    rules.some(
      ({ owners }) =>
        Arr.isNonEmpty(owners) &&
        !authorStands(owners) &&
        owners.every(
          (owner) => isTeam(owner) || !approved.has(owner.toLowerCase()),
        ),
    )
  ) {
    return { state: 'unknown' };
  }

  if (Arr.isNonEmpty(unapproved)) {
    return {
      state: 'unknown',
      teams: Arr.uniq(
        unapproved.flatMap(({ owners }) => owners.filter(isTeam)),
      ),
    };
  }

  const owned = files.some((path) => Arr.isNonEmpty(ownersOf(path, rules)));

  return owned ? { state: 'approved' } : { state: 'not-required' };
};

const ENFORCED_BY = 'enforced-by:';

/** A chain {@link pushersOf} has lost; no head is ever this. */
const UNTOLD = 'untold';

/** Where {@link pushersOf} is in the activity: the head so far, and who. */
type PushChain = Readonly<{
  chain: string | undefined;
  pushers: readonly string[];
}>;

const NO_BRANCH: PushChain = { chain: undefined, pushers: [] } as const;

const followPush = (
  { chain, pushers }: PushChain,
  { activityType, before, after, actor }: BranchActivity,
): PushChain =>
  activityType === 'branch_creation'
    ? actor === undefined
      ? ({ chain: UNTOLD, pushers: [] } as const)
      : ({ chain: after, pushers: [actor] } as const)
    : activityType === 'branch_deletion'
      ? NO_BRANCH
      : activityType === 'push' || activityType === 'force_push'
        ? chain !== undefined && before === chain && actor !== undefined
          ? ({ chain: after, pushers: Arr.toPushed(pushers, actor) } as const)
          : ({ chain: UNTOLD, pushers } as const)
        : ({ chain, pushers } as const);

export type CodeOwnerGate = 'check' | 'ruleset' | undefined;

const enforcedByOfLine = (line: string): string | undefined => {
  const trimmed = line.trim();

  if (!trimmed.startsWith('#')) {
    return undefined;
  }

  const comment = trimmed.slice(1).trimStart();

  if (!comment.startsWith(ENFORCED_BY)) {
    return undefined;
  }

  const context = comment.slice(ENFORCED_BY.length).trim();

  return context === '' ? undefined : context;
};

const stripComment = (line: string): string => {
  const at = line.indexOf('#');

  return at === -1 ? line : line.slice(0, at);
};

// Not `RegExp.escape`: it arrived in Node 24, and `ws:check:test` also runs on
// the `engines.node` floor (`test-node-versions (minimum)`), which is 22.
// Under the `u` flag only the syntax characters and `/` may be escaped, and
// everything else is a literal as it stands.
const escapeChar = (char: string): string =>
  String.raw`^$\.*+?()[]{}|/`.includes(char) ? (`\\${char}` as const) : char;

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

const toRegExp = (pattern: string): RegExp => {
  const directory = pattern.endsWith('/');

  const trimmed = pattern.replaceAll(/^\/|\/$/gu, '');

  // `.gitignore`'s rule: a slash anywhere but at the end ties the pattern to
  // the root, and a pattern without one may match at any depth.
  const anchored = pattern.startsWith('/') || trimmed.includes('/');

  const body = globToRegExpSource(trimmed);

  // A directory owns what is under it and never matches as a file. A name with
  // no trailing slash may be either, so it matches itself and what is under it
  // — unless its last segment is a wildcard, which GitHub reads as files at
  // that level only: `docs/*` owns `docs/a.md` and not `docs/build/a.md`.
  const tail = directory
    ? '/.+'
    : (trimmed.split('/').at(-1) ?? '').includes('*')
      ? ''
      : '(?:/.+)?';

  // eslint-disable-next-line security/detect-non-literal-regexp
  return new RegExp(`^${anchored ? '' : '(?:.+/)?'}${body}${tail}$`, 'u');
};

/**
 * Where a pull request stands with the code owners.
 *
 * `required` lists what is still waiting — the owned paths no owner has
 * approved yet, and who could approve them. `authorOwns` is the case that waits
 * for ever: GitHub does not let an author approve their own pull request, so
 * when the author is the only owner nothing but a ruleset bypass will merge it.
 * `unknown` is a pull request whose changed files were more than could be read,
 * where the unread ones might be owned — or, with `teams`, one approved by
 * someone these teams might have as a member.
 */
export type CodeOwnerReview = Readonly<
  | { state: 'approved' }
  | { state: 'not-required' }
  | { state: 'unknown'; teams?: readonly string[] }
  | {
      state: 'required';
      paths: readonly string[];
      owners: readonly string[];
      authorOwns: boolean;
    }
>;

/** `org/team`, as opposed to a person's login or an email address. */
const isTeam = (owner: string): boolean => owner.includes('/');
