import { Arr, Num, Result } from 'ts-data-forge';

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
 * A Claude Code session's address, or `undefined` for anything else — which is
 * what is checked of a link read off a page before a pane is pointed at it.
 */
export const claudeSessionUrlOf = (address: string): string | undefined =>
  claudeSessionUrlPattern.test(address) ? address : undefined;

/**
 * The first Claude Code session a pull request's description names on a
 * `Claude-Session:` line — `Claude-Session: [<title>](<url>)`, or the URL alone
 * — as the PR Manager reads it (`apps/pr-manager/src/claude-session.mts`): at
 * the start of a line, in
 * any case, and only a `https://claude.ai/code/session_…` URL, so a trailer is
 * not a way to put an arbitrary page in a pane.
 *
 * The description is read off GitHub's rendering of it, with each link written
 * back as `[<text>](<href>)` — a bare URL is rendered as a link to itself — and
 * the code blocks left out, which is where the PR Manager does not look either.
 */
export const claudeSessionUrlOfBody = (body: string): string | undefined =>
  Array.from(body.matchAll(trailerLinePattern), (line) =>
    sessionUrlOfTrailer((line.groups?.['value'] ?? '').trim()),
  ).find((url) => url !== undefined);

/**
 * The query string of `split.html` that opens a pull request as the PR
 * Manager's links do (`apps/pr-manager/src/split-view.mts`): the diff, without
 * whitespace changes or the files already viewed, at the narrowest width that
 * keeps GitHub's file tree, beside the conversation in the rest of the page.
 * When the pull request closes an issue or names the Claude Code session it was
 * written in, the conversation is held at a fixed width and that takes the
 * rest, to the right of the conversation; with both, the issue is stacked over
 * the session.
 *
 * The conversation and the issue are at 75%, so that more of each fits — the
 * conversation beside the diff alone too, so that it reads the same whatever
 * shares the page. The diff is at 100% beside the conversation alone and at 75%
 * in three columns; the session is at 100%.
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
  sessionUrl,
}: Readonly<{
  pullRequest: PullRequest;
  title: string | undefined;
  issueUrl: string | undefined;
  sessionUrl: string | undefined;
}>): string => {
  const conversation = { url: pullRequest.url, zoom: narrow } as const;

  // What goes to the right of the conversation, the issue over the session when
  // there are both.
  const others = [
    ...(issueUrl === undefined
      ? ([] as const)
      : ([{ url: issueUrl, zoom: narrow }] as const)),
    ...(sessionUrl === undefined
      ? ([] as const)
      : ([{ url: sessionUrl, zoom: full }] as const)),
  ] as const;

  const layout = Arr.isEmpty(others)
    ? diffBesideConversation
    : Arr.isFixedLengthArray(1, others)
      ? threeColumns
      : threeColumnsStacked;

  const diff = {
    url: `${pullRequest.url}/files?${diffQuery}`,
    zoom: Arr.isEmpty(others) ? full : narrow,
  } as const;

  const panes = [diff, conversation, ...others] as const;

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
    ...panes.map(({ zoom }) => ['zoom', zoom.toString()] as const),
  ] as const;

  const query = params
    .map(([key, value]) => new URLSearchParams({ [key]: value }))
    .map((pair) => pair.toString())
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

/** A trailer's value, linked or bare, as a session's address. */
const sessionUrlOfTrailer = (value: string): string | undefined =>
  claudeSessionUrlOf(
    linkedTrailerPattern.exec(value)?.groups?.['url'] ?? value,
  );

/** An owner is letters, digits and hyphens. */
const ownerPattern = /^[a-z\d-]+$/iu;

/** A repository name may also have dots and underscores. */
const repoPattern = /^[\w.-]+$/u;

const numberPattern = /^\d+$/u;

const titleSeparator = ' · ';

const pullRequestLabelPattern = /^Pull Request #\d+$/u;

/** What `github-view-defaults-extension` puts in front of the title. */
const numberPrefixPattern = /^#\d+ /u;

const claudeSessionUrlPattern =
  /^https:\/\/claude\.ai\/code\/session_[0-9A-Za-z]+$/u;

const trailerLinePattern =
  /^[^\S\n]*claude-session[^\S\n]*:(?<value>[^\n]*)$/gimu;

/** `[<title>](<url>)` */
const linkedTrailerPattern = /^\[.*\]\((?<url>[^()\s]*)\)$/u;

const workspaceId = 'github-pull-request';

const workspaceName = 'GitHub pull request';

/**
 * The diff with whitespace changes hidden (`w=1`), and without the files
 * already marked viewed (`show-viewed-files=false`).
 */
const diffQuery = 'w=1&show-viewed-files=false';

/** 100%, where the extension's `zoom` leaves a pane when it is absent. */
const full = 1;

/** The conversation and the issue, and the diff in three columns. */
const narrow = 0.75;

/**
 * The diff beside the conversation alone, the diff held at 737px. The PR
 * Manager's `diffBesideConversation` says why.
 */
const diffBesideConversation = 'r737fpp';

/**
 * The diff, the conversation and the right column, the diff and the
 * conversation held at fixed widths. The PR Manager's `threeColumns`
 * (`apps/pr-manager/src/split-view.mts`) says why those.
 */
const threeColumns = 'r554fpr577fpp';

/** `threeColumns`, with the right column stacked in two. */
const threeColumnsStacked = 'r554fpr577fpcpp';
