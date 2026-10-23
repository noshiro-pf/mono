/** Which repository this app reads, and how often. */

export type ReportSource = Readonly<{ owner: string; repo: string }>;

/** The repository read when the URL names none. */
export const DEFAULT_REPORT_SOURCE: ReportSource = {
  owner: 'noshiro-pf',
  repo: 'mono',
} as const;

/**
 * The repository the URL names, `?repo=owner/name`, so that the page can be
 * pointed at any repository the token can read and a bookmark keeps it.
 * Without the parameter, or with a value no repository can have, it is
 * {@link DEFAULT_REPORT_SOURCE}: the header names the repository read, so a
 * mistyped one shows as what it is.
 *
 * Read once, as the page opens: changing it is a navigation, not a choice
 * the page makes while it is open.
 */
export const reportSourceFromSearch = (search: string): ReportSource => {
  const params = new URLSearchParams(search);

  const value = params.get(REPO_PARAM);

  const match = value === null ? null : REPO_PATTERN.exec(value);

  const owner = match?.[1];

  const repo = match?.[2];

  return owner === undefined || repo === undefined || /^\.+$/u.test(repo)
    ? DEFAULT_REPORT_SOURCE
    : { owner, repo };
};

/** The repository the report is about. */
export const repositoryUrl = (source: ReportSource): string =>
  `https://github.com/${source.owner}/${source.repo}` as const;

/**
 * How often the page reads GitHub again while it is on screen.
 *
 * **Set by the GraphQL budget.** A read is one query per part of the page
 * and a follow-up, about 9 points against this repository by GitHub's
 * formula, and GraphQL has no conditional request: a read that finds
 * nothing new costs the same as one that finds everything. Every fifteen
 * seconds is 240 reads an hour, about 2,000 of the 5,000 points an account
 * gets — which leaves the rest
 * for everything else that account does with GraphQL, `gh` included.
 *
 * **Refresh** is not bound by this. It reads at once, because a reader who
 * presses it wants now rather than the next tick.
 */
export const POLL_INTERVAL_MS = 15_000;

/**
 * How often "3 minutes ago" is recomputed. Not tied to the poll: a hidden
 * tab stops polling, and the sentence about how old the page is has to keep
 * up with that, or a tab left open reads as fresh forever.
 *
 * Every second, because the ages count seconds, and because a tick costs a
 * text node per age rather than a render: they are signals (`age.tsx`).
 */
export const CLOCK_TICK_MS = 1000;

const REPO_PARAM = 'repo';

/**
 * GitHub's own rules: an account name is letters, digits and single hyphens,
 * not starting with one, and a repository name letters, digits, `.`, `-` and
 * `_` (but not `.` or `..` alone).
 */
const REPO_PATTERN =
  /^([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))\/([A-Za-z0-9._-]{1,100})$/u;
