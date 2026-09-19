import { type EndpointKeys } from 'octokit-safe-types';
import { type DeepReadonly } from 'ts-type-forge';
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

  // `getAllEnvironments` と同じく名前順に整えて返す。 `bk/` の中身が API の
  // 返す順に左右されると、値が変わっていない日にも diff が出る。
  return result.data.variables.toSorted((a, b) => a.name.localeCompare(b.name));
};
