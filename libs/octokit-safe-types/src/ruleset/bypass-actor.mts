import * as t from 'ts-fortress';

export const RepositoryRulesetBypassActor = t.strictRecord({
  /** @description The ID of the actor that can bypass a ruleset. If `actor_type` is `OrganizationAdmin`, this should be `1`. If `actor_type` is `DeployKey`, this should be null. `OrganizationAdmin` is not applicable for personal repositories. */
  actor_id: t.optional(t.union([t.number(), t.nullType])),

  /**
   * @description The type of actor that can bypass a ruleset.
   * @enum {string}
   */
  actor_type: t.enumType([
    'Integration',
    'OrganizationAdmin',
    'RepositoryRole',
    'Team',
    'DeployKey',
  ]),

  /**
   * @description When the specified actor can bypass the ruleset. `pull_request` means that an actor can only bypass rules on pull requests. `pull_request` is not applicable for the `DeployKey` actor type. Also, `pull_request` is only applicable to branch rulesets.
   * @default always
   * @enum {string}
   */
  bypass_mode: t.optional(t.enumType(['always', 'pull_request', 'exempt'])),
});
