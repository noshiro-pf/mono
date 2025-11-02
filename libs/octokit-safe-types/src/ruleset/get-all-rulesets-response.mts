import { type components, type paths } from '@octokit/openapi-types';
import { expectType } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { RepositoryRuleset } from './repository-ruleset.mjs';

export const GetAllRulesetsResponse = t.array(RepositoryRuleset);

export type GetAllRulesetsResponse = t.TypeOf<typeof GetAllRulesetsResponse>;

expectType<
  GetAllRulesetsResponse[number],
  DeepReadonly<
    paths['/repos/{owner}/{repo}/rulesets']['get']['responses']['200']['content']['application/json']
  >[number]
>('=');

expectType<
  components['schemas']['repository-ruleset'][],
  paths['/repos/{owner}/{repo}/rulesets']['get']['responses']['200']['content']['application/json']
>('=');
