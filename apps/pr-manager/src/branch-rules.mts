/**
 * What GitHub enforces on a branch: the contexts a pull request into it has to
 * pass, and whether a code owner has to approve it.
 *
 * **Read from GitHub rather than from a file in the repository**, so that any
 * repository is judged by the rules it has: every ruleset that applies to the
 * branch (`GET /repos/{owner}/{repo}/rules/branches/{branch}`) and the contexts
 * a classic branch protection rule requires
 * (`GET /repos/{owner}/{repo}/branches/{branch}`), both read and added up by
 * `pr-report-core`'s `readBranchRequirements`, which `unblock-prs` and
 * `pr-report` use too. Neither wants more than reading the repository —
 * `metadata` and `contents` read, which a token with no scopes has on a public
 * one.
 *
 * **REST, as the workflow runs are** (`workflow-runs.mts`): its own budget, and
 * `no-cache`, so that the answer the browser kept is revalidated and a `304`
 * costs nothing — which is every read but the first, since rules seldom change.
 */

import {
  pushersOfActivityPage,
  readBranchRequirements,
  type RulesetRequirements,
} from 'pr-report-core';
import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { askAndRead, unreachable } from './answer-body.mjs';
import type { ReportSource } from './constants.mjs';
import type { RestFetch } from './workflow-runs.mjs';

export type BranchRulesRequest = Readonly<{
  token: string;
  fetchImpl?: RestFetch;
}>;

/**
 * The requirements on `branch` (`pr-report-core`'s `readBranchRequirements`),
 * or a sentence a reader can act on.
 */
export const loadBranchRules = async (
  source: ReportSource,
  branch: string,
  request: BranchRulesRequest,
): Promise<Result<RulesetRequirements, string>> => {
  const { token, fetchImpl = askGitHub } = request;

  const repoRoute =
    `https://api.github.com/repos/${source.owner}/${source.repo}` as const;

  return readBranchRequirements(branch, async (path, schema, what) =>
    getJson(`${repoRoute}${path}`, schema, what, token, fetchImpl),
  );
};

/**
 * Who pushed to `branch`, whose head is `head` (`pushersOfActivityPage` in
 * `pr-report-core`, which `unblock-prs` and the check that enforces
 * `CODEOWNERS` read the same way): one page of the repository's activity on it,
 * newest first, or why it could not be read. A request each, so it is asked
 * only where who pushed can change the answer (`pushersMatter`).
 */
export const loadPushers = async (
  source: ReportSource,
  branch: string,
  head: string,
  request: BranchRulesRequest,
): Promise<Result<readonly string[] | 'unknown', string>> => {
  const { token, fetchImpl = askGitHub } = request;

  const query = new URLSearchParams({
    ref: `refs/heads/${branch}`,
    direction: 'desc',
    per_page: ACTIVITY_PAGE_SIZE.toString(),
  });

  const read = await getJson(
    `https://api.github.com/repos/${source.owner}/${source.repo}/activity?${query.toString()}`,
    t.array(ActivitySchema),
    `who pushed to ${branch}`,
    token,
    fetchImpl,
  );

  return Result.map(read, (page) => pushersOfActivityPage(page, head));
};

const ACTIVITY_PAGE_SIZE = 100;

const ActivitySchema = t.record({
  activity_type: t.string(),
  before: t.string(),
  after: t.string(),
  actor: t.union([t.record({ login: t.string() }), t.nullType]),
});

/** As `workflow-runs.mts` words them. */
const refusal = (response: Response, what: string): string =>
  response.status === UNAUTHORIZED
    ? (`GitHub would not accept the token for ${what}. It may have expired or been revoked.` as const)
    : response.headers.get('x-ratelimit-remaining') === '0'
      ? (`The REST rate limit on this token's account is spent, so ${what} cannot be read. It resets within the hour.` as const)
      : (`GitHub answered ${response.status} ${response.statusText} for ${what}.` as const);

const getJson = async <A,>(
  route: string,
  schema: t.Type<A>,
  what: string,
  token: string,
  fetchImpl: RestFetch,
): Promise<Result<A, string>> => {
  const answered = await askAndRead(
    async (again) =>
      fetchImpl(route, {
        method: 'GET',
        // Revalidated rather than refetched: see the top of this file. Asked
        // again, it is the cached body that was bad.
        cache: again ? 'reload' : 'no-cache',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      }),
    what,
  );

  if (answered === undefined) {
    return Result.err(unreachable(what));
  }

  const { response, body: parsed } = answered;

  if (!response.ok) {
    return Result.err(refusal(response, what));
  }

  if (parsed === undefined || Result.isErr(parsed)) {
    return parsed ?? Result.err('GitHub sent no body.');
  }

  const validated = schema.validate(parsed.value);

  return Result.isErr(validated)
    ? Result.err(
        `GitHub's answer for ${what} is not the shape this page expects:\n${t.validationErrorsToMessages(validated.value).join('\n')}`,
      )
    : Result.ok(validated.value);
};

/**
 * Written as a wrapper rather than handed over bare, because `fetch` detached
 * from the global it belongs to is not callable in every engine.
 */
const askGitHub: RestFetch = async (route, init) => fetch(route, init);

const UNAUTHORIZED = 401;
