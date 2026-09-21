/**
 * Which repository this app reads, and where the human-readable half of the
 * report is.
 *
 * The machine-readable half — the files this page actually loads — is
 * `pr-report-payload`'s to place, because both the writer and this reader
 * have to agree about it and neither of them owns the other.
 */

export type ReportSource = Readonly<{
  owner: string;
  repo: string;
  /**
   * The label that identifies the one report issue across runs, as
   * `pr-report.yml` uses it: a title can be edited by anyone reading it, and
   * a workflow cannot remember an issue number between runs without a
   * repository variable and the admin token that writes one.
   *
   * That issue is prose for people. This page does not read it — it reads
   * the payload file the same run writes — but it links at it, which is what
   * a reader who wants the report without the app is after.
   */
  label: string;
}>;

export const REPORT_SOURCE: ReportSource = {
  owner: 'noshiro-pf',
  repo: 'mono',
  label: 'pr-report',
} as const;

/** The repository the report is about. */
export const repositoryUrl = (source: ReportSource): string =>
  `https://github.com/${source.owner}/${source.repo}` as const;

/**
 * Where the report issue can be found, for the case where the app could not
 * read it and the reader wants to see it for themselves.
 */
export const reportIssuesUrl = (
  source: ReportSource,
  label: string = source.label,
): string => {
  const query = new URLSearchParams({
    q: `is:issue is:open label:${label}`,
  });

  return `${repositoryUrl(source)}/issues?${query.toString()}`;
};

/**
 * How often the page goes and looks again while it is on screen, which is a
 * different number depending on whether the reader has given it a token.
 *
 * **Without one, two minutes, and the number is set by the rate limit rather
 * than by taste.** An anonymous caller is charged for a `304` as well as for
 * a `200` — measured against this repository, `x-ratelimit-remaining`
 * falling 59, 58, 57 across three conditional requests that all answered
 * 304 — and the budget is 60 an hour for the whole address the browser sits
 * behind, not for the page. One request every two minutes is 30 an hour,
 * which leaves half of it for reloads and for whatever else shares the
 * address.
 *
 * **With one, fifteen seconds**, because both halves of that reverse. The
 * budget becomes 5,000 an hour and belongs to the account rather than to the
 * address, and a `304` is charged nothing at all — measured,
 * `x-ratelimit-remaining` unchanged across four of them. A poll that finds
 * nothing is therefore free, and 240 an hour is inside the budget even if
 * every one of them found something.
 *
 * Little is lost to the slower of the two. A report is rewritten by a
 * workflow that takes about a minute to run (median 58s, measured over its
 * last twenty runs), so neither interval is what decides how old the page
 * is.
 */
export const pollIntervalMs = (token: string | undefined): number =>
  token === undefined ? ANONYMOUS_POLL_INTERVAL_MS : SIGNED_IN_POLL_INTERVAL_MS;

export const ANONYMOUS_POLL_INTERVAL_MS = 120_000;

export const SIGNED_IN_POLL_INTERVAL_MS = 15_000;

/**
 * How often "3 hours ago" is recomputed. Not tied to the poll: the report can
 * go an hour without changing and the sentence about its age still has to
 * keep up, or a tab left open reads as fresh forever.
 */
export const CLOCK_TICK_MS = 30_000;
