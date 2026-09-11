import { type EndpointKeys } from 'octokit-safe-types';
import { octokitHeaders, OWNER, REPO } from '../../constants.mjs';
import { octokit } from '../../octokit.mjs';
import { type EnvironmentSettings } from '../constants.mjs';
import { getDeploymentBranchPolicies } from './get-environments.mjs';

/**
 * 環境を JSON の内容に合わせる。無ければ作られる。
 *
 * `PUT` は保護ルールを丸ごと置き換えるので、省いたキーは「変更しない」ではなく
 * 「無効にする」になる。宣言ファイルをそのまま渡しているのはそのため —
 * 部分更新にすると、ファイルから消した設定が GitHub 側に残る。
 */
export const setEnvironment = async (
  settings: EnvironmentSettings,
): Promise<void> => {
  // https://docs.github.com/rest/deployments/environments#create-or-update-an-environment
  await octokit.request(
    'PUT /repos/{owner}/{repo}/environments/{environment_name}' satisfies EndpointKeys,
    {
      owner: OWNER,
      repo: REPO,
      environment_name: settings.name,
      headers: octokitHeaders,
      wait_timer: settings.wait_timer,
      prevent_self_review: settings.prevent_self_review,
      reviewers: settings.reviewers.map((reviewer) => ({
        type: reviewer.type,
        id: reviewer.id,
      })),
      deployment_branch_policy:
        settings.deployment_branch_policy === null
          ? null
          : {
              protected_branches:
                settings.deployment_branch_policy.protected_branches,
              custom_branch_policies:
                settings.deployment_branch_policy.custom_branch_policies,
            },
    },
  );

  await setDeploymentBranchPolicies(settings);
};

/**
 * 「 Selected branches and tags 」の pattern を宣言に合わせる。
 *
 * 個別の追加・削除しか無いエンドポイントなので、現在値との差分を取って埋める。
 * 名前と種別が一致するものは触らない — 消して作り直すと id が変わり、
 * その間だけ deploy できない ref ができる。
 */
const keyOf = (policy: Readonly<{ name: string; type: string }>): string =>
  `${policy.type}:${policy.name}`;

const setDeploymentBranchPolicies = async (
  settings: EnvironmentSettings,
): Promise<void> => {
  if (settings.deployment_branch_policy?.custom_branch_policies !== true) {
    // 選択されていないなら pattern は存在し得ない。 PUT 側が既に消している。
    return;
  }

  const current = await getDeploymentBranchPolicies(settings.name);

  const desiredKeys: ReadonlySet<string> = new Set(
    settings.deployment_branch_policies.map(keyOf),
  );

  const currentKeys: ReadonlySet<string> = new Set(current.map(keyOf));

  const toDelete = current.filter((p) => !desiredKeys.has(keyOf(p)));

  const toCreate = settings.deployment_branch_policies.filter(
    (p) => !currentKeys.has(keyOf(p)),
  );

  for (const policy of toDelete) {
    // https://docs.github.com/rest/deployments/branch-policies#delete-a-deployment-branch-policy
    await octokit.request(
      'DELETE /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}' satisfies EndpointKeys,
      {
        owner: OWNER,
        repo: REPO,
        environment_name: settings.name,
        branch_policy_id: policy.id,
        headers: octokitHeaders,
      },
    );
  }

  for (const policy of toCreate) {
    // https://docs.github.com/rest/deployments/branch-policies#create-a-deployment-branch-policy
    await octokit.request(
      'POST /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies' satisfies EndpointKeys,
      {
        owner: OWNER,
        repo: REPO,
        environment_name: settings.name,
        headers: octokitHeaders,
        name: policy.name,
        type: policy.type,
      },
    );
  }
};
