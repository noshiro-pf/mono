/**
 * Neutral rule IDs of the subset language (`<spec-area>/<rule>`).
 *
 * This registry is the executable counterpart of
 * `docs/tsubu/enforcement-map.md`: fixtures may only expect IDs
 * listed here (plus `compiler/<code>` for diagnostics of the fixed
 * compilerOptions). Engine mappings (neutral ID → ESLint rule names / tsc
 * codes) will live next to each engine's runner (Phase 1).
 */
export const knownRuleIds = [
  'banned-syntax/no-bare-number-globals',
  'banned-syntax/no-bitwise',
  'banned-syntax/no-comma-operator',
  'banned-syntax/no-constructor-call',
  'banned-syntax/no-decorator',
  'banned-syntax/no-enum',
  'banned-syntax/no-implicit-coercion',
  'banned-syntax/no-increment-decrement',
  'banned-syntax/no-loose-equality',
  'banned-syntax/no-method-shorthand',
  'banned-syntax/no-var',
  'banned-syntax/no-void-operator',
  'banned-syntax/prefer-template',
  'boolean/no-logical-expression-statement',
  'boolean/strict-logical-operands',
  'classes/no-class',
  'exceptions/no-throw',
  'functions/no-fn-identifier',
  'modules/no-default-export',
  'mutation/no-let-without-mut-prefix',
  'mutation/prefer-const',
  'null/no-null-literal',
] as const;

export type KnownRuleId = (typeof knownRuleIds)[number];

const knownRuleIdSet: ReadonlySet<string> = new Set(knownRuleIds);

const compilerRuleIdRegex = /^compiler\/\d+$/u;

export const isKnownRuleId = (ruleId: string): boolean =>
  knownRuleIdSet.has(ruleId) || compilerRuleIdRegex.test(ruleId);
