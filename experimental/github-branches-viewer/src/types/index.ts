// Repository types
export type Repository = {
  id: string;
  name: string;
  owner: string;
};

// GitHub API types
export type GitHubRepository = {
  default_branch: string;
  name: string;
  owner: {
    login: string;
  };
  description?: string;
  homepage?: string;
  html_url: string;
};

export type GitHubBranch = {
  name: string;
  protected: boolean;
  commit: {
    sha: string;
    url: string;
  };
};

export type GitHubCommit = {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author?: {
    login: string;
    avatar_url: string;
  };
};

export type GitHubCheckRun = {
  id: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion:
    | 'success'
    | 'failure'
    | 'neutral'
    | 'cancelled'
    | 'skipped'
    | 'timed_out'
    | 'action_required'
    | null;
  html_url: string;
  details_url?: string;
  started_at?: string;
  completed_at?: string;
  output?: {
    title: string;
    summary: string;
  };
};

export type GitHubCheckSuites = {
  total_count: number;
  check_suites: {
    id: number;
    status: 'queued' | 'in_progress' | 'completed';
    conclusion:
      | 'success'
      | 'failure'
      | 'neutral'
      | 'cancelled'
      | 'skipped'
      | 'timed_out'
      | 'action_required'
      | null;
  }[];
};

export type GitHubPullRequest = {
  number: number;
  title: string;
  html_url: string;
  state: 'open' | 'closed';
  draft: boolean;
  merged: boolean;
  user: {
    login: string;
  };
};

export type BranchInfo = {
  name: string;
  protected: boolean;
  commit: {
    sha: string;
    message: string;
    date: string | null;
    author: {
      name: string;
      email: string;
    } | null;
    authorLogin?: string;
    authorAvatar?: string;
  };
  ahead?: number;
  behind?: number;
  status?: string | null;
  checkStatus?: string;
  checks?: {
    total: number;
    passing: number;
    failing: number;
    pending: number;
    successful?: number;
    failed?: number;
    runs: GitHubCheckRun[];
  } | null;
  pullRequests?: GitHubPullRequest[];
  pullRequest?: GitHubPullRequest | null;
};

// Rate limit types
export type RateLimit = {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
};

export type RateLimitResponse = {
  resources: {
    core: RateLimit;
    search: RateLimit;
    graphql: RateLimit;
  };
};

// Cache types
export type CacheEntry<T = unknown> = {
  data: T;
  timestamp: number;
};
