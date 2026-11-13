import type { EndpointKeys } from 'octokit-safe-types';
import { octokitHeaders, OWNER, REPO } from '../../constants.mjs';
import { octokit } from '../../octokit.mjs';
import {
  listVariablesWith,
  type RepoVariable,
} from './list-variables-with.mjs';

/** The repository's variables, every page of them, sorted by name. */
export const listRepoVariables = async (): Promise<readonly RepoVariable[]> =>
  listVariablesWith(getVariablesPage);

const getVariablesPage = async (
  page: number,
  perPage: number,
): Promise<readonly RepoVariable[]> => {
  // https://docs.github.com/ja/rest/actions/variables?apiVersion=2022-11-28#list-repository-variables
  const result = await octokit.request(
    'GET /repos/{owner}/{repo}/actions/variables' satisfies EndpointKeys,
    {
      owner: OWNER,
      repo: REPO,
      headers: octokitHeaders,
      per_page: perPage,
      page,
    },
  );

  return result.data.variables;
};
