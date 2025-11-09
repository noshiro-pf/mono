import { GetRulesetResponse, type EndpointKeys } from 'octokit-safe-types';
import { validationErrorsToMessages } from 'ts-fortress';
import { octokitHeaders, OWNER, REPO } from '../../constants.mjs';
import { octokit } from '../../octokit.mjs';

export const getRuleset = async (
  rulesetId: number,
): Promise<GetRulesetResponse> => {
  // https://docs.github.com/ja/rest/repos/rules?apiVersion=2022-11-28#get-a-repository-ruleset
  const getRulesetResult = await octokit.request(
    'GET /repos/{owner}/{repo}/rulesets/{ruleset_id}' satisfies EndpointKeys,
    {
      owner: OWNER,
      repo: REPO,
      ruleset_id: rulesetId,
      headers: octokitHeaders,
    },
  );

  {
    const res = GetRulesetResponse.validate(getRulesetResult.data);
    if (Result.isErr(res)) {
      console.warn(validationErrorsToMessages(res.value));
    }
  }

  return GetRulesetResponse.fill(getRulesetResult.data);
};
