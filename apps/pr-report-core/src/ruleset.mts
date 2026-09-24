/** What `repo-settings/rulesets/main.json` asks of a pull request. */

import { Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';

/** Where the ruleset is declared, relative to the repository root. */
export const MAIN_RULESET_PATH = 'repo-settings/rulesets/main.json';

export type RulesetRequirements = Readonly<{
  /** The contexts a pull request has to satisfy. */
  requiredContexts: readonly string[];
  /**
   * Whether a change to a path `.github/CODEOWNERS` lists waits for one of
   * its owners to approve it.
   */
  requireCodeOwnerReview: boolean;
}>;

/**
 * The requirements, read from the declaration rather than from GitHub.
 *
 * The API that serves a ruleset wants an admin token, and the file is the
 * desired state anyway. The gap is that a file under `repo-settings/`
 * changes nothing until `pnpm run repo-settings:apply` runs, so a context
 * added here and not applied is reported as missing on every pull request —
 * which is a fair thing for a report to say out loud.
 *
 * `source` names the file in the messages, because the two readers have it
 * from different places: `pr-report` from the checkout, the page from `main`.
 */
export const parseRuleset = (
  text: string,
  source: string,
): Result<RulesetRequirements, string> => {
  const parsed = Json.parse(text);

  if (Result.isErr(parsed)) {
    return Result.err(`${source} is not valid JSON: ${parsed.value}`);
  }

  const validated = RulesetSchema.validate(parsed.value);

  if (Result.isErr(validated)) {
    return Result.err(
      `${source} has an unexpected shape:\n${t.validationErrorsToMessages(validated.value).join('\n')}`,
    );
  }

  const { rules } = validated.value;

  return Result.ok({
    requiredContexts: rules.flatMap((rule) => {
      const status = RequiredStatusChecksRuleSchema.validate(rule);

      return Result.isErr(status)
        ? []
        : status.value.parameters.required_status_checks.map(
            ({ context }) => context,
          );
    }),
    requireCodeOwnerReview: rules.some((rule) => {
      const review = PullRequestRuleSchema.validate(rule);

      return (
        Result.isOk(review) && review.value.parameters.require_code_owner_review
      );
    }),
  });
};

const RulesetSchema = t.record({ rules: t.array(t.unknown()) });

/**
 * One rule of the several kinds a ruleset holds. The others carry entirely
 * different parameters, so each rule is tried against this and the ones that
 * do not match are simply not the rule being looked for.
 */
const RequiredStatusChecksRuleSchema = t.record({
  type: t.literal('required_status_checks'),
  parameters: t.record({
    required_status_checks: t.array(t.record({ context: t.string() })),
  }),
});

const PullRequestRuleSchema = t.record({
  type: t.literal('pull_request'),
  parameters: t.record({ require_code_owner_review: t.boolean() }),
});
