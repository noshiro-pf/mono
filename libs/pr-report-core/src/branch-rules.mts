/**
 * What GitHub enforces on a branch, read the one way every reader reads it:
 * every ruleset that applies to the branch
 * (`GET /repos/{owner}/{repo}/rules/branches/{branch}`), and the contexts a
 * classic branch protection rule requires
 * (`GET /repos/{owner}/{repo}/branches/{branch}`). Neither wants more than
 * reading the repository, where the endpoints that list a ruleset's own
 * settings or a protection rule's whole want an admin.
 *
 * What a classic rule says about reviews is not among what the second answers,
 * so a code owner's approval is waited for only where a ruleset asks for it.
 *
 * Nothing here talks to GitHub: the reader hands over its own way of asking.
 */

import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { requirementsOfRules, type RulesetRequirements } from './ruleset.mjs';

/**
 * One `GET`, by the reader's own transport. `path` is relative to
 * `/repos/{owner}/{repo}` and may carry a query string; `what` names the
 * request for a message.
 */
export type BranchRulesGet = <A>(
  path: string,
  schema: t.Type<A>,
  what: string,
) => Promise<Result<A, string>>;

/**
 * The requirements on `branch`, or why they could not be read. Either request
 * failing fails it: a list of required contexts missing half of them would be
 * read as the whole.
 */
export const readBranchRequirements = async (
  branch: string,
  get: BranchRulesGet,
): Promise<Result<RulesetRequirements, string>> => {
  // One path segment, whatever the name holds: `release/1.x` included. The
  // rule's premise, building a query string, is not what this is.
  // eslint-disable-next-line no-restricted-globals
  const segment = encodeURIComponent(branch);

  const [rules, branchAnswer] = await Promise.all([
    get(
      `/rules/branches/${segment}?per_page=${RULES_PER_PAGE}`,
      RulesSchema,
      `the rules on ${branch}`,
    ),
    get(`/branches/${segment}`, BranchSchema, `the protection of ${branch}`),
  ]);

  if (Result.isErr(rules)) {
    return rules;
  }

  if (Result.isErr(branchAnswer)) {
    return branchAnswer;
  }

  const fromRulesets = requirementsOfRules(rules.value);

  const protection = branchAnswer.value.protection;

  const classic =
    protection?.enabled === false
      ? undefined
      : protection?.required_status_checks;

  return Result.ok({
    ...fromRulesets,
    requiredContexts: Arr.uniq([
      ...fromRulesets.requiredContexts,
      // GitHub's description leaves the level out of what it promises, so one
      // not given is taken as enforcing.
      ...(classic === undefined || classic.enforcement_level === 'off'
        ? []
        : classic.contexts),
    ]),
  });
};

/**
 * As many rules as a page holds; GitHub's default is 30. Each ruleset
 * contributes a handful, so a branch with more than a hundred is not one a
 * person keeps.
 */
const RULES_PER_PAGE = 100;

const RulesSchema = t.array(t.unknown());

const BranchSchema = t.record({
  protection: t.optional(
    t.record({
      enabled: t.optional(t.boolean()),
      required_status_checks: t.optional(
        t.record({
          enforcement_level: t.optional(t.string()),
          contexts: t.array(t.string()),
        }),
      ),
    }),
  ),
});
