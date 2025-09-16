import { type operations, type paths } from '@octokit/openapi-types';
import { expectType } from 'ts-data-forge';
import * as t from 'ts-fortress';

const SecurityAndAnalysisForRequest = t.union([
  t.strictRecord({
    advanced_security: t.optional(
      t.strictRecord({ status: t.optional(t.string()) }),
    ),
    code_security: t.optional(
      t.strictRecord({ status: t.optional(t.string()) }),
    ),
    secret_scanning: t.optional(
      t.strictRecord({ status: t.optional(t.string()) }),
    ),
    secret_scanning_push_protection: t.optional(
      t.strictRecord({ status: t.optional(t.string()) }),
    ),
    secret_scanning_ai_detection: t.optional(
      t.strictRecord({ status: t.optional(t.string()) }),
    ),
    secret_scanning_non_provider_patterns: t.optional(
      t.strictRecord({ status: t.optional(t.string()) }),
    ),
  }),
  t.nullType,
]);

export const UpdateRepositoryRequest = t.strictRecord({
  name: t.optional(t.string()),
  description: t.optional(t.string()),
  homepage: t.optional(t.string()),
  private: t.optional(t.boolean()),
  visibility: t.optional(t.enumType(['public', 'private'])),
  security_and_analysis: t.optional(SecurityAndAnalysisForRequest),
  has_issues: t.optional(t.boolean()),
  has_projects: t.optional(t.boolean()),
  has_wiki: t.optional(t.boolean()),
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
