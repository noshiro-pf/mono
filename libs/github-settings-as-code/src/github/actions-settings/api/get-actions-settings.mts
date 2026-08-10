import { type EndpointKeys } from 'octokit-safe-types';
import { octokitHeaders, OWNER, REPO } from '../../constants.mjs';
import { octokit } from '../../octokit.mjs';
import { ActionsSettings } from '../constants.mjs';

/**
 * Settings > Actions > General の現在値を取得する。
 *
 * 2 つのエンドポイントの結果を 1 つのオブジェクトにまとめる。
 */
export const getActionsSettings = async (): Promise<ActionsSettings> => {
  // https://docs.github.com/rest/actions/permissions#get-github-actions-permissions-for-a-repository
  const permissions = await octokit.request(
    'GET /repos/{owner}/{repo}/actions/permissions' satisfies EndpointKeys,
    { owner: OWNER, repo: REPO, headers: octokitHeaders },
  );

  // https://docs.github.com/rest/actions/permissions#get-fork-pr-contributor-approval-permissions-for-a-repository
  const forkPrApproval = await octokit.request(
    'GET /repos/{owner}/{repo}/actions/permissions/fork-pr-contributor-approval' satisfies EndpointKeys,
    { owner: OWNER, repo: REPO, headers: octokitHeaders },
  );

  // eslint-disable-next-line unicorn/no-array-fill-with-reference-type
  return ActionsSettings.fill({
    enabled: permissions.data.enabled,
    allowed_actions: permissions.data.allowed_actions,
    sha_pinning_required: permissions.data.sha_pinning_required,
    fork_pr_contributor_approval_policy: forkPrApproval.data.approval_policy,
  });
};
