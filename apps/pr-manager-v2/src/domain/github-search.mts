import { type Repo, repoUrl } from './repo.mjs';

/**
 * A search of the repository's pull requests (`pulls`) or issues (`issues`) on
 * GitHub, with `query` as written into its search box.
 */
export const githubSearchUrl = (
  repo: Repo,
  list: 'issues' | 'pulls',
  query: string,
): string => {
  const params = new URLSearchParams({ q: query });

  return `${repoUrl(repo)}/${list}?${params.toString()}` as const;
};

/** `label:"a","b"`: any of the labels, as GitHub's search reads a list. */
export const anyLabelQualifier = (names: readonly string[]): string =>
  `label:${names.map(quoted).join(',')}` as const;

/** `-label:"a"`: without the label. */
export const notLabelQualifier = (name: string): string =>
  `-label:${quoted(name)}` as const;

/** The repository's Actions tab, filtered by `query`. */
export const actionsUrl = (repo: Repo, query: string): string => {
  const params = new URLSearchParams({ query });

  return `${repoUrl(repo)}/actions?${params.toString()}` as const;
};

/**
 * The pull requests merged since the day `days` before `nowMs` (UTC): a day is
 * as fine as GitHub's search goes, so it may list a few merged earlier that day.
 */
export const mergedSinceQuery = (nowMs: number, days: number): string => {
  const start = new Date(nowMs - days * DAY_MS);

  const since = start.toISOString().slice(0, 10);

  return `is:pr is:merged merged:>=${since} sort:updated-desc` as const;
};

/** A label quoted for a qualifier; a `"` cannot be escaped there, so it goes. */
const quoted = (name: string): string =>
  `"${name.replaceAll('"', '')}"` as const;

const DAY_MS = 24 * 60 * 60 * 1000;
