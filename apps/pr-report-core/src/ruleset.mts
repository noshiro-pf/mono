/** What `repo-settings/rulesets/main.json` asks of a pull request. */

import type { components } from '@octokit/openapi-types';
import { Arr, expectType, Json, Result } from 'ts-data-forge';
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
  /** Whether every review conversation has to be resolved first. */
  requireConversationResolution: boolean;
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

  return Result.ok(requirementsOfRules(validated.value.rules));
};

/**
 * The requirements a list of rules adds up to: the contexts of every
 * `required_status_checks` rule, and a review requirement wherever any
 * `pull_request` rule asks for it. The list is a ruleset's `rules`, or what
 * `GET /repos/{owner}/{repo}/rules/branches/{branch}` answers — every rule of
 * every ruleset that applies to the branch, which is what `unblock-prs` reads
 * because it is what GitHub enforces rather than what was declared. A rule of
 * any other kind, or one whose parameters are not the expected shape, adds
 * nothing.
 */
export const requirementsOfRules = (
  rules: readonly unknown[],
): RulesetRequirements =>
  ({
    requiredContexts: Arr.uniq(
      rules.flatMap((rule) => {
        const status = RequiredStatusChecksRuleSchema.validate(rule);

        return Result.isErr(status)
          ? []
          : status.value.parameters.required_status_checks.map(
              ({ context }) => context,
            );
      }),
    ),
    requireCodeOwnerReview: rules.some((rule) => {
      const review = CodeOwnerReviewRuleSchema.validate(rule);

      return (
        Result.isOk(review) && review.value.parameters.require_code_owner_review
      );
    }),
    requireConversationResolution: rules.some((rule) => {
      const review = ConversationResolutionRuleSchema.validate(rule);

      return (
        Result.isOk(review) &&
        review.value.parameters.required_review_thread_resolution
      );
    }),
  }) as const;

const RulesetSchema = t.record({ rules: t.array(t.unknown()) });

/**
 * One rule of the several kinds a ruleset holds. The others carry entirely
 * different parameters, so each rule is tried against this and the ones that
 * do not match are simply not the rule being looked for.
 *
 * Written here rather than taken from `octokit-safe-types`, whose
 * `RepositoryRule` is the whole union: validating against it would refuse a
 * kind of rule GitHub adds before that union has it, where this ignores one,
 * and the page would carry the whole union to the browser for three fields.
 * GitHub's own types still hold the fields read to their shape, below.
 */
const RequiredStatusChecksRuleSchema = t.record({
  type: t.literal('required_status_checks'),
  parameters: t.record({
    required_status_checks: t.array(t.record({ context: t.string() })),
  }),
});

const CodeOwnerReviewRuleSchema = t.record({
  type: t.literal('pull_request'),
  parameters: t.record({ require_code_owner_review: t.boolean() }),
});

const ConversationResolutionRuleSchema = t.record({
  type: t.literal('pull_request'),
  parameters: t.record({ required_review_thread_resolution: t.boolean() }),
});

/**
 * Each rule as GitHub's API description types it, with the parameters it may
 * omit present: a rule of that shape has to be one the schema above accepts,
 * so a field read here that GitHub renames or retypes fails the type check.
 */
type WithParameters<R extends Readonly<{ parameters?: unknown }>> = R &
  Readonly<{ parameters: NonNullable<R['parameters']> }>;

type GitHubRule<
  K extends
    'repository-rule-pull-request' | 'repository-rule-required-status-checks',
> = WithParameters<components['schemas'][K]>;

expectType<
  GitHubRule<'repository-rule-required-status-checks'>,
  t.TypeOf<typeof RequiredStatusChecksRuleSchema>
>('<=');

expectType<
  GitHubRule<'repository-rule-pull-request'>,
  t.TypeOf<typeof CodeOwnerReviewRuleSchema>
>('<=');

expectType<
  GitHubRule<'repository-rule-pull-request'>,
  t.TypeOf<typeof ConversationResolutionRuleSchema>
>('<=');
