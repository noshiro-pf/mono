import { type EndpointKeys } from '@octokit/types';
import { octokitHeaders, OWNER, REPO } from '../../constants.mjs';
import { octokit } from '../../octokit.mjs';

export const createRepoVariable = async ({
  name,
  value,
}: Readonly<{
  name: string;
  value: string;
}>): Promise<void> => {
  // https://docs.github.com/ja/rest/actions/variables?apiVersion=2022-11-28#create-a-repository-variable
  await octokit.request(
    'POST /repos/{owner}/{repo}/actions/variables' satisfies EndpointKeys,
    {
      owner: OWNER,
      repo: REPO,
      headers: octokitHeaders,

      name,
      value,
    },
  );
};
