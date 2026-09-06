/**
 * Neutral rule ID (`<spec-area>/<rule>`, the corpus vocabulary — see
 * docs/sumi/conformance-corpus.md) ← oxlint diagnostic code
 * (`<plugin>(<rule>)`, as printed by `oxlint -f json`).
 *
 * This is the single source of truth for "which oxlint rule implements which
 * language rule"; `oxlintrc.jsonc` must enable exactly the rules named here,
 * and the conformance runner fails on any diagnostic whose code is missing.
 * Several codes may implement one ID (`eqeqeq` and `no-eq-null` together are
 * `banned-syntax/no-loose-equality`); one code implements at most one ID.
 */
export const oxlintCodeToRuleId: ReadonlyMap<string, string> = new Map([
  // banned-syntax
  ['eslint(no-var)', 'banned-syntax/no-var'],
  ['eslint(eqeqeq)', 'banned-syntax/no-loose-equality'],
  ['eslint(no-eq-null)', 'banned-syntax/no-loose-equality'],
  ['eslint(no-plusplus)', 'banned-syntax/no-increment-decrement'],
  ['eslint(prefer-template)', 'banned-syntax/prefer-template'],
  ['eslint(no-bitwise)', 'banned-syntax/no-bitwise'],
  ['eslint(no-void)', 'banned-syntax/no-void-operator'],
  ['eslint(no-sequences)', 'banned-syntax/no-comma-operator'],
  ['eslint(no-implicit-coercion)', 'banned-syntax/no-implicit-coercion'],
  ['eslint(no-restricted-globals)', 'banned-syntax/no-bare-number-globals'],
  ['typescript(method-signature-style)', 'banned-syntax/no-method-shorthand'],
  ['sumi(no-enum)', 'banned-syntax/no-enum'],
  ['sumi(no-decorator)', 'banned-syntax/no-decorator'],
  ['sumi(no-constructor-call)', 'banned-syntax/no-constructor-call'],

  // boolean
  ['typescript(strict-boolean-expressions)', 'boolean/strict-logical-operands'],
  ['eslint(no-unused-expressions)', 'boolean/no-logical-expression-statement'],

  // classes / exceptions
  ['sumi(no-class)', 'classes/no-class'],
  ['sumi(no-throw)', 'exceptions/no-throw'],

  // functions
  ['eslint(id-denylist)', 'functions/no-fn-identifier'],

  // modules
  ['import(no-default-export)', 'modules/no-default-export'],

  // mutation
  ['sumi(no-let-without-mut-prefix)', 'mutation/no-let-without-mut-prefix'],
  ['eslint(prefer-const)', 'mutation/prefer-const'],

  // null
  ['unicorn(no-null)', 'null/no-null-literal'],
]);

/** The neutral IDs this engine implements (the mapping's value set). */
export const implementedRuleIds: ReadonlySet<string> = new Set(
  oxlintCodeToRuleId.values(),
);
