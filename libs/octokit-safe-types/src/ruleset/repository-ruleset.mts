import { type components } from '@octokit/openapi-types';
import { expectType } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { RepositoryRulesetBypassActor } from './bypass-actor.mjs';
import { RepositoryRulesetConditions } from './conditions.mjs';
import { RepositoryRule } from './repository-rule.mjs';

// Shared pieces reused from request-side definitions (mirrored here to avoid cross-file exports)

expectType<
  t.TypeOf<typeof RepositoryRulesetBypassActor>,
  DeepReadonly<components['schemas']['repository-ruleset-bypass-actor']>
>('=');

// Organization ruleset conditions pieces

const OrgRulesetConditionsRepositoryNameTarget = t.record({
  repository_name: t.record({
    include: t.optional(t.array(t.string())),
    exclude: t.optional(t.array(t.string())),
    protected: t.optional(t.boolean()),
  }),
});

const OrgRulesetConditionsRepositoryIdTarget = t.record({
  repository_id: t.record({
    repository_ids: t.optional(t.array(t.number())),
  }),
});

const OrgRulesetConditionsRepositoryPropertySpec = t.record({
  name: t.string(),
  property_values: t.array(t.string()),
  source: t.optional(t.enumType(['custom', 'system'])),
});

const OrgRulesetConditionsRepositoryPropertyTarget = t.record({
  repository_property: t.record({
    include: t.optional(t.array(OrgRulesetConditionsRepositoryPropertySpec)),
    exclude: t.optional(t.array(OrgRulesetConditionsRepositoryPropertySpec)),
  }),
});

const OrgRulesetConditions = t.union([
  t.intersection(
    [RepositoryRulesetConditions, OrgRulesetConditionsRepositoryNameTarget],
    t.record({ repository_name: t.record({}) }),
  ),
  t.intersection(
    [RepositoryRulesetConditions, OrgRulesetConditionsRepositoryIdTarget],
    t.record({ repository_id: t.record({}) }),
  ),
  t.intersection(
    [RepositoryRulesetConditions, OrgRulesetConditionsRepositoryPropertyTarget],
    t.record({ repository_property: t.record({}) }),
  ),
]);

expectType<
  t.TypeOf<typeof OrgRulesetConditions>,
  DeepReadonly<components['schemas']['org-ruleset-conditions']>
>('=');

export const RepositoryRuleset = t.record({
  id: t.number(),
  name: t.string(),
  target: t.optional(t.enumType(['branch', 'tag', 'push', 'repository'])),
  source_type: t.optional(
    t.enumType(['Repository', 'Organization', 'Enterprise']),
  ),
  source: t.string(),
  enforcement: t.enumType(['disabled', 'active', 'evaluate']),
  bypass_actors: t.optional(t.array(RepositoryRulesetBypassActor)),
  current_user_can_bypass: t.optional(
    t.enumType(['always', 'pull_requests_only', 'never', 'exempt']),
  ),
  node_id: t.optional(t.string()),
  _links: t.optional(
    t.record({
      self: t.optional(
        t.record({
          href: t.optional(t.string()),
        }),
      ),
      html: t.optional(
        t.union([
          t.record({
            href: t.optional(t.string()),
          }),
          t.nullType,
        ]),
      ),
    }),
  ),
  conditions: t.optional(
    t.union([RepositoryRulesetConditions, OrgRulesetConditions, t.nullType]),
  ),
  rules: t.optional(t.array(RepositoryRule)),
  created_at: t.optional(t.string()),
  updated_at: t.optional(t.string()),
});

export type RepositoryRuleset = t.TypeOf<typeof RepositoryRuleset>;

type PickKeys = Extract<
  keyof RepositoryRuleset,
  | 'id'
  | 'name'
  | 'target'
  | 'source_type'
  | 'source'
  | 'enforcement'
  | 'bypass_actors'
  | 'current_user_can_bypass'
  | 'node_id'
  | '_links'
  | 'conditions'
  | 'rules'
  | 'created_at'
  | 'updated_at'
>;

expectType<
  Pick<RepositoryRuleset, PickKeys>,
  Pick<DeepReadonly<components['schemas']['repository-ruleset']>, PickKeys>
>('=');

expectType<
  Pick<RepositoryRuleset, PickKeys>,
  Pick<
    DeepReadonly<{
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
    }>,
    PickKeys
  >
>('=');
