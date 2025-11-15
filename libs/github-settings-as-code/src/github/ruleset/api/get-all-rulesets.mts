import {
  GetAllRulesetsResponse,
  type components,
  type EndpointKeys,
  type OctokitResponse,
} from 'octokit-safe-types';
import { expectType } from 'ts-data-forge';
import { validationErrorsToMessages } from 'ts-fortress';
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

  expectType<
    DeepReadonly<typeof getAllRulesetsResponse>,
    DeepReadonly<
      OctokitResponse<
        {
          id: number;
          name: string;
          target?: 'branch' | 'tag' | 'push' | 'repository';
          source_type?: 'Repository' | 'Organization' | 'Enterprise';
          source: string;
          enforcement: components['schemas']['repository-rule-enforcement'];
          bypass_actors?: components['schemas']['repository-ruleset-bypass-actor'][];
          current_user_can_bypass?:
            | 'always'
            | 'pull_requests_only'
            | 'never'
            | 'exempt';
          node_id?: string;
          _links?: {
            self?: {
              href?: string;
            };
            html?: {
              href?: string;
            } | null;
          };
          conditions?:
            | (
                | components['schemas']['repository-ruleset-conditions']
                | components['schemas']['org-ruleset-conditions']
              )
            | null;
          rules?: components['schemas']['repository-rule'][];
          created_at?: string;
          updated_at?: string;
        }[],
        200
      >
    >
  >('=');

  {
    const res = GetAllRulesetsResponse.validate(getAllRulesetsResponse.data);

    if (Result.isErr(res)) {
      console.warn(validationErrorsToMessages(res.value));
    }
  }

  return GetAllRulesetsResponse.fill(getAllRulesetsResponse.data);
};
