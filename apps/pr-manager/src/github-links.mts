import { MERGE_QUEUED_LABEL, SKIP_CI_LABEL } from 'pr-report-core';
import { Arr } from 'ts-data-forge';
/**
 * Where on GitHub each block's list is, for the "on GitHub" links in its title
 * (`workflow-runs.mts` has the Actions tab's), and where a new issue is
 * written. Each follows the repository the page reads, so `?repo=` sends a
 * reader to that repository's lists rather than this one's.
 */
import { repositoryUrl, type ReportSource } from './constants.mjs';
import { anyLabelQualifier, notLabelQualifier } from './label-search.mjs';
import { MERGED_WITHIN_DAYS } from './load-report.mjs';
import { mergedSearch } from './report-query.mjs';

/**
 * The open pull requests, narrowed by `qualifiers`: for the merge order, by
 * `githubSearchOf` in `merge-order-view.mts` to what its filters show — GitHub
 * cannot order them by `Merge-After:`, so that is the set, not the order — and
 * for the queue, by the two below.
 */
export const openPullRequestsUrl = (
  source: ReportSource,
  qualifiers: readonly string[] = [],
): string =>
  searchUrl(
    source,
    'pulls',
    Arr.toUnshifted('is:pr is:open')(qualifiers).join(' '),
  );

/**
 * The Queue block's pull requests: the open ones labelled `merge-queued`, those
 * it draws outside the queue included. GitHub cannot order them as the worker
 * picks them, so they are listed by number, the order the worker falls back to.
 */
export const queuedPullRequestsUrl = (source: ReportSource): string =>
  openPullRequestsUrl(source, [QUEUED, BY_NUMBER]);

/**
 * The queued pull requests without `skip-ci`. `unblock-prs` takes it off the
 * one whose turn has come and leaves it off, so the one it is running is here,
 * and so are those it picked before whose checks failed or that it set aside —
 * but so is any whose label came off another way, such as a bot's that arms
 * itself or an author's asking for CI. GitHub's search cannot tell them apart;
 * the block's boxes can.
 */
export const pickedPullRequestsUrl = (source: ReportSource): string =>
  openPullRequestsUrl(source, [
    QUEUED,
    notLabelQualifier(SKIP_CI_LABEL),
    BY_NUMBER,
  ]);

/**
 * The search the merged block reads ({@link mergedSearch}), for a window ending
 * at `nowMs`. A day is as fine as search goes, so this may list a few more than
 * the block, merged earlier on the day the window starts.
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

/**
 * The open issues, narrowed by `qualifiers` (`githubIssuesSearchOf` in
 * `issues-search.mts`) to what the block's filters show, most recently updated
 * first, as the list starts.
 */
export const openIssuesUrl = (
  source: ReportSource,
  qualifiers: readonly string[] = [],
): string =>
  searchUrl(
    source,
    'issues',
    ['is:issue is:open', ...qualifiers, 'sort:updated-desc'].join(' '),
  );

/**
 * The template picker, which GitHub skips for the blank form where the
 * repository has no templates.
 */
export const newIssueUrl = (source: ReportSource): string =>
  `${repositoryUrl(source)}/issues/new/choose` as const;

const QUEUED = anyLabelQualifier([MERGE_QUEUED_LABEL]);

const BY_NUMBER = 'sort:created-asc';

const MS_PER_DAY = 86_400_000;

const searchUrl = (
  source: ReportSource,
  page: 'pulls' | 'issues',
  query: string,
): string => {
  const params = new URLSearchParams({ q: query });

  return `${repositoryUrl(source)}/${page}?${params.toString()}` as const;
};
