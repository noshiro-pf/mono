import { claudeSessionTrailersOf } from 'split-view-link';
import { Num, Result } from 'ts-data-forge';

/**
 * A pull request on github.com, by its conversation tab's address.
 *
 * The address is rebuilt from the parts rather than cut out of the input, so
 * that a query or a fragment on the input cannot come along.
 */
export type PullRequest = Readonly<{
  number: number;
  /** `https://github.com/<owner>/<repo>/pull/<number>` */
  url: string;
}>;

/**
 * The pull request an address is on — its conversation, its diff, one of its
 * commits, any tab below `/pull/<number>` — or `undefined` for any other page.
 */
export const pullRequestOf = (address: string): PullRequest | undefined => {
  const item = repositoryItemOf(address, 'pull');

  return item === undefined
    ? undefined
    : {
        number: Result.unwrapOkOr(Num.safeParseFloat(item.number), Number.NaN),
        url: item.url,
      };
};

/**
 * An issue's address, without its query or fragment, or `undefined` when the
 * link is to anything else — which is what is checked of a link read off a page
 * before a pane is pointed at it.
 */
export const issueUrlOf = (address: string): string | undefined =>
  repositoryItemOf(address, 'issues')?.url;

/**
 * The title of a pull request, out of GitHub's tab title for any of its tabs:
 * `<title> by <author> · Pull Request #<number> · <owner>/<repo> · GitHub`.
 *
 * The author is the last ` by ` before the `·`, so a title with a ` by ` of its
 * own keeps it. A `#<number> ` in front, which `github-view-defaults-extension`
 * puts there, is taken off. Any other shape is `undefined`, and the tab is then
 * titled with the number alone.
 */
export const pullRequestTitleOf = (
  documentTitle: string,
): string | undefined => {
  const segments = documentTitle.split(titleSeparator);

  // The title may have a `·` of its own, so the segments are counted from the
  // end: `Pull Request #<number>`, `<owner>/<repo>`, and `GitHub` when there.
  const fromEnd = segments.at(-1) === 'GitHub' ? 3 : 2;

  const label = segments.at(-fromEnd);

  if (label === undefined || !pullRequestLabelPattern.test(label)) {
    return undefined;
  }

  const titleAndAuthor = segments.slice(0, -fromEnd).join(titleSeparator);

  const by = titleAndAuthor.lastIndexOf(' by ');

  if (by <= 0) {
    return undefined;
  }

  const title = titleAndAuthor.slice(0, by).replace(numberPrefixPattern, '');

  return title === '' ? undefined : title;
};

/**
 * The first Claude Code session a pull request's description names, as the PR
 * Manager reads it: `claudeSessionTrailersOf` of `split-view-link`.
 *
 * The description is read off GitHub's rendering of it, with each link written
 * back as `[<text>](<href>)` — a bare URL is rendered as a link to itself — and
 * the code blocks left out, which is where the PR Manager does not look either.
 */
export const claudeSessionUrlOfBody = (body: string): string | undefined =>
  claudeSessionTrailersOf(body)[0]?.url;

/**
 * The saved split view a pull request opened from GitHub reuses, rather than
 * adding one to the list each time. It is not the PR Manager's `pr-manager`, so
 * the two do not overwrite each other. What it is opened with is
 * `pullRequestSplitViewSearch`'s.
 */
export const pullRequestWorkspace = {
  id: 'github-pull-request',
  name: 'GitHub pull request',
} as const;

/**
 * `https://github.com/<owner>/<repo>/<kind>/<number>` and its number, for an
 * address at or below that path, and `undefined` for any other. The host is
 * compared whole, so `github.com.example.com` and `gist.github.com` are
 * elsewhere.
 */
const repositoryItemOf = (
  address: string,
  kind: 'issues' | 'pull',
): Readonly<{ url: string; number: string }> | undefined => {
  if (!URL.canParse(address)) {
    return undefined;
  }

  const { protocol, host, pathname } = new URL(address);

  if (protocol !== 'https:' || host !== 'github.com') {
    return undefined;
  }

  const [empty, owner, repo, itemKind, number] = pathname.split('/', 5);

  return empty === '' &&
    itemKind === kind &&
    owner !== undefined &&
    repo !== undefined &&
    number !== undefined &&
    ownerPattern.test(owner) &&
    repoPattern.test(repo) &&
    numberPattern.test(number)
    ? { url: `https://github.com/${owner}/${repo}/${kind}/${number}`, number }
    : undefined;
};

/** An owner is letters, digits and hyphens. */
const ownerPattern = /^[a-z\d-]+$/iu;

/** A repository name may also have dots and underscores. */
const repoPattern = /^[\w.-]+$/u;

const numberPattern = /^\d+$/u;

const titleSeparator = ' · ';

const pullRequestLabelPattern = /^Pull Request #\d+$/u;

/** What `github-view-defaults-extension` puts in front of the title. */
const numberPrefixPattern = /^#\d+ /u;
