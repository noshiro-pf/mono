import * as t from 'ts-fortress';

// Shared pieces reused from request-side definitions (mirrored here to avoid cross-file exports)

const RepositoryRulesetBypassActor = t.strictRecord({
  actor_id: t.optional(t.union([t.number(), t.nullType])),
  actor_type: t.enumType([
    'Integration',
    'OrganizationAdmin',
    'RepositoryRole',
    'Team',
    'DeployKey',
  ]),
  bypass_mode: t.optional(t.enumType(['always', 'pull_request'])),
});

const RepositoryRulesetConditions = t.strictRecord({
  ref_name: t.optional(
    t.strictRecord({
      include: t.optional(t.array(t.string())),
      exclude: t.optional(t.array(t.string())),
    }),
  ),
});

// Organization ruleset conditions pieces

const OrgRulesetConditionsRepositoryNameTarget = t.strictRecord({
  repository_name: t.strictRecord({
    include: t.optional(t.array(t.string())),
    exclude: t.optional(t.array(t.string())),
    protected: t.optional(t.boolean()),
  }),
});

const OrgRulesetConditionsRepositoryIdTarget = t.strictRecord({
  repository_id: t.strictRecord({
    repository_ids: t.optional(t.array(t.number())),
  }),
});

const OrgRulesetConditionsRepositoryPropertySpec = t.strictRecord({
  name: t.string(),
  property_values: t.array(t.string()),
  source: t.optional(t.enumType(['custom', 'system'])),
});

const OrgRulesetConditionsRepositoryPropertyTarget = t.strictRecord({
  repository_property: t.strictRecord({
    include: t.optional(t.array(OrgRulesetConditionsRepositoryPropertySpec)),
    exclude: t.optional(t.array(OrgRulesetConditionsRepositoryPropertySpec)),
  }),
});

const OrgRulesetConditions = t.union([
  t.intersection(
    [RepositoryRulesetConditions, OrgRulesetConditionsRepositoryNameTarget],
    t.strictRecord({ repository_name: t.strictRecord({}) }),
  ),
  t.intersection(
    [RepositoryRulesetConditions, OrgRulesetConditionsRepositoryIdTarget],
    t.strictRecord({ repository_id: t.strictRecord({}) }),
  ),
  t.intersection(
    [RepositoryRulesetConditions, OrgRulesetConditionsRepositoryPropertyTarget],
    t.strictRecord({ repository_property: t.strictRecord({}) }),
  ),
]);

// Repository rule union — same as request definitions

const RepositoryRuleCreation = t.strictRecord({ type: t.literal('creation') });

const RepositoryRuleUpdate = t.strictRecord({
  type: t.literal('update'),
  parameters: t.optional(
    t.strictRecord({
      update_allows_fetch_and_merge: t.boolean(),
    }),
  ),
});

const RepositoryRuleDeletion = t.strictRecord({ type: t.literal('deletion') });

const RepositoryRuleRequiredLinearHistory = t.strictRecord({
  type: t.literal('required_linear_history'),
});

const RepositoryRuleMergeQueue = t.strictRecord({
  type: t.literal('merge_queue'),
  parameters: t.optional(
    t.strictRecord({
      check_response_timeout_minutes: t.number(),
      grouping_strategy: t.enumType(['ALLGREEN', 'HEADGREEN']),
      max_entries_to_build: t.number(),
      max_entries_to_merge: t.number(),
      merge_method: t.enumType(['MERGE', 'SQUASH', 'REBASE']),
      min_entries_to_merge: t.number(),
      min_entries_to_merge_wait_minutes: t.number(),
    }),
  ),
});

const RepositoryRuleRequiredDeployments = t.strictRecord({
  type: t.literal('required_deployments'),
  parameters: t.optional(
    t.strictRecord({ required_deployment_environments: t.array(t.string()) }),
  ),
});

const RepositoryRuleRequiredSignatures = t.strictRecord({
  type: t.literal('required_signatures'),
});

const RepositoryRulePullRequest = t.strictRecord({
  type: t.literal('pull_request'),
  parameters: t.optional(
    t.strictRecord({
      allowed_merge_methods: t.optional(
        t.array(t.enumType(['merge', 'squash', 'rebase'])),
      ),
      automatic_copilot_code_review_enabled: t.optional(t.boolean()),
      dismiss_stale_reviews_on_push: t.boolean(),
      require_code_owner_review: t.boolean(),
      require_last_push_approval: t.boolean(),
      required_approving_review_count: t.number(),
      required_review_thread_resolution: t.boolean(),
    }),
  ),
});

const RepositoryRuleRequiredStatusChecks = t.strictRecord({
  type: t.literal('required_status_checks'),
  parameters: t.optional(
    t.strictRecord({
      do_not_enforce_on_create: t.optional(t.boolean()),
      required_status_checks: t.array(
        t.strictRecord({
          context: t.string(),
          integration_id: t.optional(t.number()),
        }),
      ),
      strict_required_status_checks_policy: t.boolean(),
    }),
  ),
});

const RepositoryRuleNonFastForward = t.strictRecord({
  type: t.literal('non_fast_forward'),
});

const CommonPatternParameters = t.strictRecord({
  name: t.optional(t.string()),
  negate: t.optional(t.boolean()),
  operator: t.enumType(['starts_with', 'ends_with', 'contains', 'regex']),
  pattern: t.string(),
});

const RepositoryRuleCommitMessagePattern = t.strictRecord({
  type: t.literal('commit_message_pattern'),
  parameters: t.optional(CommonPatternParameters),
});

const RepositoryRuleCommitAuthorEmailPattern = t.strictRecord({
  type: t.literal('commit_author_email_pattern'),
  parameters: t.optional(CommonPatternParameters),
});

const RepositoryRuleCommitterEmailPattern = t.strictRecord({
  type: t.literal('committer_email_pattern'),
  parameters: t.optional(CommonPatternParameters),
});

const RepositoryRuleBranchNamePattern = t.strictRecord({
  type: t.literal('branch_name_pattern'),
  parameters: t.optional(CommonPatternParameters),
});

const RepositoryRuleTagNamePattern = t.strictRecord({
  type: t.literal('tag_name_pattern'),
  parameters: t.optional(CommonPatternParameters),
});

const RepositoryRuleFilePathRestriction = t.strictRecord({
  type: t.literal('file_path_restriction'),
  parameters: t.optional(
    t.strictRecord({ restricted_file_paths: t.array(t.string()) }),
  ),
});

const RepositoryRuleMaxFilePathLength = t.strictRecord({
  type: t.literal('max_file_path_length'),
  parameters: t.optional(t.strictRecord({ max_file_path_length: t.number() })),
});

const RepositoryRuleFileExtensionRestriction = t.strictRecord({
  type: t.literal('file_extension_restriction'),
  parameters: t.optional(
    t.strictRecord({ restricted_file_extensions: t.array(t.string()) }),
  ),
});

const RepositoryRuleMaxFileSize = t.strictRecord({
  type: t.literal('max_file_size'),
  parameters: t.optional(t.strictRecord({ max_file_size: t.number() })),
});

const WorkflowFileReference = t.strictRecord({
  path: t.string(),
  ref: t.optional(t.string()),
  repository_id: t.number(),
  sha: t.optional(t.string()),
});

const RepositoryRuleWorkflows = t.strictRecord({
  type: t.literal('workflows'),
  parameters: t.optional(
    t.strictRecord({
      do_not_enforce_on_create: t.optional(t.boolean()),
      workflows: t.array(WorkflowFileReference),
    }),
  ),
});

const CodeScanningTool = t.strictRecord({
  alerts_threshold: t.enumType([
    'none',
    'errors',
    'errors_and_warnings',
    'all',
  ]),
  security_alerts_threshold: t.enumType([
    'none',
    'critical',
    'high_or_higher',
    'medium_or_higher',
    'all',
  ]),
  tool: t.string(),
});

const RepositoryRuleCodeScanning = t.strictRecord({
  type: t.literal('code_scanning'),
  parameters: t.optional(
    t.strictRecord({ code_scanning_tools: t.array(CodeScanningTool) }),
  ),
});

const RepositoryRule = t.union([
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
]);

export const RepositoryRuleset = t.strictRecord({
  id: t.number(),
  name: t.string(),
  target: t.optional(t.enumType(['branch', 'tag', 'push', 'repository'])),
  source_type: t.optional(
    t.enumType(['Repository', 'Organization', 'Enterprise']),
  ),
  source: t.string(),
  enforcement: t.enumType(['disabled', 'active', 'evaluate']),
  bypass_actors: t.optional(t.array(RepositoryRulesetBypassActor)),
  current_user_can_bypass: t.optional(
    t.enumType(['always', 'pull_requests_only', 'never']),
  ),
  node_id: t.optional(t.string()),
  _links: t.optional(
    t.strictRecord({
      self: t.optional(
        t.strictRecord({
          href: t.optional(t.string()),
        }),
      ),
      html: t.optional(
        t.union([
          t.strictRecord({
            href: t.optional(t.string()),
          }),
          t.nullType,
        ]),
      ),
    }),
  ),
  conditions: t.optional(
    t.union([RepositoryRulesetConditions, OrgRulesetConditions, t.nullType]),
  ),
  rules: t.optional(t.array(RepositoryRule)),
  created_at: t.optional(t.string()),
  updated_at: t.optional(t.string()),
});

export type RepositoryRuleset = t.TypeOf<typeof RepositoryRuleset>;
