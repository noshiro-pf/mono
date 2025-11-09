import {
  RepositoryRuleset,
  type CreateRulesetRequest,
  type UpdateRulesetRequest,
} from 'octokit-safe-types';
import { expectType } from 'ts-data-forge';
import * as t from 'ts-fortress';

export const rulesetKeysToPick = [
  'id',
  'name',
  'target',
  'enforcement',
  'bypass_actors',
  'conditions',
  'rules',
] as const satisfies readonly (keyof RepositoryRuleset)[];

type KeysToPick = (typeof rulesetKeysToPick)[number];

expectType<keyof UpdateRulesetRequest | 'id', KeysToPick>('=');
expectType<keyof CreateRulesetRequest, keyof UpdateRulesetRequest>('=');

export const RulesetPicked = t.pick(RepositoryRuleset, rulesetKeysToPick, {
  allowExcessProperties: true,
});

export type RulesetPicked = t.TypeOf<typeof RulesetPicked>;
