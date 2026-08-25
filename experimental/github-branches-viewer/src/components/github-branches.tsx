import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react';
import { memo, useCallback, useEffect, useState } from 'react';
import { type BranchInfo, type Repository } from '../types';
import {
  clearRepositoryCache,
  fetchBranchChecks,
  fetchBranchComparison,
  fetchBranches,
  fetchBranchStatus,
  fetchCommit,
  fetchPullRequests,
  fetchRepository,
} from '../utils/api';
import { CheckStatus } from './check-status';
import './github-branches.css';

type GitHubBranchesProps = Readonly<{
  repository: Repository;
  onRefresh?: () => void;
}>;

export const GitHubBranches = memo(
  ({ repository, onRefresh }: GitHubBranchesProps) => {
    const [branches, setBranches] = useState<BranchInfo[]>([]);
    const [defaultBranch, setDefaultBranch] = useState<string>('main');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [hasNextPage, setHasNextPage] = useState<boolean>(false);
    const [loadingPage, setLoadingPage] = useState<boolean>(false);

    const ITEMS_PER_PAGE = 20;

    const loadBranches = useCallback(
      async (forceRefresh = false, page = 1) => {
        try {
          // Set loading states appropriately
          if (page === 1) {
            setLoading(true);
          } else {
            setLoadingPage(true);
          }
          setError(null);

          // Fetch repository info to get default branch
          const repoData = await fetchRepository(
            repository.owner,
            repository.name,
            forceRefresh,
          );
          if (repoData !== null) {
            setDefaultBranch(repoData.default_branch);
          }

          // Fetch branches with pagination
          const branchesResponse = await fetchBranches(
            repository.owner,
            repository.name,
            page,
            ITEMS_PER_PAGE,
            forceRefresh,
          );
          const { branches: branchesData, hasNextPage } = branchesResponse;
          setHasNextPage(hasNextPage);

          // Progressive loading: First show basic branch info, then enhance with details
          const basicBranchInfo: BranchInfo[] = branchesData.map((branch) => ({
            name: branch.name,
            protected: branch.protected,
            commit: {
              sha: branch.commit.sha,
              message: 'Loading...',
              date: null,
              author: null,
            },
            ahead: 0,
            behind: 0,
            status: null,
            checkStatus: undefined,
            checks: null,
            pullRequest: null,
          }));

          // Show basic info immediately for better UX
          if (page === 1) {
            setBranches(basicBranchInfo);
          } else {
            setBranches((prev) => [...prev, ...basicBranchInfo]);
          }

          // Enhanced batch processing with increased parallelization
          const BATCH_SIZE = 6; // Increased for better performance
          const MAX_CONCURRENT_BATCHES = 2; // Process multiple batches in parallel

          const branchesWithDetails: BranchInfo[] = [];

          // Create all batches
          const batches = Array.from(
            { length: Math.ceil(branchesData.length / BATCH_SIZE) },
            (_, i) => branchesData.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE),
          );

          // Process batches in parallel groups
          for (
            let batchGroupIndex = 0;
            batchGroupIndex < batches.length;
            batchGroupIndex += MAX_CONCURRENT_BATCHES
          ) {
            const batchGroup = batches.slice(
              batchGroupIndex,
              batchGroupIndex + MAX_CONCURRENT_BATCHES,
            );

            const batchGroupResults = await Promise.all(
              batchGroup.map(async (batch) =>
                Promise.all(
                  batch.map(async (branch) => {
                    // Smart API call optimization - prioritize essential data
                    const [commitData, comparison, pullRequests] =
                      await Promise.all([
                        fetchCommit(branch.commit.url, forceRefresh),
                        branch.name !== repoData?.default_branch
                          ? fetchBranchComparison(
                              repository.owner,
                              repository.name,
                              repoData?.default_branch ?? 'main',
                              branch.name,
                              forceRefresh,
                            )
                          : null,
                        fetchPullRequests(
                          repository.owner,
                          repository.name,
                          branch.name,
                          forceRefresh,
                        ),
                      ]);

                    // Load status and checks in background (lower priority)
                    const [status, checks] = await Promise.all([
                      fetchBranchStatus(
                        repository.owner,
                        repository.name,
                        branch.commit.sha,
                        forceRefresh,
                      ),
                      fetchBranchChecks(
                        repository.owner,
                        repository.name,
                        branch.commit.sha,
                        forceRefresh,
                      ),
                    ]);

                    // Build commit data
                    const commitInfo =
                      commitData !== null
                        ? {
                            sha: commitData.sha,
                            message: commitData.commit.message,
                            date: commitData.commit.author.date,
                            author: {
                              name: commitData.commit.author.name,
                              email: commitData.commit.author.email,
                            },
                            authorLogin: commitData.author?.login,
                            authorAvatar: commitData.author?.avatar_url,
                          }
                        : {
                            sha: branch.commit.sha,
                            message: 'Unable to fetch commit details',
                            date: null,
                            author: null,
                          };

                    // Build comparison data
                    const aheadBehind =
                      comparison !== null
                        ? {
                            ahead: comparison.ahead_by,
                            behind: comparison.behind_by,
                          }
                        : {
                            ahead: 0,
                            behind: 0,
                          };

                    // Build checks data
                    const { checksInfo, checkStatusInfo } = checks?.check_runs
                      ? (() => {
                          const checkRuns = checks.check_runs;
                          const totalChecks = checkRuns.length;
                          const successfulChecks = checkRuns.filter(
                            (check) => check.conclusion === 'success',
                          ).length;
                          const failedChecks = checkRuns.filter(
                            (check) => check.conclusion === 'failure',
                          ).length;
                          const pendingChecks = checkRuns.filter(
                            (check) =>
                              check.status === 'in_progress' ||
                              check.status === 'queued' ||
                              !check.conclusion,
                          ).length;

                          const info = {
                            total: totalChecks,
                            passing: successfulChecks,
                            failing: failedChecks,
                            pending: pendingChecks,
                            runs: checkRuns.map((check) => ({
                              id: check.id,
                              name: check.name,
                              status: check.status,
                              conclusion: check.conclusion,
                              html_url: check.html_url,
                              started_at: check.started_at,
                              completed_at: check.completed_at,
                            })),
                          };

                          // Overall status for styling
                          const status:
                            | 'success'
                            | 'failure'
                            | 'pending'
                            | undefined =
                            failedChecks > 0
                              ? 'failure'
                              : pendingChecks > 0
                                ? 'pending'
                                : successfulChecks === totalChecks &&
                                    totalChecks > 0
                                  ? 'success'
                                  : undefined;

                          return {
                            checksInfo: info,
                            checkStatusInfo: status,
                          };
                        })()
                      : {
                          checksInfo: null,
                          checkStatusInfo: undefined,
                        };

                    // Build PR data
                    const prInfo = pullRequests?.length
                      ? {
                          pullRequest: pullRequests[0], // Use the first PR if multiple exist
                          pullRequests,
                        }
                      : {
                          pullRequest: null,
                          pullRequests: [],
                        };

                    const branchInfo: BranchInfo = {
                      name: branch.name,
                      protected: branch.protected,
                      commit: commitInfo,
                      ...aheadBehind,
                      status: status?.state ?? null,
                      checkStatus: checkStatusInfo,
                      checks: checksInfo,
                      ...prInfo,
                    };

                    return branchInfo;
                  }),
                ),
              ),
            );

            // Flatten batch group results and update UI progressively
            const flattenedResults = batchGroupResults.flat();
            branchesWithDetails.push(...flattenedResults);

            // Update UI with enhanced branch details progressively
            const updatedBranches = Array.from(branchesWithDetails);
            if (page === 1) {
              setBranches(updatedBranches);
            } else {
              setBranches((prev) => {
                const prevBasic = prev.slice(
                  0,
                  prev.length - updatedBranches.length,
                );
                return [...prevBasic, ...updatedBranches];
              });
            }
          }

          if (page === 1) {
            setBranches(branchesWithDetails);
          } else {
            setBranches((prev) => [...prev, ...branchesWithDetails]);
          }
        } catch (error_) {
          setError((error_ as Error).message ?? 'Failed to fetch branches');
          console.error('Error fetching branches:', error_);
        } finally {
          setLoading(false);
          setLoadingPage(false);
        }
      },
      [repository],
    );

    const handleRefresh = useCallback(async () => {
      // Immediately set refreshing state
      setRefreshing(true);

      try {
        // Clear cache and force refresh
        clearRepositoryCache(repository.owner, repository.name);
        setCurrentPage(1);
        await loadBranches(true, 1);
        if (onRefresh) {
          onRefresh();
        }
      } finally {
        // Ensure refreshing state is cleared
        setRefreshing(false);
      }
    }, [repository, loadBranches, onRefresh]);

    const loadMoreBranches = useCallback(async () => {
      if (hasNextPage && !loadingPage) {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        await loadBranches(false, nextPage);
      }
    }, [hasNextPage, loadingPage, currentPage, loadBranches]);

    useEffect(() => {
      setCurrentPage(1);
      void loadBranches(false, 1);
    }, [repository]);

    const formatDate = useCallback((dateString: string | null): string => {
      if (!dateString) return 'Unknown';
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 1) return 'today';
      if (diffDays === 1) return 'yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    }, []);

    if (error) {
      return (
        <div className={'branches-error'}>
          <div className={'error-content'}>
            <svg
              fill={'currentColor'}
              height={'24'}
              viewBox={'0 0 16 16'}
              width={'24'}
            >
              <path
                d={
                  'M2.343 13.657A8 8 0 1113.657 2.343 8 8 0 012.343 13.657zM6.03 4.97a.75.75 0 00-1.06 1.06L6.94 8 4.97 9.97a.75.75 0 101.06 1.06L8 9.06l1.97 1.97a.75.75 0 101.06-1.06L9.06 8l1.97-1.97a.75.75 0 10-1.06-1.06L8 6.94 6.03 4.97z'
                }
              />
            </svg>
            <h3>{'Failed to load branches'}</h3>
            <p>{error}</p>
            <button
              className={'btn-outline'}
              type={'button'}
              onClick={() => {
                globalThis.location.reload();
              }}
            >
              {'Try again'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={'github-branches'}>
        <div className={'github-header'}>
          <div className={'github-section-links'}>
            <a
              className={'github-section-title'}
              href={`https://github.com/${repository.owner}/${repository.name}/branches/all`}
              rel={'noopener noreferrer'}
              target={'_blank'}
            >
              {'GitHub Branches'}
            </a>
            <a
              aria-label={'Open repository settings'}
              className={'github-settings-button'}
              href={`https://github.com/${repository.owner}/${repository.name}/settings`}
              rel={'noopener noreferrer'}
              target={'_blank'}
              title={'Repository settings'}
            >
              <svg
                fill={'currentColor'}
                height={'16'}
                viewBox={'0 0 16 16'}
                width={'16'}
              >
                <path
                  d={
                    'M8 1.5a1.5 1.5 0 011.327.83l.1.2a5.88 5.88 0 011.466.85l.223-.129a1.5 1.5 0 111.5 2.598l-.223.129a5.84 5.84 0 010 1.702l.223.129a1.5 1.5 0 11-1.5 2.598l-.223-.129a5.88 5.88 0 01-1.466.85l-.1.2a1.5 1.5 0 11-2.654 0l-.1-.2a5.88 5.88 0 01-1.466-.85l-.223.129a1.5 1.5 0 11-1.5-2.598l.223-.129a5.84 5.84 0 010-1.702l-.223-.129a1.5 1.5 0 111.5-2.598l.223.129a5.88 5.88 0 011.466-.85l.1-.2A1.5 1.5 0 018 1.5zm0 3a2.5 2.5 0 102.5 2.5A2.5 2.5 0 008 4.5z'
                  }
                />
              </svg>
            </a>
          </div>
          <button
            className={'refresh-btn'}
            disabled={refreshing}
            title={'Refresh branches data'}
            type={'button'}
            onClick={handleRefresh}
          >
            <svg
              className={refreshing ? 'rotating' : ''}
              fill={'currentColor'}
              height={'16'}
              viewBox={'0 0 16 16'}
              width={'16'}
            >
              <path
                d={
                  'M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5Z'
                }
              />
            </svg>
            {refreshing ? (
              <span className={'refresh-text'}>{'Refreshing...'}</span>
            ) : null}
          </button>
        </div>

        <div className={'branches-table-container'}>
          <table className={'branches-table'}>
            <thead>
              <tr className={'branches-header-row'}>
                <td className={'branch-count-cell'} colSpan={6}>
                  {loading ? (
                    <span className={'skeleton-count'} />
                  ) : (
                    <>
                      {branches.length} {'branches'}
                      {hasNextPage ? ` (showing page ${currentPage})` : null}
                    </>
                  )}
                </td>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className={'branch-row'}>
                      <td className={'branch-name-col'}>
                        <div className={'branch-name-wrapper'}>
                          <div className={'skeleton-branch-name'} />
                          <div className={'skeleton-icon'} />
                          <div className={'skeleton-badge'} />
                        </div>
                      </td>
                      <td className={'branch-updated-col'}>
                        <div className={'skeleton-date'} />
                      </td>
                      <td className={'branch-status-col'}>
                        <div className={'skeleton-icon'} />
                      </td>
                      <td className={'branch-ahead-behind-col'}>
                        <div className={'skeleton-stats'} />
                      </td>
                      <td className={'branch-pr-col'}>
                        <div className={'skeleton-pr'} />
                      </td>
                      <td className={'branch-actions-col'}>
                        <div className={'skeleton-icon'} />
                      </td>
                    </tr>
                  ))}
                </>
              ) : (
                branches.map((branch) => (
                  <tr key={branch.name} className={'branch-row'}>
                    <td className={'branch-name-col'}>
                      <div className={'branch-name-wrapper'}>
                        <a
                          className={'branch-name-link'}
                          href={`https://github.com/${repository.owner}/${repository.name}/tree/${branch.name}`}
                          rel={'noopener noreferrer'}
                          target={'_blank'}
                          title={branch.name}
                        >
                          {branch.name}
                        </a>
                        {branch.name === defaultBranch ? (
                          <span className={'default-badge'}>{'Default'}</span>
                        ) : null}
                      </div>
                    </td>

                    <td className={'branch-updated-col'}>
                      <span
                        className={'branch-updated'}
                        title={
                          branch.commit.date
                            ? new Date(branch.commit.date).toLocaleString()
                            : ''
                        }
                      >
                        {formatDate(branch.commit.date)}
                      </span>
                    </td>

                    <td className={'branch-status-col'}>
                      {branch.checks !== null ? (
                        <CheckStatus
                          checkStatus={branch.checkStatus}
                          checks={branch.checks}
                        />
                      ) : null}
                    </td>

                    <td className={'branch-ahead-behind-col'}>
                      {branch.name !== defaultBranch &&
                      ((branch.behind ?? 0) > 0 || (branch.ahead ?? 0) > 0) ? (
                        <a
                          className={'ahead-behind-link'}
                          href={`https://github.com/${repository.owner}/${repository.name}/compare/${defaultBranch}...${branch.name}`}
                          title={`${branch.behind ?? 0} behind, ${branch.ahead ?? 0} ahead of ${defaultBranch}`}
                        >
                          {(branch.behind ?? 0) > 0 ? (
                            <>
                              <svg
                                className={'behind-icon'}
                                fill={'currentColor'}
                                height={'16'}
                                viewBox={'0 0 16 16'}
                                width={'16'}
                              >
                                <path
                                  d={
                                    'M7.47 10.78a.75.75 0 001.06 0l3.75-3.75a.75.75 0 00-1.06-1.06L8.75 8.44V1.75a.75.75 0 00-1.5 0v6.69L4.78 5.97a.75.75 0 00-1.06 1.06l3.75 3.75zM3.75 13a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5z'
                                  }
                                />
                              </svg>
                              <span className={'behind-count'}>
                                {branch.behind ?? 0}
                              </span>
                            </>
                          ) : null}
                          {(branch.ahead ?? 0) > 0 ? (
                            <>
                              <svg
                                className={'ahead-icon'}
                                fill={'currentColor'}
                                height={'16'}
                                viewBox={'0 0 16 16'}
                                width={'16'}
                              >
                                <path
                                  d={
                                    'M8.47 1.22a.75.75 0 00-1.06 0L4.66 3.97a.75.75 0 001.06 1.06L7.25 3.5v9.75a.75.75 0 001.5 0V3.5l1.53 1.53a.75.75 0 001.06-1.06L8.47 1.22z'
                                  }
                                />
                              </svg>
                              <span className={'ahead-count'}>
                                {branch.ahead ?? 0}
                              </span>
                            </>
                          ) : null}
                        </a>
                      ) : null}
                    </td>

                    <td className={'branch-pr-col'}>
                      {branch.pullRequest ? (
                        <a
                          className={'pr-link-inline'}
                          href={branch.pullRequest.html_url}
                          rel={'noopener noreferrer'}
                          target={'_blank'}
                          title={branch.pullRequest.title}
                        >
                          {'#'}
                          {branch.pullRequest.number}
                        </a>
                      ) : (
                        branch.name !== defaultBranch && (
                          <a
                            className={'btn-sm btn-primary new-pr-btn'}
                            href={`https://github.com/${repository.owner}/${repository.name}/pull/new/${branch.name}`}
                            title={'Create pull request'}
                          >
                            {'New PR'}
                          </a>
                        )
                      )}
                    </td>

                    <td className={'branch-actions-col'}>
                      {branch.name !== defaultBranch ? (
                        <BranchActionsMenu
                          branch={branch}
                          defaultBranch={defaultBranch}
                          repository={repository}
                        />
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {hasNextPage ? (
              <tfoot>
                <tr className={'pagination-row'}>
                  <td className={'pagination-cell'} colSpan={6}>
                    <button
                      className={'btn-outline load-more-btn'}
                      disabled={loadingPage}
                      type={'button'}
                      onClick={loadMoreBranches}
                    >
                      {loadingPage ? (
                        <>
                          <svg
                            className={'loading-spinner'}
                            height={'16'}
                            viewBox={'0 0 16 16'}
                            width={'16'}
                          >
                            <path
                              d={
                                'M8 0a8 8 0 0 1 8 8 .75.75 0 1 1-1.5 0A6.5 6.5 0 0 0 8 1.5a.75.75 0 0 1 0-1.5Z'
                              }
                              fill={'currentColor'}
                            />
                          </svg>
                          {'Loading more...'}
                        </>
                      ) : (
                        `Load more branches (${ITEMS_PER_PAGE} per page)`
                      )}
                    </button>
                  </td>
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>
      </div>
    );
  },
);

GitHubBranches.displayName = 'GitHubBranches';

type BranchActionsMenuProps = Readonly<{
  branch: BranchInfo;
  repository: Repository;
  defaultBranch: string;
}>;

const BranchActionsMenu = memo(
  ({ branch, repository, defaultBranch }: BranchActionsMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const { refs, floatingStyles, context } = useFloating({
      open: isOpen,
      onOpenChange: setIsOpen,
      placement: 'bottom-end',
      middleware: [offset(5), flip(), shift()],
      whileElementsMounted: autoUpdate,
    });

    const click = useClick(context);
    const dismiss = useDismiss(context);

    const { getReferenceProps, getFloatingProps } = useInteractions([
      click,
      dismiss,
    ]);

    const handleDeleteBranch = useCallback(() => {
      if (confirm(`Delete branch ${branch.name}?`)) {
        console.log(`Delete branch ${branch.name}`);
      }
      setIsOpen(false);
    }, [branch.name]);

    const handleCopyBranchName = useCallback(() => {
      navigator.clipboard.writeText(branch.name);
      setIsOpen(false);
    }, [branch.name]);

    return (
      <>
        <button
          className={'btn-sm btn-icon branch-actions-trigger'}
          ref={refs.setReference}
          title={'Branch actions'}
          type={'button'}
          {...getReferenceProps()}
        >
          <svg
            fill={'currentColor'}
            height={'16'}
            viewBox={'0 0 16 16'}
            width={'16'}
          >
            <path
              d={
                'M8 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM1.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm13 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z'
              }
            />
          </svg>
        </button>

        {isOpen ? (
          <FloatingPortal>
            <div
              ref={refs.setFloating}
              className={'branch-actions-menu'}
              style={floatingStyles}
              {...getFloatingProps()}
            >
              <div className={'menu-item'}>
                <a
                  className={'menu-link'}
                  href={`https://github.com/${repository.owner}/${repository.name}/tree/${branch.name}`}
                  rel={'noopener noreferrer'}
                  target={'_blank'}
                >
                  <svg
                    fill={'currentColor'}
                    height={'16'}
                    viewBox={'0 0 16 16'}
                    width={'16'}
                  >
                    <path
                      d={
                        'M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3H7.5a.25.25 0 01-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z'
                      }
                    />
                  </svg>
                  {'View branch'}
                </a>
              </div>

              <div className={'menu-item'}>
                <button
                  className={'menu-button'}
                  onClick={handleCopyBranchName}
                  type={'button'}
                >
                  <svg
                    fill={'currentColor'}
                    height={'16'}
                    viewBox={'0 0 16 16'}
                    width={'16'}
                  >
                    <path
                      d={
                        'M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z'
                      }
                    />
                    <path
                      d={
                        'M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z'
                      }
                    />
                  </svg>
                  {'Copy branch name'}
                </button>
              </div>

              {branch.name !== defaultBranch ? (
                <div className={'menu-item'}>
                  <a
                    className={'menu-link'}
                    href={`https://github.com/${repository.owner}/${repository.name}/compare/${defaultBranch}...${branch.name}`}
                    rel={'noopener noreferrer'}
                    target={'_blank'}
                  >
                    <svg
                      fill={'currentColor'}
                      height={'16'}
                      viewBox={'0 0 16 16'}
                      width={'16'}
                    >
                      <path
                        d={
                          'M1.75 1A1.75 1.75 0 000 2.75v8.5C0 12.216.784 13 1.75 13H3v1.543a.75.75 0 001.206.596L7.81 13h6.44A1.75 1.75 0 0016 11.25v-8.5A1.75 1.75 0 0014.25 1H1.75zM1.5 2.75a.25.25 0 01.25-.25h12.5a.25.25 0 01.25.25v8.5a.25.25 0 01-.25.25H7.5L4.5 13.25v-2.5H1.75a.25.25 0 01-.25-.25v-8.5z'
                        }
                      />
                    </svg>
                    {'Compare with '}
                    {defaultBranch}
                  </a>
                </div>
              ) : null}

              {!branch.pullRequest && branch.name !== defaultBranch ? (
                <div className={'menu-item'}>
                  <a
                    className={'menu-link'}
                    href={`https://github.com/${repository.owner}/${repository.name}/pull/new/${branch.name}`}
                    rel={'noopener noreferrer'}
                    target={'_blank'}
                  >
                    <svg
                      fill={'currentColor'}
                      height={'16'}
                      viewBox={'0 0 16 16'}
                      width={'16'}
                    >
                      <path
                        d={
                          'M1.5 3.25a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z'
                        }
                      />
                    </svg>
                    {'Create pull request'}
                  </a>
                </div>
              ) : null}

              <div className={'menu-divider'} />

              {branch.name !== defaultBranch ? (
                <div className={'menu-item'}>
                  {branch.protected ? (
                    <button
                      className={'menu-button menu-button-disabled'}
                      disabled
                      title={'Cannot delete protected branch'}
                      type={'button'}
                    >
                      <svg
                        fill={'currentColor'}
                        height={'16'}
                        viewBox={'0 0 16 16'}
                        width={'16'}
                      >
                        <path
                          d={
                            'M11 1.75V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675l.66 6.6A1.75 1.75 0 006.898 15h2.204c.93 0 1.7-.73 1.742-1.658l.66-6.6a.75.75 0 111.492.149l-.66 6.6A3.25 3.25 0 019.102 16.5H6.898a3.25 3.25 0 01-3.234-3.009l-.66-6.6a.75.75 0 011.492-.149V6.675zM6.5 1.75V3h3V1.75a.25.25 0 00-.25-.25h-2.5a.25.25 0 00-.25.25z'
                          }
                        />
                      </svg>
                      {'Delete branch (protected)'}
                    </button>
                  ) : (
                    <button
                      className={'menu-button menu-button-danger'}
                      onClick={handleDeleteBranch}
                      type={'button'}
                    >
                      <svg
                        fill={'currentColor'}
                        height={'16'}
                        viewBox={'0 0 16 16'}
                        width={'16'}
                      >
                        <path
                          d={
                            'M11 1.75V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675l.66 6.6A1.75 1.75 0 006.898 15h2.204c.93 0 1.7-.73 1.742-1.658l.66-6.6a.75.75 0 111.492.149l-.66 6.6A3.25 3.25 0 019.102 16.5H6.898a3.25 3.25 0 01-3.234-3.009l-.66-6.6a.75.75 0 011.492-.149V6.675zM6.5 1.75V3h3V1.75a.25.25 0 00-.25-.25h-2.5a.25.25 0 00-.25.25z'
                          }
                        />
                      </svg>
                      {'Delete branch'}
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          </FloatingPortal>
        ) : null}
      </>
    );
  },
);

BranchActionsMenu.displayName = 'BranchActionsMenu';
