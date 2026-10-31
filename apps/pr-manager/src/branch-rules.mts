/**
 * What GitHub enforces on a branch: the contexts a pull request into it has
 * to pass, and whether a code owner has to approve it.
 *
 * **Read from GitHub rather than from a file in the repository**, so that
 * any repository is judged by the rules it has: every ruleset that applies to
 * the branch (`GET /repos/{owner}/{repo}/rules/branches/{branch}`), which is
 * what `unblock-prs` reads too, and the contexts a classic branch protection
 * rule requires (`GET /repos/{owner}/{repo}/branches/{branch}`). Neither wants
 * more than reading the repository — `metadata` and `contents` read, which a
 * token with no scopes has on a public one — where the endpoints that list a
 * ruleset's own settings or a protection rule's whole want an admin.
 *
 * What a classic rule says about reviews is not among what the second answers,
 * so a code owner's approval is waited for only where a ruleset asks for it.
 *
 * **REST, as the workflow runs are** (`workflow-runs.mts`): its own budget,
 * and `no-cache`, so that the answer the browser kept is revalidated and a
 * `304` costs nothing — which is every read but the first, since rules seldom
 * change.
 */

import { requirementsOfRules, type RulesetRequirements } from 'pr-report-core';
import { Arr, Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { ReportSource } from './constants.mjs';
import type { RestFetch } from './workflow-runs.mjs';

export type BranchRulesRequest = Readonly<{
  token: string;
  fetchImpl?: RestFetch;
}>;

/**
 * The requirements on `branch`, or a sentence a reader can act on. Either
 * request failing fails it: a list of required contexts missing half of them
 * would be read as the whole.
 */
export const loadBranchRules = async (
  source: ReportSource,
  branch: string,
  request: BranchRulesRequest,
): Promise<Result<RulesetRequirements, string>> => {
  const { token, fetchImpl = askGitHub } = request;

  const repoRoute =
    `https://api.github.com/repos/${source.owner}/${source.repo}` as const;

  // One path segment, whatever the name holds: `release/1.x` included. The
  // rule's premise, building a query string, is not what this is.
  // eslint-disable-next-line no-restricted-globals
  const segment = encodeURIComponent(branch);

  const [rules, branchAnswer] = await Promise.all([
    getJson(
      `${repoRoute}/rules/branches/${segment}?per_page=${RULES_PER_PAGE}`,
      RulesSchema,
      `the rules on ${branch}`,
      token,
      fetchImpl,
    ),
    getJson(
      `${repoRoute}/branches/${segment}`,
      BranchSchema,
      `the protection of ${branch}`,
      token,
      fetchImpl,
    ),
  ]);

  if (Result.isErr(rules)) {
    return rules;
  }

  if (Result.isErr(branchAnswer)) {
    return branchAnswer;
  }

  const fromRulesets = requirementsOfRules(rules.value);

  const classic = branchAnswer.value.protection?.required_status_checks;

  return Result.ok({
    ...fromRulesets,
    requiredContexts: Arr.uniq([
      ...fromRulesets.requiredContexts,
      ...(classic === undefined || classic.enforcement_level === 'off'
        ? []
        : classic.contexts),
    ]),
  });
};

/**
 * As many rules as a page holds. Each ruleset contributes a handful, so a
 * branch with more than a hundred is not one a person keeps.
 */
const RULES_PER_PAGE = 100;

const RulesSchema = t.array(t.unknown());

const BranchSchema = t.record({
  protection: t.optional(
    t.record({
      required_status_checks: t.optional(
        t.record({
          enforcement_level: t.string(),
          contexts: t.array(t.string()),
        }),
      ),
    }),
  ),
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
  const response = await fetchImpl(route, {
    method: 'GET',
    // Revalidated rather than refetched: see the top of this file.
    cache: 'no-cache',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  }).catch((error: unknown) => error);

  if (!(response instanceof Response)) {
    return Result.err(
      `Could not reach the GitHub API for ${what}. Check the connection and try again.`,
    );
  }

  if (!response.ok) {
    return Result.err(refusal(response, what));
  }

  const parsed = Json.parse(await response.text());

  if (Result.isErr(parsed)) {
    return Result.err(
      `GitHub answered ${what} with something that is not JSON.`,
    );
  }

  const validated = schema.validate(parsed.value);

  return Result.isErr(validated)
    ? Result.err(
        `GitHub's answer for ${what} is not the shape this page expects:\n${t.validationErrorsToMessages(validated.value).join('\n')}`,
      )
    : Result.ok(validated.value);
};

/**
 * Written as a wrapper rather than handed over bare, because `fetch`
 * detached from the global it belongs to is not callable in every engine.
 */
const askGitHub: RestFetch = async (route, init) => fetch(route, init);

const UNAUTHORIZED = 401;
