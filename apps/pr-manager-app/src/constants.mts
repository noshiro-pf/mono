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
