import { type operations, type paths } from '@octokit/openapi-types';
import { expectType } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { RepositoryRulesetBypassActor } from './bypass-actor.mjs';
import { RepositoryRulesetConditions } from './conditions.mjs';
import { RepositoryRule } from './repository-rule.mjs';

export const CreateRulesetRequest = t.record({
  /** @description The name of the ruleset. */
  name: t.string(),

  /**
   * @description The target of the ruleset
   * @default branch
   */
  target: t.optional(t.enumType(['branch', 'tag', 'push'])),

  enforcement: t.enumType(['disabled', 'active', 'evaluate']),

  /** @description The actors that can bypass the rules in this ruleset */
  bypass_actors: t.optional(t.array(RepositoryRulesetBypassActor)),

  conditions: t.optional(RepositoryRulesetConditions),

  /** @description An array of rules within the ruleset. */
  rules: t.optional(t.array(RepositoryRule)),
});

export type CreateRulesetRequest = t.TypeOf<typeof CreateRulesetRequest>;

expectType<
  CreateRulesetRequest,
  DeepReadonly<
    paths['/repos/{owner}/{repo}/rulesets']['post']['requestBody']['content']['application/json']
  >
>('=');

expectType<
  paths['/repos/{owner}/{repo}/rulesets']['post'],
  operations['repos/create-repo-ruleset']
>('=');
