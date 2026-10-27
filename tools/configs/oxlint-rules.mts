import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * The ESLint rules oxlint checks instead, in every package whose `check:lint`
 * and `fix:lint` run `oxlint` before `eslint`. Each package's
 * `eslint.config.mts` ends with {@link eslintConfigOffForOxlint}, and the root
 * `oxlint.config.mts` is {@link oxlintConfig}; both are read from this table,
 * so a rule moves by being added here and nowhere else.
 *
 * A rule is listed only when all of these hold, because moving it must not
 * change what `ws:fix:lint` reports or rewrites:
 *
 * - ESLint applies it with exactly these options to every file every package
 *   lints — no package or file overrides it;
 * - neither the ESLint rule nor its oxlint port needs type information (the
 *   type-aware ones are what ESLint spends its time on, and they stay);
 * - `--fix` is the same on both sides: both fix, or neither does;
 * - oxlint accepts the options and reported nothing ESLint did not on the tree
 *   it was moved on;
 * - no `eslint-disable` comment names it. ESLint reports a directive for a rule
 *   that is off as unused and `--fix` deletes it, so a moved rule is disabled
 *   with `oxlint-disable` and oxlint's name for it.
 *
 * `check:root:oxlint-rules` holds the first and the last; the rest were
 * measured when the rule moved. The values are ESLint's resolved options,
 * defaults included, which is what that check compares.
 *
 * This file is loaded by Node itself when oxlint reads its config, so it
 * imports nothing it needs at run time.
 */
export const eslintRulesMovedToOxlint = {
  '@typescript-eslint/array-type': [
    'error',
    { default: 'array', readonly: 'array' },
  ],
  '@typescript-eslint/ban-tslint-comment': 'error',
  '@typescript-eslint/class-literal-property-style': 'error',
  '@typescript-eslint/consistent-generic-constructors': 'error',
  '@typescript-eslint/consistent-type-assertions': [
    'error',
    {
      assertionStyle: 'as',
      arrayLiteralTypeAssertions: 'allow',
      objectLiteralTypeAssertions: 'allow',
    },
  ],
  '@typescript-eslint/default-param-last': 'error',
  '@typescript-eslint/explicit-member-accessibility': [
    'error',
    { accessibility: 'no-public' },
  ],
  '@typescript-eslint/no-confusing-non-null-assertion': 'error',
  '@typescript-eslint/no-duplicate-enum-values': 'error',
  '@typescript-eslint/no-extra-non-null-assertion': 'error',
  '@typescript-eslint/no-invalid-void-type': 'error',
  '@typescript-eslint/no-misused-new': 'error',
  '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
  '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
  '@typescript-eslint/no-this-alias': 'error',
  '@typescript-eslint/no-unnecessary-parameter-property-assignment': 'error',
  '@typescript-eslint/no-unnecessary-type-constraint': 'error',
  '@typescript-eslint/no-unsafe-declaration-merging': 'error',
  '@typescript-eslint/no-unused-private-class-members': 'error',
  '@typescript-eslint/no-useless-constructor': 'error',
  '@typescript-eslint/no-useless-empty-export': 'error',
  '@typescript-eslint/no-wrapper-object-types': 'error',
  '@typescript-eslint/parameter-properties': 'error',
  '@typescript-eslint/prefer-as-const': 'error',
  '@typescript-eslint/prefer-enum-initializers': 'error',
  '@typescript-eslint/prefer-for-of': 'error',
  '@typescript-eslint/prefer-literal-enum-member': 'error',
  '@typescript-eslint/prefer-namespace-keyword': 'error',
  'accessor-pairs': [
    'error',
    {
      enforceForTSTypes: false,
      enforceForClassMembers: true,
      getWithoutSet: false,
      setWithoutGet: true,
    },
  ],
  'block-scoped-var': 'error',
  'default-case-last': 'error',
  'for-direction': 'error',
  'func-name-matching': ['error', 'always'],
  'grouped-accessor-pairs': ['error', 'anyOrder', { enforceForTSTypes: false }],
  'import-x/newline-after-import': [
    'error',
    { considerComments: false, count: 1 },
  ],
  'import-x/no-amd': 'error',
  'import-x/no-cycle': 'error',
  'import-x/no-dynamic-require': 'error',
  'import-x/no-empty-named-blocks': 'error',
  'import-x/no-mutable-exports': 'error',
  'import-x/no-self-import': 'error',
  'import-x/no-webpack-loader-syntax': 'error',
  'max-nested-callbacks': ['error', 10],
  'no-async-promise-executor': 'error',
  'no-caller': 'error',
  'no-case-declarations': 'error',
  'no-cond-assign': ['error', 'except-parens'],
  'no-constant-binary-expression': [
    'error',
    { checkRelationalComparisons: true },
  ],
  'no-constant-condition': ['error', { checkLoops: 'allExceptWhileTrue' }],
  'no-constructor-return': 'error',
  'no-control-regex': 'error',
  'no-debugger': 'error',
  'no-delete-var': 'error',
  'no-div-regex': 'error',
  'no-dupe-else-if': 'error',
  'no-duplicate-case': 'error',
  'no-empty': ['error', { allowEmptyCatch: false }],
  'no-empty-character-class': 'error',
  'no-empty-pattern': ['error', { allowObjectPatternsAsParameters: false }],
  'no-empty-static-block': 'error',
  'no-ex-assign': 'error',
  'no-extend-native': ['error', { exceptions: [] }],
  'no-extra-boolean-cast': ['error', { enforceForInnerExpressions: true }],
  'no-extra-label': 'error',
  'no-fallthrough': [
    'error',
    { allowEmptyCase: false, reportUnusedFallthroughComment: false },
  ],
  'no-inner-declarations': [
    'error',
    'functions',
    { blockScopedFunctions: 'allow' },
  ],
  'no-invalid-regexp': ['error', {}],
  'no-irregular-whitespace': [
    'error',
    {
      skipComments: false,
      skipJSXText: false,
      skipRegExps: false,
      skipStrings: true,
      skipTemplates: false,
    },
  ],
  'no-iterator': 'error',
  'no-label-var': 'error',
  'no-misleading-character-class': ['error', { allowEscape: false }],
  'no-multi-assign': ['error', { ignoreNonDeclaration: false }],
  'no-multi-str': 'error',
  'no-new': 'error',
  'no-nonoctal-decimal-escape': 'error',
  'no-object-constructor': 'error',
  'no-param-reassign': 'error',
  'no-promise-executor-return': ['error', { allowVoid: false }],
  'no-proto': 'error',
  'no-prototype-builtins': 'error',
  'no-regex-spaces': 'error',
  'no-restricted-properties': 'error',
  'no-return-assign': ['error', 'except-parens'],
  'no-self-assign': ['error', { props: true }],
  'no-self-compare': 'error',
  'no-unassigned-vars': 'error',
  'no-unmodified-loop-condition': [
    'error',
    { checkConditionalExpressions: false },
  ],
  'no-unreachable-loop': ['error', { ignore: [] }],
  'no-unsafe-finally': 'error',
  'no-unsafe-optional-chaining': [
    'error',
    { disallowArithmeticOperators: true },
  ],
  'no-unused-labels': 'error',
  'no-useless-backreference': 'error',
  'no-useless-call': 'error',
  'no-useless-catch': 'error',
  'no-useless-computed-key': ['error', { enforceForClassMembers: true }],
  'no-useless-rename': [
    'error',
    { ignoreDestructuring: false, ignoreImport: false, ignoreExport: false },
  ],
  'object-shorthand': ['error', 'always'],
  'prefer-numeric-literals': 'error',
  'prefer-object-has-own': 'error',
  'prefer-object-spread': 'error',
  'prefer-regex-literals': ['error', { disallowRedundantWrapping: true }],
  'prefer-spread': 'error',
  'promise/catch-or-return': ['error', { allowFinally: true }],
  'promise/no-multiple-resolved': 'error',
  'promise/no-nesting': 'error',
  'promise/no-new-statics': 'error',
  'promise/no-promise-in-callback': 'error',
  'promise/no-return-in-finally': 'error',
  'promise/param-names': 'error',
  'promise/spec-only': 'error',
  'promise/valid-params': 'error',
  radix: 'error',
  'require-yield': 'error',
  'unicorn/catch-error-name': ['error', { name: 'error', ignore: [] }],
  'unicorn/consistent-assert': 'error',
  'unicorn/consistent-date-clone': 'error',
  'unicorn/consistent-existence-index-check': 'error',
  'unicorn/consistent-template-literal-escape': 'error',
  'unicorn/explicit-timer-delay': ['error', 'always'],
  'unicorn/filename-case': [
    'error',
    { case: 'kebabCase', ignore: ['serviceWorker.ts', 'setupTests.ts'] },
  ],
  'unicorn/import-style': [
    'error',
    {
      styles: {
        util: { namespace: true, named: false },
        'node:util': { namespace: true, named: false },
        path: { namespace: true, named: false },
        'node:path': { namespace: true, named: false },
      },
    },
  ],
  'unicorn/no-abusive-eslint-disable': 'error',
  'unicorn/no-accessor-recursion': 'error',
  'unicorn/no-anonymous-default-export': 'error',
  'unicorn/no-array-reverse': ['error', { allowExpressionStatement: true }],
  'unicorn/no-array-sort': ['error', { allowExpressionStatement: true }],
  'unicorn/no-await-in-promise-methods': 'error',
  'unicorn/no-confusing-array-with': 'error',
  'unicorn/no-magic-array-flat-depth': 'error',
  'unicorn/no-negation-in-equality-check': 'error',
  'unicorn/no-object-as-default-parameter': 'error',
  'unicorn/no-single-promise-in-promise-methods': 'error',
  'unicorn/no-thenable': 'error',
  'unicorn/no-this-assignment': 'error',
  'unicorn/no-typeof-undefined': ['error', { checkGlobalVariables: false }],
  'unicorn/no-unnecessary-array-splice-count': 'error',
  'unicorn/no-unnecessary-await': 'error',
  'unicorn/no-unnecessary-slice-end': 'error',
  'unicorn/no-unreadable-iife': 'error',
  'unicorn/no-useless-iterator-to-array': 'error',
  'unicorn/no-useless-promise-resolve-reject': 'error',
  'unicorn/no-zero-fractions': 'error',
  'unicorn/prefer-array-flat-map': 'error',
  'unicorn/prefer-bigint-literals': 'error',
  'unicorn/prefer-class-fields': 'error',
  'unicorn/prefer-date-now': 'error',
  'unicorn/prefer-import-meta-properties': 'error',
  'unicorn/prefer-negative-index': 'error',
  'unicorn/prefer-optional-catch-binding': 'error',
  'unicorn/prefer-prototype-methods': 'error',
  'unicorn/prefer-regexp-test': 'error',
  'unicorn/prefer-set-size': 'error',
  'unicorn/prefer-string-raw': 'error',
  'unicorn/prefer-string-replace-all': 'error',
  'unicorn/prefer-string-slice': 'error',
  'unicorn/prefer-string-starts-ends-with': 'error',
  'unicorn/prefer-string-trim-start-end': 'error',
  'unicorn/prefer-structured-clone': ['error', { functions: [] }],
  'unicorn/prefer-type-error': 'error',
  'unicorn/relative-url-style': ['error', 'never'],
  'unicorn/require-array-join-separator': 'error',
  'unicorn/require-number-to-fixed-digits-argument': 'error',
  'unicorn/text-encoding-identifier-case': ['error', { withDash: false }],
  'unicorn/throw-new-error': 'error',
  'vars-on-top': 'error',
} as const satisfies ReadonlyRecord<string, unknown>;

const oxlintPrefixes = [
  ['@typescript-eslint/', 'typescript/'],
  ['import-x/', 'import/'],
] as const;

// typescript-eslint extension rules that oxlint implements as the core rule.
const oxlintNameOverrides: ReadonlyMap<string, string> = new Map<
  string,
  string
>([
  ['@typescript-eslint/default-param-last', 'default-param-last'],
  [
    '@typescript-eslint/no-unused-private-class-members',
    'no-unused-private-class-members',
  ],
  ['@typescript-eslint/no-useless-constructor', 'no-useless-constructor'],
]);

/** Turns off every rule oxlint checks instead. Last in each `eslint.config.mts`. */
export const eslintConfigOffForOxlint = {
  rules: Object.fromEntries(
    Object.keys(eslintRulesMovedToOxlint).map(
      (ruleId) => [ruleId, 'off'] as const,
    ),
  ),
} as const;

/** oxlint's name for an ESLint rule id, as its config and directives spell it. */
export const toOxlintRuleName = (eslintRuleId: string): string => {
  const override = oxlintNameOverrides.get(eslintRuleId);

  if (override !== undefined) {
    return override;
  }

  for (const [eslintPrefix, oxlintPrefix] of oxlintPrefixes) {
    if (eslintRuleId.startsWith(eslintPrefix)) {
      return `${oxlintPrefix}${eslintRuleId.slice(eslintPrefix.length)}`;
    }
  }

  return eslintRuleId;
};

export const oxlintConfig = {
  plugins: ['eslint', 'typescript', 'unicorn', 'import', 'promise'],
  // oxlint turns `correctness` on by default; only the rules listed here run.
  categories: { correctness: 'off' },
  rules: Object.fromEntries(
    Object.entries(eslintRulesMovedToOxlint).map(([ruleId, entry]) => [
      toOxlintRuleName(ruleId),
      entry,
    ]),
  ),
  // The tracked files ESLint does not lint: what the packages'
  // `eslint.config.mts` ignore, and what no ESLint config matches.
  ignorePatterns: [
    '**/eslint.config.mts',
    '**/*.astro',
    '**/test/dist_/**',
    'apps/synstate-docs/src/content.config.ts',
    'apps/synstate-dom-docs/src/content.config.ts',
    'languages/sumi/cli/demo/**',
    'languages/sumi/conformance/fixtures/**',
    'libs/ts-codemod-lib/test-code/**',
    'libs/ts-type-forge/configs/minimal-lib.d.mts',
    'libs/ts-type-forge/src/entry-point.mts',
    'libs/ts-type-forge/src/global.mts',
  ],
} as const;
