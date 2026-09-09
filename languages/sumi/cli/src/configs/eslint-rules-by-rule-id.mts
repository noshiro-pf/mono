/**
 * Neutral rule ID (what `sumi check` covers — the value set of
 * @sumi-lang/oxlint-config's mapping) → the ESLint rules of eslint-config-typed
 * that check the same thing. This is what `eslintConfigOffForSumiCheck`
 * turns off (D-46): a project that runs `sumi check` and keeps ESLint for its
 * style rules does not check these twice.
 *
 * An ID maps to the rules whose *whole* job Sumi covers. A rule that also
 * checks something Sumi does not (`no-restricted-syntax` carrying several
 * selectors, `no-restricted-globals` with the base config's browser list)
 * stays on, and the ID lists nothing — the double check is the price of not
 * losing the rest. A test holds this table's key set equal to the IDs the
 * oxlint preset implements.
 */
export const eslintRulesByRuleId: ReadonlyMap<string, readonly string[]> =
  new Map([
    // banned-syntax
    ['banned-syntax/no-var', ['no-var']],
    ['banned-syntax/no-loose-equality', ['eqeqeq', 'no-eq-null']],
    ['banned-syntax/no-increment-decrement', ['no-plusplus']],
    ['banned-syntax/prefer-template', ['prefer-template']],
    ['banned-syntax/no-bitwise', ['no-bitwise']],
    ['banned-syntax/no-void-operator', ['no-void']],
    ['banned-syntax/no-comma-operator', ['no-sequences']],
    ['banned-syntax/no-implicit-coercion', ['no-implicit-coercion']],
    // The base config's no-restricted-globals list is wider than D-21
    // (browser globals, `eval`); only the unicorn rule is fully covered.
    [
      'banned-syntax/no-bare-number-globals',
      ['unicorn/prefer-number-properties'],
    ],
    [
      'banned-syntax/no-method-shorthand',
      ['@typescript-eslint/method-signature-style'],
    ],
    ['banned-syntax/no-enum', ['total-functions/no-enums']],
    ['banned-syntax/no-decorator', []],
    ['banned-syntax/no-constructor-call', []],
    ['banned-syntax/no-in-operator', []],
    [
      'banned-syntax/no-new-array',
      ['unicorn/no-new-array', '@typescript-eslint/no-array-constructor'],
    ],
    ['banned-syntax/no-this', ['functional/no-this-expressions']],
    ['banned-syntax/no-setter', []],
    ['banned-syntax/no-using', []],
    ['banned-syntax/no-global-type-shadow', []],
    [
      'banned-syntax/no-eval',
      ['no-eval', 'no-new-func', '@typescript-eslint/no-implied-eval'],
    ],
    ['banned-syntax/no-arguments', ['prefer-rest-params']],
    ['banned-syntax/no-sparse-array', ['no-sparse-arrays']],
    ['banned-syntax/no-labels', ['no-labels']],
    ['banned-syntax/no-any', ['@typescript-eslint/no-explicit-any']],
    ['banned-syntax/no-ts-ignore', ['@typescript-eslint/ban-ts-comment']],
    [
      'banned-syntax/no-unsafe-type-assertion',
      [
        'total-functions/no-unsafe-type-assertion',
        '@typescript-eslint/no-unsafe-type-assertion',
      ],
    ],
    [
      'banned-syntax/no-mixed-plus',
      ['@typescript-eslint/restrict-plus-operands'],
    ],
    [
      'banned-syntax/require-sort-compare',
      ['@typescript-eslint/require-array-sort-compare'],
    ],
    [
      'banned-syntax/no-non-null-assertion',
      ['@typescript-eslint/no-non-null-assertion'],
    ],
    ['banned-syntax/no-global-assign', ['no-global-assign']],

    // boolean
    [
      'boolean/strict-logical-operands',
      ['@typescript-eslint/strict-boolean-expressions'],
    ],
    [
      'boolean/no-logical-expression-statement',
      ['@typescript-eslint/no-unused-expressions'],
    ],

    // classes / exceptions
    ['classes/no-class', ['functional/no-classes']],
    ['exceptions/no-throw', ['functional/no-throw-statements']],
    ['exceptions/no-try', ['functional/no-try-statements']],

    // functions
    ['functions/no-fn-identifier', ['id-denylist']],
    [
      'functions/explicit-return-type',
      ['@typescript-eslint/explicit-function-return-type'],
    ],
    [
      'functions/prefer-arrow-function',
      [
        'prefer-arrow-functions/prefer-arrow-functions',
        'prefer-arrow-callback',
      ],
    ],

    // jsx
    ['jsx/generic-arrow-trailing-comma', []],

    // modules
    [
      'modules/no-default-export',
      ['import-x/no-default-export', 'no-restricted-exports'],
    ],
    ['modules/no-side-effect-import', ['import-x/no-unassigned-import']],
    ['modules/require-extension', ['import-x/extensions']],
    ['modules/no-index-file-import', ['no-restricted-imports']],
    ['modules/no-triple-slash', ['@typescript-eslint/triple-slash-reference']],
    ['modules/no-require', ['@typescript-eslint/no-require-imports']],
    ['modules/no-internal-module-import', ['import-x/no-internal-modules']],
    // No ESLint rule checks the shape (D-52); nothing to switch off.
    ['modules/no-mixed-star-export', []],
    ['modules/no-namespace-object-use', ['tree-shakable/import-star']],

    // mutation
    ['mutation/no-let-without-mut-prefix', ['functional/no-let']],
    ['mutation/prefer-const', ['prefer-const']],
    [
      'mutation/no-shadow',
      ['@typescript-eslint/no-shadow', 'no-shadow-restricted-names'],
    ],

    // readonly
    ['readonly/require-readonly-type', []],
    [
      'readonly/require-readonly-parameter',
      ['@typescript-eslint/prefer-readonly-parameter-types'],
    ],

    // null
    // No ESLint rule bans the `null` type keyword; nothing to switch off.
    ['null/no-null-in-type', []],
    ['null/no-null-literal', ['unicorn/no-null']],
  ]);
