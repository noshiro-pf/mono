import {
  type components,
  type EndpointKeys,
  type UpdateRulesetRequest,
} from 'octokit-safe-types';
import { castDeepMutable } from 'ts-data-forge';
import { octokitHeaders, OWNER, REPO } from '../../constants.mjs';
import { octokit } from '../../octokit.mjs';

export const updateRuleset = async ({
  rulesetId,
  payload: { name, target, enforcement, bypass_actors, conditions, rules },
}: Readonly<{
  rulesetId: number;
  payload: UpdateRulesetRequest;
}>): Promise<void> => {
  // https://docs.github.com/ja/rest/repos/rules?apiVersion=2022-11-28#update-a-repository-ruleset
  await octokit.request(
    'PUT /repos/{owner}/{repo}/rulesets/{ruleset_id}' satisfies EndpointKeys,
    {
      owner: OWNER,
      repo: REPO,
      ruleset_id: rulesetId,
      headers: octokitHeaders,

      name,
      target,
      enforcement,
      bypass_actors: castDeepMutable(bypass_actors),
      conditions: castDeepMutable(conditions),
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      rules: castDeepMutable(
        rules,
      ) as components['schemas']['repository-rule'][],
    },
  );
};
