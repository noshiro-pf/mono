import { type components, type paths } from '@octokit/openapi-types';
import { expectType } from 'ts-data-forge';
import type * as t from 'ts-fortress';
import { RepositoryRuleset } from './repository-ruleset.mjs';

export const GetRulesetResponse = RepositoryRuleset;

export type GetRulesetResponse = t.TypeOf<typeof GetRulesetResponse>;

// TODO: Remove StrictOmit when `rules` type of @octokit/openapi-types is fixed.
expectType<
  GetRulesetResponse,
  StrictOmit<
    DeepReadonly<
      paths['/repos/{owner}/{repo}/rulesets/{ruleset_id}']['get']['responses']['200']['content']['application/json']
    >,
    'rules'
  >
>('~=');

expectType<
  components['schemas']['repository-ruleset'],
  paths['/repos/{owner}/{repo}/rulesets/{ruleset_id}']['get']['responses']['200']['content']['application/json']
>('=');
