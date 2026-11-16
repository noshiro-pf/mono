/** What a report costs in requests, and what to do when GitHub's run out. */

/**
 * That the REST rate limit is spent, and what to do about it: set a token
 * without one; with one, wait. A token's hourly allowance depends on its kind
 * (an Actions `GITHUB_TOKEN` gets fewer requests than a personal one), so no
 * number is named for it.
 */
export const restRateLimitSpent = (token: string | undefined): string =>
  token === undefined
    ? (`The rate limit is spent: set GH_TOKEN or GITHUB_TOKEN to raise it from ${ANONYMOUS_REQUESTS_PER_HOUR} requests an hour.` as const)
    : 'The rate limit is spent, and resets within the hour.';

/** What GitHub's REST API allows an anonymous caller in an hour. */
export const ANONYMOUS_REQUESTS_PER_HOUR = 60;

/**
 * The fewest requests a report that reads checks asks for each open pull
 * request: the comparison with its base, the workflow runs, the check runs and
 * the commit statuses. A head whose check runs or workflow runs take more than
 * one page costs more, and the lists cost a few beside.
 */
export const REQUESTS_PER_PULL_WITH_CHECKS = 4;
