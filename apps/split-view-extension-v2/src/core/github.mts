import { claudeSessionTrailersOf } from 'split-view-link';
import { Num, Result } from 'ts-data-forge';
import { nonEmpty, parseUrl } from './fields.mjs';

/** A pull request on github.com, by its conversation's address. */
export type PullRequest = Readonly<{
  number: number;
  /** `https://github.com/<owner>/<repo>/pull/<number>` */
  url: string;
}>;

/**
 * The pull request an address is at or below, rebuilt from its parts so that no
 * query or fragment comes along; `undefined` for any other address.
 */
export const pullRequestOf = (address: string): PullRequest | undefined => {
  const item = repositoryItemOf(address, 'pull');

  return item === undefined
    ? undefined
    : {
        number: Result.unwrapOkOr(Num.safeParseInt(item.number), Number.NaN),
        url: item.url,
      };
};

/** An issue's address without query or fragment, or `undefined`. */
export const issueUrlOf = (address: string): string | undefined =>
  repositoryItemOf(address, 'issues')?.url;

/**
 * The title in GitHub's tab title for a pull request,
 * `<title> by <author> · Pull Request #<n> · <owner>/<repo> · GitHub`, with a
 * `#<n> ` prefix (which `github-view-defaults-extension` adds) taken off.
 */
export const pullRequestTitleOf = (
  documentTitle: string,
): string | undefined => {
  const segments = documentTitle.split(separator);

  // Counted from the end: the title may hold a `·` of its own.
  const fromEnd = segments.at(-1) === 'GitHub' ? 3 : 2;

  const label = segments.at(-fromEnd);

  if (label === undefined || !/^Pull Request #\d+$/u.test(label)) {
    return undefined;
  }

  const titleAndAuthor = segments.slice(0, -fromEnd).join(separator);

  const by = titleAndAuthor.lastIndexOf(' by ');

  if (by <= 0) {
    return undefined;
  }

  const title = titleAndAuthor.slice(0, by).replace(/^#\d+ /u, '');

  return nonEmpty(title);
};

/** The first Claude Code session a description names, as the PR Manager reads it. */
export const claudeSessionUrlOfBody = (body: string): string | undefined =>
  claudeSessionTrailersOf(body)[0]?.url;

/**
 * The saved split view every pull request opened from GitHub reuses (spec G3);
 * not the PR Manager's, so the two do not overwrite each other.
 */
export const pullRequestWorkspace = {
  id: 'github-pull-request',
  name: 'GitHub pull request',
} as const;

export const pullRequestUrlPattern = 'https://github.com/*/*/pull/*';

const separator = ' · ';

const repositoryItemOf = (
  address: string,
  kind: 'issues' | 'pull',
): Readonly<{ url: string; number: string }> | undefined => {
  const url = parseUrl(address);

  if (url === undefined) {
    return undefined;
  }

  const { protocol, host, pathname } = url;

  if (protocol !== 'https:' || host !== 'github.com') {
    return undefined;
  }

  const [empty, owner, repo, itemKind, number] = pathname.split('/', 5);

  return empty === '' &&
    itemKind === kind &&
    owner !== undefined &&
    repo !== undefined &&
    number !== undefined &&
    /^[a-z\d-]+$/iu.test(owner) &&
    /^[\w.-]+$/u.test(repo) &&
    /^\d+$/u.test(number)
    ? { url: `https://github.com/${owner}/${repo}/${kind}/${number}`, number }
    : undefined;
};
