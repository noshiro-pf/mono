/**
 * Neutral rule IDs of the subset language (`<spec-area>/<rule>`).
 *
 * This registry is the executable counterpart of
 * `languages/sumi/docs/enforcement-map.md`: fixtures may only expect IDs
 * listed here (plus `compiler/<code>` for diagnostics of the fixed
 * compilerOptions). Engine mappings (neutral ID → ESLint rule names / tsc
 * codes) will live next to each engine's runner (Phase 1).
 */
export const knownRuleIds = [
  'banned-syntax/no-setter',
  'banned-syntax/no-any',
  'banned-syntax/no-arguments',
  'banned-syntax/no-bare-number-globals',
  'banned-syntax/no-bitwise',
  'banned-syntax/no-comma-operator',
  'banned-syntax/no-constructor-call',
  'banned-syntax/no-decorator',
  'banned-syntax/no-enum',
  'banned-syntax/no-eval',
  'banned-syntax/no-global-assign',
  'banned-syntax/no-global-type-shadow',
  'banned-syntax/no-implicit-coercion',
  'banned-syntax/no-in-operator',
  'banned-syntax/no-increment-decrement',
  'banned-syntax/no-labels',
  'banned-syntax/no-loose-equality',
  'banned-syntax/no-method-shorthand',
  'banned-syntax/no-mixed-plus',
  'banned-syntax/no-new-array',
  'banned-syntax/no-non-null-assertion',
  'banned-syntax/no-sparse-array',
  'banned-syntax/no-this',
  'banned-syntax/no-ts-ignore',
  'banned-syntax/no-unsafe-type-assertion',
  'banned-syntax/no-using',
  'banned-syntax/no-var',
  'banned-syntax/no-void-operator',
  'banned-syntax/prefer-template',
  'banned-syntax/require-sort-compare',
  'boolean/no-logical-expression-statement',
  'boolean/strict-logical-operands',
  'classes/no-class',
  'exceptions/no-throw',
  'exceptions/no-try',
  'functions/explicit-return-type',
  'functions/no-fn-identifier',
  'functions/prefer-arrow-function',
  'jsx/generic-arrow-trailing-comma',
  'modules/no-default-export',
  'modules/no-index-file-import',
  'modules/no-internal-module-import',
  'modules/no-mixed-star-export',
  'modules/no-namespace-object-use',
  'modules/no-require',
  'modules/no-side-effect-import',
  'modules/no-triple-slash',
  'modules/require-extension',
  'mutation/no-let-without-mut-prefix',
  'mutation/no-shadow',
  'mutation/prefer-const',
  'null/no-null-literal',
  'readonly/require-readonly-parameter',
  'readonly/require-readonly-type',
] as const;

export type KnownRuleId = (typeof knownRuleIds)[number];

const knownRuleIdSet: ReadonlySet<string> = new Set(knownRuleIds);

const compilerRuleIdRegex = /^compiler\/\d+$/u;

export const isKnownRuleId = (ruleId: string): boolean =>
  knownRuleIdSet.has(ruleId) || compilerRuleIdRegex.test(ruleId);
