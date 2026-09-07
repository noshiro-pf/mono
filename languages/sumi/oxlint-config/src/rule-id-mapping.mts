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
  ['sumi(no-in-operator)', 'banned-syntax/no-in-operator'],
  ['sumi(no-new-array)', 'banned-syntax/no-new-array'],
  ['sumi(no-this)', 'banned-syntax/no-this'],
  ['sumi(no-accessor)', 'banned-syntax/no-accessor'],
  ['sumi(no-using)', 'banned-syntax/no-using'],
  ['sumi(no-global-type-shadow)', 'banned-syntax/no-global-type-shadow'],
  ['eslint(no-eval)', 'banned-syntax/no-eval'],
  ['typescript(no-implied-eval)', 'banned-syntax/no-eval'],
  ['eslint(prefer-rest-params)', 'banned-syntax/no-arguments'],
  ['eslint(no-sparse-arrays)', 'banned-syntax/no-sparse-array'],
  ['eslint(no-labels)', 'banned-syntax/no-labels'],
  ['typescript(no-explicit-any)', 'banned-syntax/no-any'],
  ['typescript(ban-ts-comment)', 'banned-syntax/no-ts-ignore'],
  [
    'typescript(no-unsafe-type-assertion)',
    'banned-syntax/no-unsafe-type-assertion',
  ],
  ['typescript(restrict-plus-operands)', 'banned-syntax/no-mixed-plus'],
  [
    'typescript(require-array-sort-compare)',
    'banned-syntax/require-sort-compare',
  ],
  ['typescript(no-non-null-assertion)', 'banned-syntax/no-non-null-assertion'],
  ['eslint(no-global-assign)', 'banned-syntax/no-global-assign'],

  // boolean
  ['typescript(strict-boolean-expressions)', 'boolean/strict-logical-operands'],
  ['eslint(no-unused-expressions)', 'boolean/no-logical-expression-statement'],

  // classes / exceptions
  ['sumi(no-class)', 'classes/no-class'],
  ['sumi(no-throw)', 'exceptions/no-throw'],
  ['sumi(no-try)', 'exceptions/no-try'],

  // functions
  ['eslint(id-denylist)', 'functions/no-fn-identifier'],
  [
    'typescript(explicit-function-return-type)',
    'functions/explicit-return-type',
  ],
  ['sumi(prefer-arrow-function)', 'functions/prefer-arrow-function'],

  // jsx
  ['sumi(generic-arrow-trailing-comma)', 'jsx/generic-arrow-trailing-comma'],

  // modules
  ['import(no-default-export)', 'modules/no-default-export'],
  ['import(no-unassigned-import)', 'modules/no-side-effect-import'],
  ['import(extensions)', 'modules/require-extension'],
  ['eslint(no-restricted-imports)', 'modules/no-index-file-import'],
  ['typescript(triple-slash-reference)', 'modules/no-triple-slash'],
  ['typescript(no-require-imports)', 'modules/no-require'],

  // mutation
  ['sumi(no-let-without-mut-prefix)', 'mutation/no-let-without-mut-prefix'],
  ['eslint(prefer-const)', 'mutation/prefer-const'],
  // Declaring a global's name (D-19) and shadowing a user binding (D-27)
  // are one rule to the engine; both surface under this ID.
  ['eslint(no-shadow)', 'mutation/no-shadow'],

  // null
  ['unicorn(no-null)', 'null/no-null-literal'],
]);

/** The neutral IDs this engine implements (the mapping's value set). */
export const implementedRuleIds: ReadonlySet<string> = new Set(
  oxlintCodeToRuleId.values(),
);
