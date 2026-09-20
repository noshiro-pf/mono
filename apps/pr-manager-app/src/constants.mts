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
}>;

export const REPORT_SOURCE: ReportSource = {
  owner: 'noshiro-pf',
  repo: 'mono',
  label: 'pr-report',
};

/** The repository the report is about. */
export const repositoryUrl = (source: ReportSource): string =>
  `https://github.com/${source.owner}/${source.repo}`;

/**
 * Where the report issue can be found, for the case where the app could not
 * read it and the reader wants to see it for themselves.
 */
export const reportIssuesUrl = (source: ReportSource): string => {
  const query = new URLSearchParams({
    q: `is:issue is:open label:${source.label}`,
  });

  return `${repositoryUrl(source)}/issues?${query.toString()}`;
};
