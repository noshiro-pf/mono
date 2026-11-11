import {
  GetAllRulesetsResponse,
  type components,
  type EndpointKeys,
  type OctokitResponse,
} from 'octokit-safe-types';
import { expectType } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { Result } from 'ts-repo-utils';
import type { DeepReadonly } from 'ts-type-forge';
import { collectPages } from '../../collect-pages.mjs';
import { octokitHeaders, OWNER, REPO } from '../../constants.mjs';
import { octokit } from '../../octokit.mjs';

/**
 * The repository's own rulesets, every page of them. Rulesets of the
 * organization or the enterprise above it are left out (`includes_parents:
 * false`, and their `source_type` besides): the repository-level `PUT` cannot
 * update one, and `backup` must not import one as a declaration of this
 * repository.
 */
export const getAllRulesets = async (): Promise<GetAllRulesetsResponse> => {
  const rulesets = await collectPages(getRulesetsPage, PER_PAGE);

  return rulesets.filter(
    (ruleset) =>
      ruleset.source_type === undefined || ruleset.source_type === 'Repository',
  );
};

/** The `per_page` maximum. */
const PER_PAGE = 100;

const getRulesetsPage = async (
  page: number,
): Promise<GetAllRulesetsResponse> => {
  // https://docs.github.com/ja/rest/repos/rules?apiVersion=2022-11-28#get-all-repository-rulesets
  const getAllRulesetsResponse = (await octokit.request(
    'GET /repos/{owner}/{repo}/rulesets' satisfies EndpointKeys,
    {
      owner: OWNER,
      repo: REPO,
      headers: octokitHeaders,
      includes_parents: false,
      per_page: PER_PAGE,
      page,
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
            'always' | 'pull_requests_only' | 'never' | 'exempt';
          node_id?: string;
          _links?: {
            self?: {
              href?: string;
            };
            html?: null | {
              href?: string;
            };
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
      console.warn(t.validationErrorsToMessages(res.value));
    }
  }

  return GetAllRulesetsResponse.fill(getAllRulesetsResponse.data);
};
