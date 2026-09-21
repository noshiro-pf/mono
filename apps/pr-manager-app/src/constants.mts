/** Which report this app reads. */

export type ReportSource = Readonly<{
  owner: string;
  repo: string;
  /**
   * The label that identifies the one report issue across runs, as
   * `pr-report.yml` uses it: a title can be edited by anyone reading it, and
   * a workflow cannot remember an issue number between runs without a
   * repository variable and the admin token that writes one.
   */
  label: string;
  /**
   * The label on the issue `unblock-prs` writes its runs to. A second issue
   * rather than a second section of the first: the two have different
   * writers — a workflow and a person's terminal — and one body cannot be
   * overwritten wholesale by both.
   */
  runLogLabel: string;
}>;

export const REPORT_SOURCE: ReportSource = {
  owner: 'noshiro-pf',
  repo: 'mono',
  label: 'pr-report',
  runLogLabel: 'unblock-prs-log',
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
 * How often the page goes and looks again while it is on screen.
 *
 * Two minutes, and the number is set by the rate limit rather than by taste.
 * **An anonymous caller is charged for a `304` as well as for a `200`** —
 * measured against this repository, `x-ratelimit-remaining` falling 59, 58,
 * 57 across three conditional requests that all answered 304. Only an
 * *authenticated* caller gets them free, which is the opposite of what is
 * convenient: the page has no token, so its budget is 60 requests an hour for
 * the whole address it sits behind, conditional or not.
 *
 * One request every two minutes is 30 an hour, which leaves half the budget
 * for reloads and for whatever else shares the address. The conditional
 * request is still worth sending — it saves the transfer, and it is what will
 * make a faster interval possible if this page ever carries a token — but it
 * does not buy a shorter interval on its own.
 *
 * Little is lost to the wait. A report is rewritten by a workflow that takes
 * about a minute to run (median 58s, measured over its last twenty runs), so
 * the interval is not what decides how old the page is.
 */
export const POLL_INTERVAL_MS = 120_000;

/**
 * How often "3 hours ago" is recomputed. Not tied to the poll: the report can
 * go an hour without changing and the sentence about its age still has to
 * keep up, or a tab left open reads as fresh forever.
 */
export const CLOCK_TICK_MS = 30_000;
