import { type EndpointKeys } from 'octokit-safe-types';
import { octokitHeaders, OWNER, REPO } from '../../constants.mjs';
import { octokit } from '../../octokit.mjs';
import { type ActionsSettings } from '../constants.mjs';

/** Settings > Actions > General を JSON の内容に合わせる。 */
export const setActionsSettings = async (
  settings: ActionsSettings,
): Promise<void> => {
  // https://docs.github.com/rest/actions/permissions#set-github-actions-permissions-for-a-repository
  //
  // NOTE: sha_pinning_required は @octokit/types v16 の型定義にまだ無い。 API は
  // 受け付けるので、いったん変数に束縛して渡している（オブジェクトリテラルを直接
  // 渡すと excess property check に引っかかるため）。型が追随したら不要になる。
  const permissionsParams = {
    owner: OWNER,
    repo: REPO,
    headers: octokitHeaders,
    enabled: settings.enabled,
    allowed_actions: settings.allowed_actions,
    sha_pinning_required: settings.sha_pinning_required,
  } as const;

  await octokit.request(
    'PUT /repos/{owner}/{repo}/actions/permissions' satisfies EndpointKeys,
    permissionsParams,
  );

  // https://docs.github.com/rest/actions/permissions#set-fork-pr-contributor-approval-permissions-for-a-repository
  await octokit.request(
    'PUT /repos/{owner}/{repo}/actions/permissions/fork-pr-contributor-approval' satisfies EndpointKeys,
    {
      owner: OWNER,
      repo: REPO,
      headers: octokitHeaders,
      approval_policy: settings.fork_pr_contributor_approval_policy,
    },
  );
};
