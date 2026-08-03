import * as t from 'ts-fortress';

/**
 * `github/actions-settings/settings.json` の型。
 *
 * Settings > Actions > General に対応する。 2 つの API をまとめて 1 ファイルで
 * 管理する:
 *
 * - `GET|PUT /repos/{owner}/{repo}/actions/permissions`
 * - `GET|PUT /repos/{owner}/{repo}/actions/permissions/fork-pr-contributor-approval`
 */
export const ActionsSettings = t.record({
  /** Actions permissions: この repository で Actions を有効にするか。 */
  enabled: t.boolean(true),

  /** Actions permissions: 実行を許可する action の範囲。 */
  allowed_actions: t.enumType(['all', 'local_only', 'selected'], {
    typeName: 'AllowedActions',
    defaultValue: 'all',
  }),

  /**
   * 「 Require actions to be pinned to a full-length commit SHA 」。
   *
   * NOTE: @octokit/types v16 時点でこのフィールドは型定義に入っていないため、
   * リクエスト時にのみ手当てしている（ set-actions-permissions.mts 参照）。
   */
  sha_pinning_required: t.boolean(false),

  /**
   * 「 Approval for running fork pull request workflows from contributors 」。
   *
   * - `first_time_contributors_new_to_github`: GitHub 自体に不慣れな初回貢献者のみ承認必須
   * - `first_time_contributors`: この repository への初回貢献者のみ承認必須
   * - `all_external_contributors`: 外部貢献者すべてに承認必須
   */
  fork_pr_contributor_approval_policy: t.enumType(
    [
      'first_time_contributors_new_to_github',
      'first_time_contributors',
      'all_external_contributors',
    ],
    {
      typeName: 'ForkPrContributorApprovalPolicy',
      defaultValue: 'all_external_contributors',
    },
  ),
});

export type ActionsSettings = t.TypeOf<typeof ActionsSettings>;
