import { type components, type paths } from '@octokit/openapi-types';
import { expectType } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { RepositoryRuleset } from './repository-ruleset.mjs';

export const GetAllRulesetsResponse = t.array(RepositoryRuleset);

export type GetAllRulesetsResponse = t.TypeOf<typeof GetAllRulesetsResponse>;

// TODO: Remove StrictOmit when `rules` type of @octokit/openapi-types is fixed.
expectType<
  GetAllRulesetsResponse[number],
  StrictOmit<
    DeepReadonly<
      paths['/repos/{owner}/{repo}/rulesets']['get']['responses']['200']['content']['application/json']
    >[number],
    'rules'
  >
>('~=');

expectType<
  components['schemas']['repository-ruleset'][],
  paths['/repos/{owner}/{repo}/rulesets']['get']['responses']['200']['content']['application/json']
>('=');
