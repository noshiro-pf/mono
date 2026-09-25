/** Which repository this app reads, and how often. */

export type ReportSource = Readonly<{ owner: string; repo: string }>;

export const REPORT_SOURCE: ReportSource = {
  owner: 'noshiro-pf',
  repo: 'mono',
} as const;

/** The repository the report is about. */
export const repositoryUrl = (source: ReportSource): string =>
  `https://github.com/${source.owner}/${source.repo}` as const;

/**
 * How often the page reads GitHub again while it is on screen.
 *
 * **Set by the GraphQL budget.** A read is the report query plus its
 * follow-up, about 5 points measured against this repository, and GraphQL
 * has no conditional request: a read that finds nothing new costs the same
 * as one that finds everything. Every fifteen seconds is 240 reads an hour,
 * about 1,200 of the 5,000 points an account gets — which leaves the rest
 * for everything else that account does with GraphQL, `gh` included.
 *
 * **Refresh** is not bound by this. It reads at once, because a reader who
 * presses it wants now rather than the next tick.
 */
export const POLL_INTERVAL_MS = 15_000;

/**
 * How often "3 minutes ago" is recomputed. Not tied to the poll: a hidden
 * tab stops polling, and the sentence about how old the page is has to keep
 * up with that, or a tab left open reads as fresh forever.
 */
export const CLOCK_TICK_MS = 30_000;
