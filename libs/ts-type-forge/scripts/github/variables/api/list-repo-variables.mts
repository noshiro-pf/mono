import { type EndpointKeys } from '@octokit/types';
import { octokitHeaders, OWNER, REPO } from '../../constants.mjs';
import { octokit } from '../../octokit.mjs';

export const listRepoVariables = async (): Promise<
  DeepReadonly<
    {
      name: string;
      value: string;
      created_at: string;
      updated_at: string;
    }[]
  >
> => {
  // https://docs.github.com/ja/rest/actions/variables?apiVersion=2022-11-28#list-repository-variables
  const result = await octokit.request(
    'GET /repos/{owner}/{repo}/actions/variables' satisfies EndpointKeys,
    {
      owner: OWNER,
      repo: REPO,
      headers: octokitHeaders,
    },
  );
  return result.data.variables;
};
