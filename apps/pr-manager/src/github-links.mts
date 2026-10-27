/**
 * Where on GitHub each block's list is, for the "on GitHub" link in its title
 * (`workflow-runs.mts` has the Actions tab's), and where a new issue is
 * written. Each follows the repository the page reads, so `?repo=` sends a
 * reader to that repository's lists rather than this one's.
 */

import { repositoryUrl, type ReportSource } from './constants.mjs';
import { MERGED_WITHIN_DAYS } from './load-report.mjs';
import { mergedSearch } from './report-query.mjs';

/**
 * Every open pull request, which is what the merge order is drawn from;
 * GitHub cannot order them by `Merge-After:`, so this is the set, not the
 * order.
 */
export const openPullRequestsUrl = (source: ReportSource): string =>
  searchUrl(source, 'pulls', 'is:pr is:open');

/**
 * The search the merged block reads ({@link mergedSearch}), for a window
 * ending at `nowMs`. A day is as fine as search goes, so this may list a few
 * more than the block, merged earlier on the day the window starts.
 */
export const mergedPullRequestsUrl = (
  source: ReportSource,
  nowMs: number,
): string =>
  searchUrl(
    source,
    'pulls',
    // The `repo:` qualifier is the page's own.
    mergedSearch(
      { owner: source.owner, name: source.repo },
      nowMs - MERGED_WITHIN_DAYS * MS_PER_DAY,
    ).replace(/^\S+ /u, ''),
  );

/** The open issues, most recently updated first, as the list starts. */
export const openIssuesUrl = (source: ReportSource): string =>
  searchUrl(source, 'issues', 'is:issue is:open sort:updated-desc');

/**
 * The template picker, which GitHub skips for the blank form where the
 * repository has no templates.
 */
export const newIssueUrl = (source: ReportSource): string =>
  `${repositoryUrl(source)}/issues/new/choose` as const;

const searchUrl = (
  source: ReportSource,
  page: 'pulls' | 'issues',
  query: string,
): string => {
  const params = new URLSearchParams({ q: query });

  return `${repositoryUrl(source)}/${page}?${params.toString()}` as const;
};

const MS_PER_DAY = 86_400_000;
