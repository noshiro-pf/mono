import { type operations, type paths } from '@octokit/openapi-types';
import { expectType } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { RepositoryRulesetBypassActor } from './bypass-actor.mjs';
import { RepositoryRulesetConditions } from './conditions.mjs';
import { RepositoryRule } from './repository-rule.mjs';

export const UpdateRulesetRequest = t.strictRecord({
  /** @description The name of the ruleset. */
  name: t.optional(t.string()),

  /**
   * @description The target of the ruleset
   * @enum {string}
   */
  target: t.optional(t.enumType(['branch', 'tag', 'push'])),

  enforcement: t.optional(t.enumType(['disabled', 'active', 'evaluate'])),

  /** @description The actors that can bypass the rules in this ruleset */
  bypass_actors: t.optional(t.array(RepositoryRulesetBypassActor)),

  conditions: t.optional(RepositoryRulesetConditions),

  /** @description An array of rules within the ruleset. */
  rules: t.optional(t.array(RepositoryRule)),
});

export type UpdateRulesetRequest = t.TypeOf<typeof UpdateRulesetRequest>;

// TODO: Remove StrictOmit when `rules` type of @octokit/openapi-types is fixed.
expectType<
  StrictOmit<UpdateRulesetRequest, 'rules' | 'bypass_actors'>,
  StrictOmit<
    DeepReadonly<
      Required<
        paths['/repos/{owner}/{repo}/rulesets/{ruleset_id}']['put']
      >['requestBody']['content']['application/json']
    >,
    'rules' | 'bypass_actors'
  >
>('~=');

expectType<
  paths['/repos/{owner}/{repo}/rulesets/{ruleset_id}']['put'],
  operations['repos/update-repo-ruleset']
>('=');
