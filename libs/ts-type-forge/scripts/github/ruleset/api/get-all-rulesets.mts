import { type EndpointKeys, type OctokitResponse } from '@octokit/types';
import { GetAllRulesetsResponse } from 'octokit-safe-types';
import 'ts-repo-utils';
import { octokitHeaders, OWNER, REPO } from '../../constants.mjs';
import { octokit } from '../../octokit.mjs';

export const getAllRulesets = async (): Promise<GetAllRulesetsResponse> => {
  // https://docs.github.com/ja/rest/repos/rules?apiVersion=2022-11-28#get-all-repository-rulesets
  const getAllRulesetsResponse = (await octokit.request(
    'GET /repos/{owner}/{repo}/rulesets' satisfies EndpointKeys,
    {
      owner: OWNER,
      repo: REPO,
      headers: octokitHeaders,
    },
  )) satisfies OctokitResponse<GetAllRulesetsResponse, 200>;

  assertGetAllRulesetsResponse(getAllRulesetsResponse.data);

  return GetAllRulesetsResponse.fill(getAllRulesetsResponse.data);
};

const assertGetAllRulesetsResponse: (
  u: unknown,
) => asserts u is GetAllRulesetsResponse = GetAllRulesetsResponse.assertIs;
