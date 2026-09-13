import * as t from 'ts-fortress';

/**
 * `repo-settings/environments/*.json` の型。
 *
 * Settings > Environments の 1 件に対応する。ファイルは「その環境の望ましい
 * 状態」を丸ごと表しており、 GitHub 側で 2 つに分かれている次の API をまとめて
 * 1 ファイルで管理する:
 *
 * - `PUT /repos/{owner}/{repo}/environments/{environment_name}`
 * - `GET|POST|DELETE /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies`
 *
 * GET が返す `protection_rules` は「有効な保護ルールだけが並ぶ配列」だが、この
 * 型は書き込み側（ PUT の body ）に合わせた平らな形にしている。往復させる側の
 * 形を正とするほうが、ファイルを読んで何が起きるか分かりやすいため。
 */
export const EnvironmentSettings = t.record({
  name: t.string(''),

  /** 「 Wait timer 」。分。 0 なら待たない。 */
  wait_timer: t.number(0),

  /** 「 Prevent self-review 」。 */
  prevent_self_review: t.boolean(false),

  /** 「 Required reviewers 」。空配列なら承認は要らない。 */
  reviewers: t.array(
    t.record({
      type: t.enumType(['User', 'Team'], {
        typeName: 'EnvironmentReviewerType',
        defaultValue: 'User',
      }),
      id: t.number(0),
    }),
    { typeName: 'EnvironmentReviewers' },
  ),

  /**
   * 「 Deployment branches and tags 」の選択。
   *
   * - `null` … 「 No restriction 」（ どの ref からでも deploy できる ）
   * - `protected_branches: true` … 「 Protected branches only 」
   * - `custom_branch_policies: true` … 「 Selected branches and tags 」。
   *   具体的な pattern は下の `deployment_branch_policies` 。
   *
   * 2 つを同時に `true` にはできない。
   */
  deployment_branch_policy: t.union(
    [
      t.record({
        protected_branches: t.boolean(false),
        custom_branch_policies: t.boolean(true),
      }),
      t.nullType,
    ],
    { typeName: 'DeploymentBranchPolicySelection' },
  ),

  /**
   * `custom_branch_policies` が `true` のときの pattern 一覧。
   *
   * それ以外のときは空配列でなければならない ( `applyEnvironments` が拒否する )。
   * GitHub 側は別エンドポイントだが、「どの ref から deploy できるか」を
   * 決めているのは選択と pattern の組で、片方だけ見ても意味を成さない。
   */
  deployment_branch_policies: t.array(
    t.record({
      name: t.string(''),
      type: t.enumType(['branch', 'tag'], {
        typeName: 'DeploymentBranchPolicyType',
        defaultValue: 'branch',
      }),
    }),
    { typeName: 'DeploymentBranchPolicies' },
  ),
});

export type EnvironmentSettings = t.TypeOf<typeof EnvironmentSettings>;
