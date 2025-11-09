import { GetRepositoryResponse, type EndpointKeys } from 'octokit-safe-types';
import { validationErrorsToMessages } from 'ts-fortress';
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

    {
      const res = GetRepositoryResponse.validate(getRepositoryResult.data);
      if (Result.isErr(res)) {
        console.warn(validationErrorsToMessages(res.value));
      }
    }

    return GetRepositoryResponse.fill(getRepositoryResult.data);
  };
