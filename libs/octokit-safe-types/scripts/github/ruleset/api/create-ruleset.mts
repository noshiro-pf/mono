import { type components } from '@octokit/openapi-types';
import { type EndpointKeys } from '@octokit/types';
import { type CreateRulesetRequest } from 'octokit-safe-types';
import { castDeepMutable } from 'ts-data-forge';
import { octokitHeaders, OWNER, REPO } from '../../constants.mjs';
import { octokit } from '../../octokit.mjs';

export const createRuleset = async ({
  payload: { name, target, enforcement, bypass_actors, conditions, rules },
}: Readonly<{
  payload: CreateRulesetRequest;
}>): Promise<void> => {
  // https://docs.github.com/ja/rest/repos/rules?apiVersion=2022-11-28#create-a-repository-ruleset
  await octokit.request(
    'POST /repos/{owner}/{repo}/rulesets' satisfies EndpointKeys,
    {
      owner: OWNER,
      repo: REPO,
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
