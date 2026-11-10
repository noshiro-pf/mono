import { searchOf } from './url/index.mjs';

/** The repository the page reads. */
export type Repo = Readonly<{ owner: string; name: string }>;

/**
 * The repository `?repo=` names, or `undefined` without one or for a value no
 * repository can have — the page then asks rather than picking one, so that
 * nobody lands on a repository they did not choose. Read once as the page
 * opens: a different repository is a different visit.
 */
export const repoFromSearch = (search: string): Repo | undefined => {
  const value = repoParam(search);

  return value === undefined ? undefined : parseRepo(value);
};

/** `?repo=` as written, whether or not it names a repository. */
export const repoParam = (search: string): string | undefined => {
  const params = new URLSearchParams(search);

  return params.get(REPO_KEY) ?? undefined;
};

/**
 * A repository named as a reader would: `owner/name`, or its address on
 * github.com with or without the scheme, `www.`, a page after the name, a
 * query, a fragment or `.git`. Anything else, another host included, is
 * `undefined`: the page reads `api.github.com` alone.
 */
export const parseRepo = (value: string): Repo | undefined => {
  const trimmed = value.trim();

  const match = REPO_PATTERN.exec(ownerSlashNameOfUrl(trimmed) ?? trimmed);

  const owner = match?.[1];

  const name = match?.[2];

  return owner === undefined || name === undefined || /^\.+$/u.test(name)
    ? undefined
    : { owner, name };
};

/** `search` naming `repo`, every other parameter kept. */
export const searchWithRepo = (search: string, repo: Repo): string => {
  const params = new URLSearchParams(search);

  params.set(REPO_KEY, repoSlug(repo));

  return searchOf(params);
};

/** `owner/name`. */
export const repoSlug = (repo: Repo): string =>
  `${repo.owner}/${repo.name}` as const;

/** The repository's page on GitHub. */
export const repoUrl = (repo: Repo): string =>
  `https://github.com/${repoSlug(repo)}` as const;

const REPO_KEY = 'repo';

/**
 * GitHub's rules: an account is letters, digits and hyphens, not starting with
 * one; a repository letters, digits, `.`, `-` and `_`, but not dots alone.
 */
const REPO_PATTERN =
  /^([A-Za-z0-9][A-Za-z0-9-]{0,38})\/([A-Za-z0-9._-]{1,100})$/u;

const ownerSlashNameOfUrl = (value: string): string | undefined => {
  const address = value.replace(/^https?:\/\//iu, '').replace(/^www\./iu, '');

  if (!address.toLowerCase().startsWith('github.com/')) {
    return undefined;
  }

  const [owner, name] = (URL.parse(`https://${address}`)?.pathname ?? '')
    .split('/')
    .filter((segment) => segment !== '');

  return owner === undefined || name === undefined
    ? undefined
    : `${owner}/${name.replace(/\.git$/u, '')}`;
};
