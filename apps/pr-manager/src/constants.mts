/** Which repository this app reads, and how often. */

import { searchOf } from './url.mjs';

export type ReportSource = Readonly<{ owner: string; repo: string }>;

/**
 * The repository the URL names, `?repo=owner/name`, so that the page can be
 * pointed at any repository the token can read and a bookmark keeps it.
 * `undefined` without the parameter, or with a value no repository can have:
 * the page then asks which repository to read rather than picking one, so
 * that nobody lands on a repository they did not choose. The value is read
 * as the form's field reads what is typed into it ({@link parseRepository}).
 *
 * Read once, as the page opens: changing it is a navigation, not a choice
 * the page makes while it is open — which is also what keeps an answer about
 * one repository from landing on the page of another.
 */
export const reportSourceFromSearch = (
  search: string,
): ReportSource | undefined => {
  const value = repositoryParam(search);

  return value === undefined ? undefined : parseRepository(value);
};

/** `?repo=` as it is written, whether or not it names a repository. */
export const repositoryParam = (search: string): string | undefined => {
  const params = new URLSearchParams(search);

  return params.get(REPO_PARAM) ?? undefined;
};

/**
 * A repository named the way a reader would name one: `owner/name`, or its
 * address on github.com as the address bar has it — with a page after the
 * name, a query, a fragment or `.git` — so that what was copied from a tab
 * can be pasted as it is. `undefined` for anything else, a host other than
 * github.com included: this page reads `api.github.com` alone.
 */
export const parseRepository = (value: string): ReportSource | undefined => {
  const trimmed = value.trim();

  const match = REPO_PATTERN.exec(fromGitHubUrl(trimmed) ?? trimmed);

  const owner = match?.[1];

  const repo = match?.[2];

  return owner === undefined || repo === undefined || /^\.+$/u.test(repo)
    ? undefined
    : { owner, repo };
};

/**
 * `search` with `repo` naming `source`, the rest kept as it is, so that the
 * layout, the theme and what the page shows go along to the other
 * repository.
 */
export const searchWithRepository = (
  search: string,
  source: ReportSource,
): string => {
  const params = new URLSearchParams(search);

  params.set(REPO_PARAM, `${source.owner}/${source.repo}`);

  // Spelt as every other writer spells it, `repo=owner/name` included.
  return searchOf(params);
};

/** The repository the report is about. */
export const repositoryUrl = (source: ReportSource): string =>
  `https://github.com/${source.owner}/${source.repo}` as const;

/**
 * How often the page reads GitHub again while it is on screen, at most: a
 * repository whose reads cost more is read less often (`pollIntervalFor`).
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

/**
 * `owner/name` out of an address on github.com — with or without the scheme
 * and `www.`, and with whatever follows the name — or `undefined` for what is
 * not one.
 */
const fromGitHubUrl = (value: string): string | undefined => {
  const address = value.replace(/^https?:\/\//iu, '').replace(/^www\./iu, '');

  // The host is any case; the names keep theirs, as the header shows them.
  if (!address.toLowerCase().startsWith('github.com/')) {
    return undefined;
  }

  const url = URL.parse(`https://${address}`);

  const [owner, name] = (url?.pathname ?? '')
    .split('/')
    .filter((segment) => segment !== '');

  return owner === undefined || name === undefined
    ? undefined
    : `${owner}/${name.replace(/\.git$/u, '')}`;
};
