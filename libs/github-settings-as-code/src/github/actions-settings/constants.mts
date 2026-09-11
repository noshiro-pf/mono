import * as t from 'ts-fortress';

/**
 * `repo-settings/actions-settings/settings.json` の型。
 *
 * Settings > Actions > General に対応する。 2 つの API をまとめて 1 ファイルで
 * 管理する:
 *
 * - `GET|PUT /repos/{owner}/{repo}/actions/permissions`
 * - `GET|PUT /repos/{owner}/{repo}/actions/permissions/workflow`
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
   * 「 Workflow permissions 」。 job が `permissions` を宣言しなかったときに
   * `GITHUB_TOKEN` が受け取る既定値。
   *
   * `read` にできるのは、 workflow 側が全て明示的に `permissions` を宣言して
   * いる場合だけ。宣言の無い job はこの既定値をそのまま受け取るため、
   * `write` のままだと「 branch の中身が何であれ書き込めるトークン」が
   * 渡る。 .github/workflows/type-check.yml 冒頭の注記を参照。
   */
  default_workflow_permissions: t.enumType(['read', 'write'], {
    typeName: 'DefaultWorkflowPermissions',
    defaultValue: 'read',
  }),

  /**
   * 「 Allow GitHub Actions to create and approve pull requests 」。
   *
   * `main` の ruleset は `required_approving_review_count` が 0 なので
   * 承認そのものは merge 条件ではないが、 Actions に PR を作らせる必要が
   * あるのは App token を使う workflow だけで、 `GITHUB_TOKEN` には要らない。
   */
  can_approve_pull_request_reviews: t.boolean(false),

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
