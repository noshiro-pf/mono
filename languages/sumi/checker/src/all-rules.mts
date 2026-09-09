import { type Rule } from './engine/index.mjs';
import { noNullPropagation } from './rules/index.mjs';

/**
 * Every rule this checker runs. `sumi check` and the conformance corpus both
 * take the list from here, so a rule is enabled by being in it.
 */
export const allRules: readonly Rule[] = [noNullPropagation] as const;

/** The neutral IDs the checker implements — what the corpus compares against. */
export const implementedRuleIds: ReadonlySet<string> = new Set(
  allRules.map((rule) => rule.ruleId),
);
