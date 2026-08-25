import axios from 'axios';
import {
  type CacheEntry,
  type GitHubBranch,
  type GitHubCheckRun,
  type GitHubCommit,
  type GitHubPullRequest,
  type GitHubRepository,
  type RateLimitResponse,
} from '../types';

// GitHub API configuration
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

// Create axios instance with default config
const githubApi = axios.create({
  baseURL: GITHUB_API_BASE,
  headers: {
    Accept: 'application/vnd.github.v3+json',
    ...(GITHUB_TOKEN !== undefined && {
      Authorization: `token ${GITHUB_TOKEN}`,
    }),
  },
});

// Add response interceptor for better error handling
githubApi.interceptors.response.use(
  (response) => response,
  (mut_error) => {
    if (mut_error.response) {
      const { status, headers } = mut_error.response;

      // Check for rate limiting
      if (status === 403) {
        const remaining = headers['x-ratelimit-remaining'];
        const reset = headers['x-ratelimit-reset'];

        if (remaining === '0') {
          const resetDate = new Date(reset * 1000);
          mut_error.message = `GitHub API rate limit exceeded. Resets at ${resetDate.toLocaleTimeString()}`;

          if (GITHUB_TOKEN === undefined) {
            mut_error.message +=
              '\n\nTo increase rate limits, add a GitHub token in .env file (see .env.example)';
          }
        }
      }

      // Check for not found
      if (status === 404) {
        mut_error.message = 'Repository or resource not found';
      }
    }

    return Promise.reject(mut_error);
  },
);

// Intelligent cache for API responses with different durations
const cache = new Map<string, CacheEntry>();

// Smart caching strategy - different durations for different data types
const CACHE_DURATIONS = {
  LONG: 30 * 60 * 1000, // 30 minutes - Repository info, commit data
  MEDIUM: 10 * 60 * 1000, // 10 minutes - Branch comparisons, pull requests
  SHORT: 2 * 60 * 1000, // 2 minutes - Status checks, check runs
  BRANCHES: 5 * 60 * 1000, // 5 minutes - Branch lists
};

const getCacheKey = (url: string, params?: Record<string, unknown>): string =>
  `${url}?${JSON.stringify(params ?? {})}`;

const getCachedData = <T>(key: string, duration?: number): T | null => {
  const cached = cache.get(key);
  const cacheDuration = duration ?? CACHE_DURATIONS.MEDIUM;
  if (
    cached !== null &&
    cached !== undefined &&
    Date.now() - cached.timestamp < cacheDuration
  ) {
    return cached.data as T;
  }
  cache.delete(key);
  return null;
};

const setCachedData = <T>(key: string, data: T): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

// Get cache duration based on URL pattern
const getCacheDuration = (url: string): number => {
  if (
    url.includes('/repos/') &&
    !url.includes('/branches') &&
    !url.includes('/commits/')
  ) {
    return CACHE_DURATIONS.LONG; // Repository info
  }
  if (
    url.includes('/commits/') &&
    (url.includes('/status') || url.includes('/check-runs'))
  ) {
    return CACHE_DURATIONS.SHORT; // Status and checks
  }
  if (url.includes('/compare/') || url.includes('/pulls')) {
    return CACHE_DURATIONS.MEDIUM; // Comparisons and PRs
  }
  if (url.includes('/commits/')) {
    return CACHE_DURATIONS.LONG; // Individual commits
  }
  if (url.includes('/branches')) {
    return CACHE_DURATIONS.BRANCHES; // Branch lists
  }
  return CACHE_DURATIONS.MEDIUM; // Default
};

// Clear cache for a specific repository
export const clearRepositoryCache = (owner: string, name: string): void => {
  // Clear all cache entries related to this repository
  const keysToDelete: string[] = [];
  for (const key of cache.keys()) {
    if (
      key.includes(`/${owner}/${name}`) ||
      key.includes(`repos/${owner}/${name}`) ||
      key.includes(`${owner}/${name}`) ||
      key.includes(`github-${owner}-${name}`)
    ) {
      keysToDelete.push(key);
    }
  }
  for (const key of keysToDelete) cache.delete(key);
  console.log(
    `Cleared ${keysToDelete.length} cache entries for ${owner}/${name}:`,
    keysToDelete,
  );
};

// GitHub API functions
export const fetchRepository = async (
  owner: string,
  repoName: string,
  bypassCache = false,
): Promise<GitHubRepository | null> => {
  const url = `/repos/${owner}/${repoName}`;
  const cacheKey = getCacheKey(url);

  if (!bypassCache) {
    const cached = getCachedData<GitHubRepository>(
      cacheKey,
      getCacheDuration(url),
    );
    if (cached !== null) return cached;
  }

  try {
    const response = await githubApi.get<GitHubRepository>(
      `/repos/${owner}/${repoName}`,
    );
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching repository ${owner}/${repoName}:`,
      (error as Error).message,
    );
    return null;
  }
};

export const fetchBranchComparison = async (
  owner: string,
  repoName: string,
  baseBranch: string,
  headBranch: string,
  bypassCache = false,
): Promise<any> => {
  const url = `/repos/${owner}/${repoName}/compare/${baseBranch}...${headBranch}`;
  const cacheKey = getCacheKey(url);

  if (!bypassCache) {
    const cached = getCachedData(cacheKey, getCacheDuration(url));
    if (cached !== null) return cached;
  }

  try {
    const response = await githubApi.get(
      `/repos/${owner}/${repoName}/compare/${baseBranch}...${headBranch}`,
    );
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.warn(
      `Error comparing branches ${baseBranch}...${headBranch}:`,
      (error as Error).message,
    );
    return null;
  }
};

export const fetchBranchStatus = async (
  owner: string,
  repoName: string,
  sha: string,
  bypassCache = false,
): Promise<any> => {
  const url = `/repos/${owner}/${repoName}/commits/${sha}/status`;
  const cacheKey = getCacheKey(url);

  if (!bypassCache) {
    const cached = getCachedData(cacheKey, getCacheDuration(url));
    if (cached !== null) return cached;
  }

  try {
    const response = await githubApi.get(
      `/repos/${owner}/${repoName}/commits/${sha}/status`,
    );
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.warn(
      `Error fetching status for commit ${sha}:`,
      (error as Error).message,
    );
    return null;
  }
};

export const fetchBranchChecks = async (
  owner: string,
  repoName: string,
  ref: string,
  bypassCache = false,
): Promise<{ check_runs: GitHubCheckRun[] } | null> => {
  const url = `/repos/${owner}/${repoName}/commits/${ref}/check-runs`;
  const cacheKey = getCacheKey(url);

  if (!bypassCache) {
    const cached = getCachedData<{ check_runs: GitHubCheckRun[] }>(
      cacheKey,
      getCacheDuration(url),
    );
    if (cached !== null) return cached;
  }

  try {
    const response = await githubApi.get<{ check_runs: GitHubCheckRun[] }>(
      `/repos/${owner}/${repoName}/commits/${ref}/check-runs`,
    );
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.warn(
      `Error fetching check runs for ${ref}:`,
      (error as Error).message,
    );
    return null;
  }
};

export const fetchPullRequests = async (
  owner: string,
  repoName: string,
  head: string,
  bypassCache = false,
): Promise<GitHubPullRequest[]> => {
  const url = `/repos/${owner}/${repoName}/pulls?head=${owner}:${head}&state=open`;
  const cacheKey = getCacheKey(url);

  if (!bypassCache) {
    const cached = getCachedData<GitHubPullRequest[]>(
      cacheKey,
      getCacheDuration(url),
    );
    if (cached !== null) return cached;
  }

  try {
    const response = await githubApi.get<GitHubPullRequest[]>(
      `/repos/${owner}/${repoName}/pulls`,
      {
        params: {
          head: `${owner}:${head}`,
          state: 'open',
        },
      },
    );
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.warn(
      `Error fetching pull requests for ${head}:`,
      (error as Error).message,
    );
    return [];
  }
};

export const fetchBranches = async (
  owner: string,
  repoName: string,
  page = 1,
  perPage = 20,
  bypassCache = false,
): Promise<{
  branches: GitHubBranch[];
  hasNextPage: boolean;
  totalCount?: number;
}> => {
  const url = `/repos/${owner}/${repoName}/branches`;
  const cacheKey = getCacheKey(url, { page, perPage });

  if (!bypassCache) {
    const cached = getCachedData<{
      branches: GitHubBranch[];
      hasNextPage: boolean;
      totalCount?: number;
    }>(cacheKey, getCacheDuration(url));
    if (cached !== null) return cached;
  }

  try {
    const response = await githubApi.get<GitHubBranch[]>(
      `/repos/${owner}/${repoName}/branches`,
      {
        params: {
          per_page: perPage,
          page,
        },
      },
    );

    // Check if there's a next page by looking at Link header
    const linkHeader = response.headers['link'];
    const hasNextPage =
      linkHeader !== undefined && linkHeader !== null
        ? linkHeader.includes('rel="next"')
        : false;

    const result = {
      branches: response.data,
      hasNextPage,
      totalCount: undefined, // GitHub doesn't provide total count for branches endpoint
    };

    setCachedData(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`Error fetching branches for ${owner}/${repoName}:`, error);
    throw error;
  }
};

export const fetchCommit = async (
  url: string,
  bypassCache = false,
): Promise<GitHubCommit | null> => {
  const cacheKey = getCacheKey(url);

  if (!bypassCache) {
    const cached = getCachedData<GitHubCommit>(cacheKey, getCacheDuration(url));
    if (cached !== null) return cached;
  }

  try {
    const response = await axios.get<GitHubCommit>(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(GITHUB_TOKEN !== null &&
          GITHUB_TOKEN !== undefined && {
            Authorization: `token ${GITHUB_TOKEN}`,
          }),
      },
    });
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    // Don't throw error for individual commits, just return null
    console.warn(`Error fetching commit:`, (error as Error).message);
    return null;
  }
};

export const fetchReadme = async (
  owner: string,
  repoName: string,
  bypassCache = false,
): Promise<string | null> => {
  const cacheKey = getCacheKey(`/repos/${owner}/${repoName}/readme`);

  if (!bypassCache) {
    const cached = getCachedData<string>(cacheKey);
    if (cached !== null) return cached;
  }

  try {
    const response = await githubApi.get<string>(
      `/repos/${owner}/${repoName}/readme`,
      {
        headers: {
          Accept: 'application/vnd.github.v3.raw',
          ...(GITHUB_TOKEN !== null &&
            GITHUB_TOKEN !== undefined && {
              Authorization: `token ${GITHUB_TOKEN}`,
            }),
        },
      },
    );
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching README for ${owner}/${repoName}:`, error);
    return null;
  }
};

export const fetchReadmeAsHtml = async (
  owner: string,
  repoName: string,
  bypassCache = false,
): Promise<string | null> => {
  const cacheKey = getCacheKey(`github-html-${owner}-${repoName}-readme`);

  if (!bypassCache) {
    const cached = getCachedData<string>(cacheKey);
    if (cached !== null) return cached;
  }

  try {
    // First, get the raw markdown content
    const markdownContent = await fetchReadme(owner, repoName, bypassCache);
    if (markdownContent === null) return null;

    // Then, render it using GitHub's markdown API
    const response = await githubApi.post<string>(
      '/markdown',
      {
        text: markdownContent,
        mode: 'gfm',
        context: `${owner}/${repoName}`,
      },
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          ...(GITHUB_TOKEN !== null &&
            GITHUB_TOKEN !== undefined && {
              Authorization: `token ${GITHUB_TOKEN}`,
            }),
        },
      },
    );

    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching README HTML for ${owner}/${repoName}:`,
      error,
    );
    // Fallback to raw markdown if HTML rendering fails
    return fetchReadme(owner, repoName, bypassCache);
  }
};

// Rate limit check function
export const checkRateLimit = async (): Promise<
  RateLimitResponse['resources']['core'] | null
> => {
  try {
    const response = await githubApi.get<RateLimitResponse>('/rate_limit');
    return response.data.resources.core;
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return null;
  }
};
