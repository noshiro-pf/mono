import type { TSESLint } from '@typescript-eslint/utils';

// A rule is ESLint's object, with mutable listener signatures; these read it or
// copy it, never change it.
/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

/**
 * Records that `rule` was built by `factory`, so that two plugins whose rules
 * are meant to be the same rule with different settings can be checked to be
 * just that ({@link ruleFactoriesOf}). Every factory in this package returns
 * its rule through this.
 */
export const builtBy = <
  R extends TSESLint.RuleModule<string, readonly unknown[]>,
>(
  factory: RuleFactory,
  rule: R,
): R => {
  // `as const` on a copy of a generic rule is an assertion the lint refuses.
  // transformer-ignore-next-line
  const marked: R = { ...rule, [factoriesKey]: [factory] };

  return marked;
};

/**
 * Records that `rule` merges the visitors of `parts`, so that it counts as
 * built by every factory any of them was built by.
 */
export const composedOf = <
  R extends TSESLint.RuleModule<string, readonly unknown[]>,
>(
  parts: readonly TSESLint.RuleModule<string, readonly unknown[]>[],
  rule: R,
): R => {
  // `as const` on a copy of a generic rule is an assertion the lint refuses.
  // transformer-ignore-next-line
  const marked: R = {
    ...rule,
    [factoriesKey]: parts.flatMap(ruleFactoriesOf),
  };

  return marked;
};

/**
 * The factories of this package `rule` was built by — itself or through the
 * rules it is {@link composedOf} — in no particular order; none for a rule
 * written by hand.
 */
export const ruleFactoriesOf = (
  rule: TSESLint.RuleModule<string, readonly unknown[]>,
): readonly RuleFactory[] => {
  const factories: unknown = Object.getOwnPropertyDescriptor(
    rule,
    factoriesKey,
  )?.value;

  return Array.isArray(factories)
    ? factories.filter(
        (factory): factory is RuleFactory => typeof factory === 'function',
      )
    : [];
};

/** A rule factory of this package: settings in, a rule out. */
export type RuleFactory = (config: never) => unknown;

/**
 * `Symbol.for`, not a plain symbol: a plugin and the test that reads its rules
 * may load two copies of this package.
 */
const factoriesKey = Symbol.for('eslint-rule-forge.rule-factories');
