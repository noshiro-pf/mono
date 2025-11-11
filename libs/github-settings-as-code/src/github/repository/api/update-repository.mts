import {
  type EndpointKeys,
  type UpdateRepositoryRequest,
} from 'octokit-safe-types';
import { octokitHeaders, OWNER, REPO } from '../../constants.mjs';
import { octokit } from '../../octokit.mjs';

export const updateRepository = async ({
  payload: {
    name,
    description,
    homepage,
    private: private_,
    visibility,
    security_and_analysis,
    has_issues,
    has_projects,
    has_wiki,
    is_template,
    default_branch,
    allow_squash_merge,
    allow_merge_commit,
    allow_rebase_merge,
    allow_auto_merge,
    delete_branch_on_merge,
    allow_update_branch,
    use_squash_pr_title_as_default,
    squash_merge_commit_title,
    squash_merge_commit_message,
    merge_commit_title,
    merge_commit_message,
    archived,
    allow_forking,
    web_commit_signoff_required,
  },
}: Readonly<{
  payload: UpdateRepositoryRequest;
}>): Promise<void> => {
  // https://docs.github.com/ja/rest/repos/repos?apiVersion=2022-11-28#update-a-repository
  await octokit.request('PATCH /repos/{owner}/{repo}' satisfies EndpointKeys, {
    owner: OWNER,
    repo: REPO,
    headers: octokitHeaders,

    name,
    description,
    homepage,
    private: private_,
    visibility,
    security_and_analysis,
    has_issues,
    has_projects,
    has_wiki,
    is_template,
    default_branch,
    allow_squash_merge,
    allow_merge_commit,
    allow_rebase_merge,
    allow_auto_merge,
    delete_branch_on_merge,
    allow_update_branch,
    use_squash_pr_title_as_default,
    squash_merge_commit_title,
    squash_merge_commit_message,
    merge_commit_title,
    merge_commit_message,
    archived,
    allow_forking,
    web_commit_signoff_required,
  });
};
