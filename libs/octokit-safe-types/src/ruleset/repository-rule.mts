import { type components } from '@octokit/openapi-types';
import { expectType } from 'ts-data-forge';
import * as t from 'ts-fortress';

const RepositoryRuleCreation = t.strictRecord({
  type: t.literal('creation'),
});

expectType<
  t.TypeOf<typeof RepositoryRuleCreation>,
  DeepReadonly<components['schemas']['repository-rule-creation']>
>('=');

const RepositoryRuleUpdate = t.strictRecord({
  type: t.literal('update'),
  parameters: t.optional(
    t.strictRecord({
      /** @description Branch can pull changes from its upstream repository */
      update_allows_fetch_and_merge: t.boolean(),
    }),
  ),
});

expectType<
  t.TypeOf<typeof RepositoryRuleUpdate>,
  DeepReadonly<components['schemas']['repository-rule-update']>
>('=');

const RepositoryRuleDeletion = t.strictRecord({
  type: t.literal('deletion'),
});

expectType<
  t.TypeOf<typeof RepositoryRuleDeletion>,
  DeepReadonly<components['schemas']['repository-rule-deletion']>
>('=');

const RepositoryRuleRequiredLinearHistory = t.strictRecord({
  type: t.literal('required_linear_history'),
});

expectType<
  t.TypeOf<typeof RepositoryRuleRequiredLinearHistory>,
  DeepReadonly<components['schemas']['repository-rule-required-linear-history']>
>('=');

const RepositoryRuleMergeQueue = t.strictRecord({
  type: t.literal('merge_queue'),
  parameters: t.optional(
    t.strictRecord({
      /** @description Maximum time for a required status check to report a conclusion. After this much time has elapsed, checks that have not reported a conclusion will be assumed to have failed */
      check_response_timeout_minutes: t.number(),

      /**
       * @description When set to ALLGREEN, the merge commit created by merge queue for each PR in the group must pass all required checks to merge. When set to HEADGREEN, only the commit at the head of the merge group, i.e. the commit containing changes from all of the PRs in the group, must pass its required checks to merge.
       * @enum {string}
       */
      grouping_strategy: t.enumType(['ALLGREEN', 'HEADGREEN']),

      /** @description Limit the number of queued pull requests requesting checks and workflow runs at the same time. */
      max_entries_to_build: t.number(),

      /** @description The maximum number of PRs that will be merged together in a group. */
      max_entries_to_merge: t.number(),

      /**
       * @description Method to use when merging changes from queued pull requests.
       * @enum {string}
       */
      merge_method: t.enumType(['MERGE', 'SQUASH', 'REBASE']),

      /** @description The minimum number of PRs that will be merged together in a group. */
      min_entries_to_merge: t.number(),

      /** @description The time merge queue should wait after the first PR is added to the queue for the minimum group size to be met. After this time has elapsed, the minimum group size will be ignored and a smaller group will be merged. */
      min_entries_to_merge_wait_minutes: t.number(),
    }),
  ),
});

expectType<
  t.TypeOf<typeof RepositoryRuleMergeQueue>,
  DeepReadonly<components['schemas']['repository-rule-merge-queue']>
>('=');

const RepositoryRuleRequiredDeployments = t.strictRecord({
  type: t.literal('required_deployments'),
  parameters: t.optional(
    t.strictRecord({
      /** @description The environments that must be successfully deployed to before branches can be merged. */
      required_deployment_environments: t.array(t.string()),
    }),
  ),
});

expectType<
  t.TypeOf<typeof RepositoryRuleRequiredDeployments>,
  DeepReadonly<components['schemas']['repository-rule-required-deployments']>
>('=');

const RepositoryRuleRequiredSignatures = t.strictRecord({
  type: t.literal('required_signatures'),
});

expectType<
  t.TypeOf<typeof RepositoryRuleRequiredSignatures>,
  DeepReadonly<components['schemas']['repository-rule-required-signatures']>
>('=');

const RepositoryRulePullRequest = t.strictRecord({
  type: t.literal('pull_request'),
  parameters: t.optional(
    t.strictRecord({
      /** @description Array of allowed merge methods. Allowed values include `merge`, `squash`, and `rebase`. At least one option must be enabled. */
      allowed_merge_methods: t.optional(
        t.array(t.enumType(['merge', 'squash', 'rebase'])),
      ),

      /** @description Automatically request review from Copilot for new pull requests, if the author has access to Copilot code review. */
      automatic_copilot_code_review_enabled: t.optional(t.boolean()),

      /** @description New, reviewable commits pushed will dismiss previous pull request review approvals. */
      dismiss_stale_reviews_on_push: t.boolean(),

      /** @description Require an approving review in pull requests that modify files that have a designated code owner. */
      require_code_owner_review: t.boolean(),

      /** @description Whether the most recent reviewable push must be approved by someone other than the person who pushed it. */
      require_last_push_approval: t.boolean(),

      /** @description The number of approving reviews that are required before a pull request can be merged. */
      required_approving_review_count: t.number(),

      /** @description All conversations on code must be resolved before a pull request can be merged. */
      required_review_thread_resolution: t.boolean(),
    }),
  ),
});

expectType<
  t.TypeOf<typeof RepositoryRulePullRequest>,
  DeepReadonly<components['schemas']['repository-rule-pull-request']>
>('=');

const RepositoryRuleRequiredStatusChecks = t.strictRecord({
  type: t.literal('required_status_checks'),
  parameters: t.optional(
    t.strictRecord({
      /** @description Allow repositories and branches to be created if a check would otherwise prohibit it. */
      do_not_enforce_on_create: t.optional(t.boolean()),

      /** @description Status checks that are required. */
      required_status_checks: t.array(
        t.strictRecord({
          /** @description The status check context name that must be present on the commit. */
          context: t.string(),

          /** @description The optional integration ID that this status check must originate from. */
          integration_id: t.optional(t.number()),
        }),
      ),

      /** @description Whether pull requests targeting a matching branch must be tested with the latest code. This setting will not take effect unless at least one status check is enabled. */
      strict_required_status_checks_policy: t.boolean(),
    }),
  ),
});

expectType<
  t.TypeOf<typeof RepositoryRuleRequiredStatusChecks>,
  DeepReadonly<components['schemas']['repository-rule-required-status-checks']>
>('=');

const RepositoryRuleNonFastForward = t.strictRecord({
  type: t.literal('non_fast_forward'),
});

expectType<
  t.TypeOf<typeof RepositoryRuleNonFastForward>,
  DeepReadonly<components['schemas']['repository-rule-non-fast-forward']>
>('=');

const CommonPatternParameters = t.strictRecord({
  /** @description How this rule will appear to users. */
  name: t.optional(t.string()),

  /** @description If true, the rule will fail if the pattern matches. */
  negate: t.optional(t.boolean()),

  /**
   * @description The operator to use for matching.
   * @enum {string}
   */
  operator: t.enumType(['starts_with', 'ends_with', 'contains', 'regex']),

  /** @description The pattern to match with. */
  pattern: t.string(),
});

const RepositoryRuleCommitMessagePattern = t.strictRecord({
  type: t.literal('commit_message_pattern'),
  parameters: t.optional(CommonPatternParameters),
});

expectType<
  t.TypeOf<typeof RepositoryRuleCommitMessagePattern>,
  DeepReadonly<components['schemas']['repository-rule-commit-message-pattern']>
>('=');

const RepositoryRuleCommitAuthorEmailPattern = t.strictRecord({
  type: t.literal('commit_author_email_pattern'),
  parameters: t.optional(CommonPatternParameters),
});

expectType<
  t.TypeOf<typeof RepositoryRuleCommitAuthorEmailPattern>,
  DeepReadonly<
    components['schemas']['repository-rule-commit-author-email-pattern']
  >
>('=');

const RepositoryRuleCommitterEmailPattern = t.strictRecord({
  type: t.literal('committer_email_pattern'),
  parameters: t.optional(CommonPatternParameters),
});

expectType<
  t.TypeOf<typeof RepositoryRuleCommitterEmailPattern>,
  DeepReadonly<components['schemas']['repository-rule-committer-email-pattern']>
>('=');

const RepositoryRuleBranchNamePattern = t.strictRecord({
  type: t.literal('branch_name_pattern'),
  parameters: t.optional(CommonPatternParameters),
});

expectType<
  t.TypeOf<typeof RepositoryRuleBranchNamePattern>,
  DeepReadonly<components['schemas']['repository-rule-branch-name-pattern']>
>('=');

const RepositoryRuleTagNamePattern = t.strictRecord({
  type: t.literal('tag_name_pattern'),
  parameters: t.optional(CommonPatternParameters),
});

expectType<
  t.TypeOf<typeof RepositoryRuleTagNamePattern>,
  DeepReadonly<components['schemas']['repository-rule-tag-name-pattern']>
>('=');

const RepositoryRuleFilePathRestriction = t.strictRecord({
  type: t.literal('file_path_restriction'),
  parameters: t.optional(
    t.strictRecord({
      /** @description The file paths that are restricted from being pushed to the commit graph. */
      restricted_file_paths: t.array(t.string()),
    }),
  ),
});

expectType<
  t.TypeOf<typeof RepositoryRuleFilePathRestriction>,
  DeepReadonly<components['schemas']['repository-rule-file-path-restriction']>
>('=');

const RepositoryRuleMaxFilePathLength = t.strictRecord({
  type: t.literal('max_file_path_length'),
  parameters: t.optional(
    t.strictRecord({
      /** @description The maximum amount of characters allowed in file paths. */
      max_file_path_length: t.number(),
    }),
  ),
});

expectType<
  t.TypeOf<typeof RepositoryRuleMaxFilePathLength>,
  DeepReadonly<components['schemas']['repository-rule-max-file-path-length']>
>('=');

const RepositoryRuleFileExtensionRestriction = t.strictRecord({
  type: t.literal('file_extension_restriction'),
  parameters: t.optional(
    t.strictRecord({
      /** @description The file extensions that are restricted from being pushed to the commit graph. */
      restricted_file_extensions: t.array(t.string()),
    }),
  ),
});

expectType<
  t.TypeOf<typeof RepositoryRuleFileExtensionRestriction>,
  DeepReadonly<
    components['schemas']['repository-rule-file-extension-restriction']
  >
>('=');

const RepositoryRuleMaxFileSize = t.strictRecord({
  type: t.literal('max_file_size'),
  parameters: t.optional(
    t.strictRecord({
      /** @description The maximum file size allowed in megabytes. This limit does not apply to Git Large File Storage (Git LFS). */
      max_file_size: t.number(),
    }),
  ),
});

expectType<
  t.TypeOf<typeof RepositoryRuleMaxFileSize>,
  DeepReadonly<components['schemas']['repository-rule-max-file-size']>
>('=');

const WorkflowFileReference = t.strictRecord({
  /** @description The path to the workflow file */
  path: t.string(),

  /** @description The ref (branch or tag) of the workflow file to use */
  ref: t.optional(t.string()),

  /** @description The ID of the repository where the workflow is defined */
  repository_id: t.number(),

  /** @description The commit SHA of the workflow file to use */
  sha: t.optional(t.string()),
});

const RepositoryRuleWorkflows = t.strictRecord({
  type: t.literal('workflows'),
  parameters: t.optional(
    t.strictRecord({
      /** @description Allow repositories and branches to be created if a check would otherwise prohibit it. */
      do_not_enforce_on_create: t.optional(t.boolean()),

      /** @description Workflows that must pass for this rule to pass. */
      workflows: t.array(WorkflowFileReference),
    }),
  ),
});

expectType<
  t.TypeOf<typeof RepositoryRuleWorkflows>,
  DeepReadonly<components['schemas']['repository-rule-workflows']>
>('=');

const CodeScanningTool = t.strictRecord({
  /**
   * @description The severity level at which code scanning results that raise alerts block a reference update.
   * @enum {string}
   */
  alerts_threshold: t.enumType([
    'none',
    'errors',
    'errors_and_warnings',
    'all',
  ]),

  /**
   * @description The severity level at which code scanning results that raise security alerts block a reference update.
   * @enum {string}
   */
  security_alerts_threshold: t.enumType([
    'none',
    'critical',
    'high_or_higher',
    'medium_or_higher',
    'all',
  ]),

  /** @description The name of a code scanning tool */
  tool: t.string(),
});

const RepositoryRuleCodeScanning = t.strictRecord({
  type: t.literal('code_scanning'),
  parameters: t.optional(
    t.strictRecord({
      /** @description Tools that must provide code scanning results for this rule to pass. */
      code_scanning_tools: t.array(CodeScanningTool),
    }),
  ),
});

expectType<
  t.TypeOf<typeof RepositoryRuleCodeScanning>,
  DeepReadonly<components['schemas']['repository-rule-code-scanning']>
>('=');

const RepositoryRuleCopilotCodeReview = t.strictRecord({
  type: t.literal('copilot_code_review'),
  parameters: t.optional(
    t.partial(
      t.strictRecord({
        review_on_push: t.boolean(),
        review_draft_pull_requests: t.boolean(),
      }),
    ),
  ),
});

export const RepositoryRule = t.union([
  RepositoryRuleCreation,
  RepositoryRuleUpdate,
  RepositoryRuleDeletion,
  RepositoryRuleRequiredLinearHistory,
  RepositoryRuleMergeQueue,
  RepositoryRuleRequiredDeployments,
  RepositoryRuleRequiredSignatures,
  RepositoryRulePullRequest,
  RepositoryRuleRequiredStatusChecks,
  RepositoryRuleNonFastForward,
  RepositoryRuleCommitMessagePattern,
  RepositoryRuleCommitAuthorEmailPattern,
  RepositoryRuleCommitterEmailPattern,
  RepositoryRuleBranchNamePattern,
  RepositoryRuleTagNamePattern,
  RepositoryRuleFilePathRestriction,
  RepositoryRuleMaxFilePathLength,
  RepositoryRuleFileExtensionRestriction,
  RepositoryRuleMaxFileSize,
  RepositoryRuleWorkflows,
  RepositoryRuleCodeScanning,
  RepositoryRuleCopilotCodeReview,
]);

expectType<
  t.TypeOf<typeof RepositoryRule>,
  DeepReadonly<components['schemas']['repository-rule']>
>('=');
