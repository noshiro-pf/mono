import { GetRepositoryResponse, type EndpointKeys } from 'octokit-safe-types';
import { octokitHeaders, OWNER, REPO } from '../../constants.mjs';
import { octokit } from '../../octokit.mjs';

export const getRepositorySettings =
  async (): Promise<GetRepositoryResponse> => {
    // https://docs.github.com/ja/rest/repos/repos?apiVersion=2022-11-28#get-a-repository
    const getRepositoryResult = await octokit.request(
      'GET /repos/{owner}/{repo}' satisfies EndpointKeys,
      {
        owner: OWNER,
        repo: REPO,
        headers: octokitHeaders,
      },
    );

    assertGetRepositoryResponse(getRepositoryResult.data);

    return GetRepositoryResponse.fill(getRepositoryResult.data);
  };

const assertGetRepositoryResponse: (
  u: unknown,
) => asserts u is GetRepositoryResponse = GetRepositoryResponse.assertIs;
