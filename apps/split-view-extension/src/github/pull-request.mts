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
 * An issue's address, without its query or fragment, or `undefined` when
 * the link is to anything else — which is what is checked of a link read off
 * a page before a pane is pointed at it.
 */
export const issueUrlOf = (address: string): string | undefined =>
  repositoryItemOf(address, 'issues')?.url;

/**
 * The title of a pull request, out of GitHub's tab title for any of its tabs:
 * `<title> by <author> · Pull Request #<number> · <owner>/<repo> · GitHub`.
 *
 * The author is the last ` by ` before the `·`, so a title with a ` by ` of
 * its own keeps it. A `#<number> ` in front, which `github-view-defaults-extension`
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
 * The query string of `split.html` that opens a pull request as the PR
 * Manager's links do: the diff, without whitespace changes or the files
 * already viewed, beside the conversation at 7:3, and when the pull request
 * closes an issue, the right half shared with it at 1:1.
 *
 * Beside the diff alone, the conversation is at 100%, as the diff is: its 30%
 * is wide enough to read at full size. Shared with the issue, each has 15%,
 * and both are at 75% so that more of each fits.
 *
 * Every pull request opened this way reuses one saved split view,
 * `github-pull-request`, rather than adding one to the list each time. It is
 * not the PR Manager's `pr-manager`, so the two do not overwrite each other.
 *
 * Escaped as a form is, one pair at a time because `url` repeats; the page
 * writes the readable form back into its address bar once it has loaded.
 */
export const pullRequestSplitViewSearch = ({
  pullRequest,
  title,
  issueUrl,
}: Readonly<{
  pullRequest: PullRequest;
  title: string | undefined;
  issueUrl: string | undefined;
}>): string => {
  const diff = {
    url: `${pullRequest.url}/files?${diffQuery}`,
    zoom: full,
  } as const;

  const { layout, panes } =
    issueUrl === undefined
      ? ({
          layout: 'r70pp',
          panes: [diff, { url: pullRequest.url, zoom: full }],
        } as const)
      : ({
          layout: 'rprpp',
          panes: [
            diff,
            { url: pullRequest.url, zoom: narrow },
            { url: issueUrl, zoom: narrow },
          ],
        } as const);

  const params = [
    ['ws', workspaceId],
    ['name', workspaceName],
    [
      'title',
      title === undefined
        ? (`#${pullRequest.number}` as const)
        : (`#${pullRequest.number} ${title}` as const),
    ],
    ['layout', layout],
    ...panes.map(({ url }) => ['url', url] as const),
    ...panes.map(({ zoom }) => ['zoom', String(zoom)] as const),
  ] as const;

  const query = params
    .map(([key, value]) => String(new URLSearchParams({ [key]: value })))
    .join('&');

  return `?${query}`;
};

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

const workspaceId = 'github-pull-request';

const workspaceName = 'GitHub pull request';

/**
 * The diff with whitespace changes hidden (`w=1`), and without the files
 * already marked viewed (`show-viewed-files=false`).
 */
const diffQuery = 'w=1&show-viewed-files=false';

/** 100%, where the extension's `zoom` leaves a pane when it is absent. */
const full = 1;

/** The conversation and the issue, when they share the right half. */
const narrow = 0.75;
