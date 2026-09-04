import { type operations, type paths } from '@octokit/openapi-types';
import { expectType } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { type DeepReadonly } from 'ts-type-forge';

const SecurityAndAnalysisForRequest = t.union([
  t.record({
    advanced_security: t.optional(t.record({ status: t.optional(t.string()) })),
    code_security: t.optional(t.record({ status: t.optional(t.string()) })),
    secret_scanning: t.optional(t.record({ status: t.optional(t.string()) })),
    secret_scanning_push_protection: t.optional(
      t.record({ status: t.optional(t.string()) }),
    ),
    secret_scanning_ai_detection: t.optional(
      t.record({ status: t.optional(t.string()) }),
    ),
    secret_scanning_non_provider_patterns: t.optional(
      t.record({ status: t.optional(t.string()) }),
    ),
    secret_scanning_delegated_alert_dismissal: t.optional(
      t.record({ status: t.optional(t.string()) }),
    ),
    secret_scanning_delegated_bypass: t.optional(
      t.record({ status: t.optional(t.string()) }),
    ),

    /**
     * @description Feature options for secret scanning delegated bypass.
     * This object is only honored when `security_and_analysis.secret_scanning_delegated_bypass.status` is set to `enabled`.
     * You can send this object in the same request as `secret_scanning_delegated_bypass`, or update just the options in a separate request.
     */
    secret_scanning_delegated_bypass_options: t.optional(
      t.record({
        /**
         * @description The bypass reviewers for secret scanning delegated bypass.
         * If you omit this field, the existing set of reviewers is unchanged.
         */
        reviewers: t.optional(
          t.array(
            t.record({
              /** @description The ID of the team or role selected as a bypass reviewer */
              reviewer_id: t.number(),

              /**
               * @description The type of the bypass reviewer
               * @enum {string}
               */
              reviewer_type: t.enumType(['TEAM', 'ROLE']),

              /**
               * @description The bypass mode for the reviewer
               * @default ALWAYS
               * @enum {string}
               */
              mode: t.optional(t.enumType(['ALWAYS', 'EXEMPT'])),
            }),
          ),
        ),
      }),
    ),
  }),
  t.nullType,
]);

export const UpdateRepositoryRequest = t.record({
  name: t.optional(t.string()),
  description: t.optional(t.string()),
  homepage: t.optional(t.string()),
  private: t.optional(t.boolean()),
  visibility: t.optional(t.enumType(['public', 'private'])),
  security_and_analysis: t.optional(SecurityAndAnalysisForRequest),
  has_issues: t.optional(t.boolean()),
  has_projects: t.optional(t.boolean()),
  has_wiki: t.optional(t.boolean()),

  /**
   * @description Either `true` to allow pull requests for this repository or `false` to prevent pull requests.
   * @default true
   */
  has_pull_requests: t.optional(t.boolean()),

  /**
   * @description The policy that controls who can create pull requests for this repository: `all` or `collaborators_only`.
   * @enum {string}
   */
  pull_request_creation_policy: t.optional(
    t.enumType(['all', 'collaborators_only']),
  ),

  is_template: t.optional(t.boolean()),
  default_branch: t.optional(t.string()),
  allow_squash_merge: t.optional(t.boolean()),
  allow_merge_commit: t.optional(t.boolean()),
  allow_rebase_merge: t.optional(t.boolean()),
  allow_auto_merge: t.optional(t.boolean()),
  delete_branch_on_merge: t.optional(t.boolean()),
  allow_update_branch: t.optional(t.boolean()),
  use_squash_pr_title_as_default: t.optional(t.boolean()),
  squash_merge_commit_title: t.optional(
    t.enumType(['PR_TITLE', 'COMMIT_OR_PR_TITLE']),
  ),
  squash_merge_commit_message: t.optional(
    t.enumType(['PR_BODY', 'COMMIT_MESSAGES', 'BLANK']),
  ),
  merge_commit_title: t.optional(t.enumType(['PR_TITLE', 'MERGE_MESSAGE'])),
  merge_commit_message: t.optional(
    t.enumType(['PR_BODY', 'PR_TITLE', 'BLANK']),
  ),
  archived: t.optional(t.boolean()),
  allow_forking: t.optional(t.boolean()),
  web_commit_signoff_required: t.optional(t.boolean()),
});

export type UpdateRepositoryRequest = t.TypeOf<typeof UpdateRepositoryRequest>;

expectType<
  UpdateRepositoryRequest,
  DeepReadonly<
    Required<
      paths['/repos/{owner}/{repo}']['patch']
    >['requestBody']['content']['application/json']
  >
>('=');

expectType<paths['/repos/{owner}/{repo}']['patch'], operations['repos/update']>(
  '=',
);
