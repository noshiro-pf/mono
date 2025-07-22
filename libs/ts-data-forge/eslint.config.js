import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptEslintParser from '@typescript-eslint/parser';
import eslintPluginArrayFunc from 'eslint-plugin-array-func';
import eslintPluginFunctional from 'eslint-plugin-functional';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginPreferArrowFunctions from 'eslint-plugin-prefer-arrow-functions';
import eslintPluginPromise from 'eslint-plugin-promise';
import eslintPluginSecurity from 'eslint-plugin-security';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import eslintPluginVitest from 'eslint-plugin-vitest';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const restrictedSyntax = [
  {
    // ban "in" operator
    selector: "BinaryExpression[operator='in']",
    message: 'use "Object.hasOwn" instead.',
  },
  {
    // ban Object.prototype.hasOwnProperty.call
    selector:
      "MemberExpression[object.object.object.name='Object'][object.object.property.name='prototype'][object.property.name='hasOwnProperty'][property.name='call']",
    message: 'use "Object.hasOwn" instead.',
  },
  {
    // ban "new Array" expression
    selector: "NewExpression[callee.name='Array']",
    message: 'use Array.from instead.',
  },
];

const restrictedGlobals = [
  'eval',
  'Function',
  {
    name: 'Infinity',
    message: "use 'Number.Infinity' instead.",
  },
  {
    name: 'isFinite',
    message: "use 'Number.isFinite' instead.",
  },
  {
    name: 'isNaN',
    message: "use 'Number.isNaN' instead.",
  },
  {
    name: 'NaN',
    message: "use 'Number.NaN'  instead.",
  },
  {
    name: 'parseFloat',
    message: "use 'Number.parseFloat' instead.",
  },
  {
    name: 'parseInt',
    message: "use 'Number.parseInt' instead.",
  },
];

const banTypes = {
  object: {
    message: 'Use `UnknownRecord` instead.',
    fixWith: 'UnknownRecord',
  },
};

const restrictedImportsOption = {
  patterns: [
    {
      group: ['vitest'],
      importNames: ['describe', 'expect', 'it'],
      message: 'Use globals instead.',
    },
    {
      group: ['src/**'],
      message: 'Use relative import instead.',
    },
    {
      group: ['**/../index.mjs'],
      message: "Don't import from index.mjs.",
    },
  ],
};

const ignoredMutablePattern = [
  '^draft', // allow immer.js draft object
  '^mut_',
  '^_mut_',
  '^#mut_',
];
const immutableDataOptions = {
  ignoreClasses: true,
  ignoreImmediateMutation: true,
  ignoreIdentifierPattern: [
    ...ignoredMutablePattern,
    'this',
    'super',
    'window.location.href',
  ],
  ignoreNonConstDeclarations: false,
  ignoreAccessorPattern: [
    '**.mut_**',
    'this.**',
    'super.**',
    '**.current.**', // allow React Ref object
    '**.displayName', // allow React component displayName
    '**.scrollTop', // allow modifying scrollTop
  ],
};

const noLetOptions = {
  allowInForLoopInit: false,
  allowInFunctions: false,
  ignoreIdentifierPattern: ignoredMutablePattern.filter((p) => p !== '^draft'),
};

export default tseslint.config(
  {
    languageOptions: {
      ecmaVersion: 'latest',
      parser: typescriptEslintParser,

      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.es2021,
      },
    },
    linterOptions: {
      noInlineConfig: false,
      reportUnusedDisableDirectives: true,
    },

    plugins: {
      '@typescript-eslint': typescriptEslint,
      'array-func': eslintPluginArrayFunc,
      'prefer-arrow-functions': eslintPluginPreferArrowFunctions,
      functional: eslintPluginFunctional,
      import: eslintPluginImport,
      promise: eslintPluginPromise,
      security: eslintPluginSecurity,
      unicorn: eslintPluginUnicorn,
      vitest: eslintPluginVitest,
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': [
          '.test.ts',
          '.js',
          '.ts',
          '.mjs',
          '.mts',
          '.cjs',
          '.cts',
          '.jsx',
          '.tsx',
        ],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
          project: ['packages/**/tsconfig.json'],
        },
        // copied from default config
        node: {
          extensions: [
            '.test.ts',
            '.js',
            '.ts',
            '.mjs',
            '.mts',
            '.cjs',
            '.cts',
            '.jsx',
            '.tsx',
          ],
        },
      },
      // copied from default config
      'import/extensions': [
        '.js',
        '.ts',
        '.mjs',
        '.mts',
        '.cjs',
        '.cts',
        '.jsx',
        '.tsx',
      ],
      'import/external-module-folders': ['node_modules', 'node_modules/@types'],
    },
  },
  {
    ignores: ['eslint.config.js', 'dist', 'coverage'],
  },
  {
    files: ['**/*.mjs', '**/*.mts'],
    rules: {
      /**
       * Disable in favor of prettier
       *
       * @link https://github.com/eslint/eslint/blob/main/conf/eslint-all.js
       * @link https://github.com/eslint/eslint/blob/main/conf/eslint-recommended.js
       */

      // The following rules can be used in some cases. See the README for more
      // information. (These are marked with `0` instead of `"off"` so that a
      // script can distinguish them.)
      curly: 'off',
      'no-unexpected-multiline': 'off',

      // The rest are rules that you never need to enable when using Prettier.
      // 'new-parens': 'off',
      'unicode-bom': 'off',

      /**
       * Disable in favor of @typescript-eslint
       *
       * @link https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/eslint-recommended.ts
       */

      'constructor-super': 'off', // ts(2335) & ts(2377)
      'getter-return': 'off', // ts(2378)
      'no-const-assign': 'off', // ts(2588)
      'no-dupe-args': 'off', // ts(2300)
      'no-dupe-class-members': 'off', // ts(2393) & ts(2300)
      'no-dupe-keys': 'off', // ts(1117)
      'no-func-assign': 'off', // ts(2539)
      'no-import-assign': 'off', // ts(2539) & ts(2540)
      'no-obj-calls': 'off', // ts(2349)
      'no-redeclare': 'off', // ts(2451)
      'no-setter-return': 'off', // ts(2408)
      'no-this-before-super': 'off', // ts(2376)
      'no-undef': 'off', // ts(2304)
      'no-unreachable': 'off', // ts(7027)
      'no-unsafe-negation': 'off', // ts(2365) & ts(2360) & ts(2358)
      'no-var': 'error', // ts transpiles let/const to var, so no need for vars any more
      'prefer-const': 'error', // ts provides better types with const
      'prefer-rest-params': 'error', // ts provides better types with rest args over arguments
      'prefer-spread': 'error', // ts transpiles spread to apply, so no need for manual apply
      'valid-typeof': 'off', // ts(2367)

      // disable instead of enabling @typescript-eslint's equivalent or upward compatible rules
      'default-param-last': 'off',
      'dot-notation': 'off',
      'init-declarations': 'off',
      'no-array-constructor': 'off',
      'no-duplicate-imports': 'off',
      'no-empty-function': 'off',
      'no-implied-eval': 'off',
      'no-invalid-this': 'off',
      'no-loop-func': 'off',
      'no-loss-of-precision': 'off',
      'no-magic-numbers': 'off',
      'no-restricted-imports': 'off',
      'no-shadow': 'off',
      'no-throw-literal': 'off',
      'no-unused-expressions': 'off',
      'no-unused-vars': 'off',
      'no-use-before-define': 'off',
      'no-useless-constructor': 'off',
      'require-await': 'off',
      'class-methods-use-this': 'off',
      'prefer-promise-reject-errors': 'off',
      'consistent-return': 'off',

      // customized
      'accessor-pairs': 'error',

      // When there is no default case for a switch statement, there is a false positive that reports an error without considering type information.
      'array-callback-return': 'off',

      'arrow-body-style': ['error', 'as-needed'],
      'block-scoped-var': 'error',
      camelcase: 'off',
      'capitalized-comments': 'off',
      complexity: 'off',
      'consistent-this': 'error',
      'default-case-last': 'error',
      'default-case': 'off',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'for-direction': 'error',
      'func-name-matching': 'error',
      'func-names': ['error', 'as-needed', { generators: 'never' }],
      'func-style': ['error', 'expression'],
      'grouped-accessor-pairs': 'error',
      'guard-for-in': 'error',
      'id-denylist': 'error',
      'id-length': 'off',
      'id-match': 'error',
      'logical-assignment-operators': [
        'error',
        'always',
        { enforceForIfStatements: true },
      ],
      'max-classes-per-file': 'off',
      'max-depth': 'off',
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      'max-nested-callbacks': 'error',
      'max-params': 'off',
      'max-statements': 'off',
      'new-cap': 'off',
      'no-alert': 'error',
      'no-async-promise-executor': 'error',
      'no-await-in-loop': 'error',
      'no-bitwise': 'off',
      'no-caller': 'error',
      'no-case-declarations': 'error',
      'no-class-assign': 'error',
      'no-compare-neg-zero': 'error',
      'no-cond-assign': 'error',
      'no-console': 'off',
      'no-constant-binary-expression': 'error',
      'no-constant-condition': 'error',
      'no-constructor-return': 'error',
      'no-continue': 'off',
      'no-control-regex': 'error',
      'no-debugger': 'error',
      'no-delete-var': 'error',
      'no-div-regex': 'error',
      'no-dupe-else-if': 'error',
      'no-duplicate-case': 'error',
      'no-else-return': 'off',
      'no-empty-character-class': 'error',
      'no-empty-pattern': 'error',
      'no-empty-static-block': 'error',
      'no-empty': 'error',
      'no-eq-null': 'off',
      'no-eval': 'error',
      'no-ex-assign': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-extra-boolean-cast': [
        'error',
        {
          enforceForLogicalOperands: true,
        },
      ],
      'no-extra-label': 'error',
      'no-fallthrough': 'error',
      'no-global-assign': 'error',
      'no-implicit-coercion': [
        'error',
        {
          allow: [],
          boolean: false,
          disallowTemplateShorthand: true,
          number: true,
          string: true,
        },
      ],
      'no-implicit-globals': 'error',
      'no-inline-comments': 'off',
      'no-inner-declarations': 'error',
      'no-invalid-regexp': 'error',
      'no-irregular-whitespace': 'error',
      'no-iterator': 'error',
      'no-label-var': 'error',
      'no-labels': 'error',
      'no-lone-blocks': 'off',
      'no-lonely-if': 'off',
      'no-misleading-character-class': 'error',
      'no-multi-assign': 'error',
      'no-multi-str': 'error',
      'no-negated-condition': 'off',
      'no-nested-ternary': 'off', // unicorn/no-nested-ternary
      'no-new-func': 'error',
      'no-new-native-nonconstructor': 'error',
      'no-new-wrappers': 'error',
      'no-new': 'error',
      'no-nonoctal-decimal-escape': 'error',
      'no-object-constructor': 'error',
      'no-octal-escape': 'error',
      'no-octal': 'error',
      'no-param-reassign': 'error',

      'no-plusplus': [
        'error',
        {
          allowForLoopAfterthoughts: true,
        },
      ],

      'no-promise-executor-return': 'error',
      'no-proto': 'error',
      'no-prototype-builtins': 'error',
      'no-regex-spaces': 'error',
      'no-restricted-exports': 'error',
      'no-restricted-globals': ['error', ...restrictedGlobals],
      'no-restricted-properties': 'error',

      'no-restricted-syntax': ['error', ...restrictedSyntax],

      'no-return-assign': 'error',
      'no-script-url': 'error',
      'no-self-assign': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-shadow-restricted-names': 'error',
      'no-sparse-arrays': 'error',
      'no-template-curly-in-string': 'error',
      'no-ternary': 'off',
      'no-undef-init': 'off',
      'no-undefined': 'off',
      'no-underscore-dangle': 'off',
      'no-unmodified-loop-condition': 'error',
      'no-unneeded-ternary': 'error',
      'no-unreachable-loop': 'error',
      'no-unsafe-finally': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-unused-labels': 'error',
      'no-unused-private-class-members': 'error',
      'no-useless-backreference': 'error',
      'no-useless-call': 'error',
      'no-useless-catch': 'error',
      'no-useless-computed-key': 'error',
      'no-useless-concat': 'error',
      'no-useless-escape': 'error',
      'no-useless-rename': 'error',
      'no-useless-return': 'error',
      'no-void': 'error',
      'no-warning-comments': 'off',
      'no-with': 'error',
      'object-shorthand': 'error',
      'one-var': 'off',
      'operator-assignment': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-destructuring': 'off',
      'prefer-exponentiation-operator': 'error',
      'prefer-named-capture-group': 'off',
      'prefer-numeric-literals': 'error',
      'prefer-object-has-own': 'error',
      'prefer-object-spread': 'error',
      'prefer-regex-literals': 'error',

      'prefer-template': 'error',

      radix: 'error',
      'require-atomic-updates': 'error',
      'require-unicode-regexp': 'error',
      'require-yield': 'error',
      'sort-imports': 'off',
      'sort-keys': 'off',
      'sort-vars': 'off',
      strict: 'error',
      'symbol-description': 'off',
      'use-isnan': 'error',
      'vars-on-top': 'error',
      yoda: 'off',

      'no-useless-assignment': 'error',

      // deprecated
      'lines-around-comment': 0,
      'max-len': 0,
      'no-confusing-arrow': 0,
      'no-mixed-operators': 0,
      'no-tabs': 0,
      quotes: 0,
      'array-bracket-newline': 0,
      'array-bracket-spacing': 0,
      'array-element-newline': 0,
      'arrow-parens': 0,
      'arrow-spacing': 0,
      'block-spacing': 0,
      'brace-style': 0,
      'comma-dangle': 0,
      'comma-spacing': 0,
      'comma-style': 0,
      'computed-property-spacing': 0,
      'dot-location': 0,
      'eol-last': 0,
      'func-call-spacing': 0,
      'function-call-argument-newline': 0,
      'function-paren-newline': 0,
      'generator-star-spacing': 0,
      'implicit-arrow-linebreak': 0,
      indent: 0,
      'jsx-quotes': 0,
      'key-spacing': 0,
      'keyword-spacing': 0,
      'linebreak-style': 0,
      'multiline-ternary': 0,
      'newline-per-chained-call': 0,
      'no-extra-parens': 0,
      'no-extra-semi': 0,
      'no-floating-decimal': 0,
      'no-mixed-spaces-and-tabs': 0,
      'no-multi-spaces': 0,
      'no-multiple-empty-lines': 0,
      'no-trailing-spaces': 0,
      'no-whitespace-before-property': 0,
      'nonblock-statement-body-position': 0,
      'object-curly-newline': 0,
      'object-curly-spacing': 0,
      'object-property-newline': 0,
      'one-var-declaration-per-line': 0,
      'operator-linebreak': 0,
      'padded-blocks': 0,
      'quote-props': 0,
      'rest-spread-spacing': 0,
      semi: 0,
      'semi-spacing': 0,
      'semi-style': 0,
      'space-before-blocks': 0,
      'space-before-function-paren': 0,
      'space-in-parens': 0,
      'space-infix-ops': 0,
      'space-unary-ops': 0,
      'switch-colon-spacing': 0,
      'template-curly-spacing': 0,
      'template-tag-spacing': 0,
      'wrap-iife': 0,
      'wrap-regex': 0,
      'yield-star-spacing': 0,
      'new-parens': 0,
      'lines-between-class-members': 0,
      'padding-line-between-statements': 0,
      'no-return-await': 0,
      'max-statements-per-line': 0,
      'no-new-object': 0,
      'spaced-comment': 0,
      'callback-return': 0,
      'global-require': 0,
      'handle-callback-err': 0,
      'id-blacklist': 0,
      'indent-legacy': 0,
      'lines-around-directive': 0,
      'newline-after-var': 0,
      'newline-before-return': 0,
      'no-buffer-constructor': 0,
      'no-catch-shadow': 0,
      'no-mixed-requires': 0,
      'no-native-reassign': 0,
      'no-negated-in-lhs': 0,
      'no-new-require': 0,
      'no-path-concat': 0,
      'no-process-env': 0,
      'no-process-exit': 0,
      'no-restricted-modules': 0,
      'no-spaced-func': 0,
      'no-sync': 0,
      'prefer-reflect': 0,
      'no-new-symbol': 0, // ts(2588)
      'line-comment-position': 0,
      'multiline-comment-style': 0,
    },
  },
  {
    files: ['**/*.mjs', '**/*.mts'],
    rules: {
      '@typescript-eslint/adjacent-overload-signatures': 'error',
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'array',
          readonly: 'array',
        },
      ],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/ban-tslint-comment': 'error',
      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: banTypes,
        },
      ],
      '@typescript-eslint/class-literal-property-style': 'error',
      '@typescript-eslint/consistent-indexed-object-style': 'error',
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'never',
        },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': [
        // relates to import/consistent-type-specifier-style rule
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
          disallowTypeAnnotations: true,
        },
      ],
      '@typescript-eslint/consistent-type-exports': [
        'off',
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],
      '@typescript-eslint/default-param-last': 'error',

      /** Prefer noPropertyAccessFromIndexSignature */
      '@typescript-eslint/dot-notation': 'off',

      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowConciseArrowFunctionExpressionsStartingWithVoid: false,
          allowDirectConstAssertionInArrowFunctions: true,
          allowedNames: [],
          allowFunctionsWithoutTypeParameters: false,
          allowIIFEs: false,
        },
      ],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { accessibility: 'no-public' },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off', // preferred to use explicit-function-return-type
      '@typescript-eslint/init-declarations': 'off',
      '@typescript-eslint/member-ordering': 'off',

      '@typescript-eslint/method-signature-style': 'error',
      '@typescript-eslint/prefer-function-type': 'error',

      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-array-constructor': 'error',
      '@typescript-eslint/no-base-to-string': 'error',
      '@typescript-eslint/no-confusing-non-null-assertion': 'error',
      '@typescript-eslint/no-confusing-void-expression': 'error',
      '@typescript-eslint/no-dupe-class-members': 'error',
      '@typescript-eslint/no-dynamic-delete': 'error',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-extra-non-null-assertion': 'error',
      '@typescript-eslint/no-extraneous-class': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/no-implied-eval': 'error',

      '@typescript-eslint/no-inferrable-types': 'off',

      '@typescript-eslint/no-invalid-this': 'error',
      '@typescript-eslint/no-invalid-void-type': 'error',
      '@typescript-eslint/no-loop-func': 'error',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-meaningless-void-operator': 'error',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksConditionals: false,
        },
      ],
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-redeclare': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-restricted-imports': [
        'error',
        restrictedImportsOption,
      ],
      '@typescript-eslint/no-shadow': [
        'error',
        {
          builtinGlobals: true,
          hoist: 'all',
          ignoreTypeValueShadow: true,
          ignoreFunctionTypeParameterNameValueShadow: false,
        },
      ],
      '@typescript-eslint/no-this-alias': 'error',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      '@typescript-eslint/no-unnecessary-condition': [
        'error',
        { allowConstantLoopConditions: true },
      ],
      '@typescript-eslint/no-unnecessary-qualifier': 'error',
      '@typescript-eslint/no-unnecessary-type-arguments': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': [
        'error',
        { checkLiteralConstAssertions: true },
      ],
      '@typescript-eslint/no-unnecessary-type-constraint': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-declaration-merging': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^jsx$|^_',
          args: 'none',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreClassWithStaticInitBlock: false,
          reportUsedIgnorePattern: true,
        },
      ],
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-useless-empty-export': 'error',
      '@typescript-eslint/no-useless-constructor': 'error',
      '@typescript-eslint/non-nullable-type-assertion-style': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/prefer-enum-initializers': 'error',
      '@typescript-eslint/prefer-for-of': 'error',

      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/prefer-literal-enum-member': 'error',
      '@typescript-eslint/prefer-namespace-keyword': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        {
          allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
          ignoreConditionalTests: false,
          ignoreTernaryTests: false,
          ignoreMixedLogicalExpressions: false,
          ignorePrimitives: {
            bigint: false,
            boolean: false,
            number: false,
            string: false,
          },
        },
      ],
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/prefer-readonly-parameter-types': [
        'error',
        {
          checkParameterProperties: true,
          ignoreInferredTypes: true,
          treatMethodsAsReadonly: true,
        },
      ],
      '@typescript-eslint/prefer-reduce-type-parameter': 'error',
      '@typescript-eslint/prefer-regexp-exec': 'error',
      '@typescript-eslint/prefer-return-this-type': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/promise-function-async': 'off',

      '@typescript-eslint/require-array-sort-compare': [
        'error',
        {
          ignoreStringArrays: true,
        },
      ],
      '@typescript-eslint/require-await': 'error',

      '@typescript-eslint/restrict-plus-operands': [
        'error',
        {
          skipCompoundAssignments: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
          allowAny: false,
        },
      ],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowNumber: true,
          allowBoolean: true,
          allowNullish: true,
          allowAny: false,
          allowNever: false,
          allowRegExp: false,
          allowArray: false,
        },
      ],
      '@typescript-eslint/return-await': 'error',

      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        { allowString: false, allowNumber: false, allowNullableObject: false },
      ],

      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],

      '@typescript-eslint/triple-slash-reference': [
        'error',
        {
          lib: 'never',
          types: 'always',
          path: 'always',
        },
      ],
      '@typescript-eslint/typedef': 'error',
      '@typescript-eslint/unbound-method': 'error',
      '@typescript-eslint/unified-signatures': 'error',

      '@typescript-eslint/consistent-generic-constructors': 'error',
      '@typescript-eslint/no-duplicate-enum-values': 'error',
      '@typescript-eslint/parameter-properties': 'error',

      // This rule must be enabled when the --verbatimModuleSyntax compiler option is enabled
      '@typescript-eslint/no-import-type-side-effects': 'off',

      '@typescript-eslint/no-mixed-enums': 'error',

      '@typescript-eslint/no-duplicate-type-constituents': 'error',
      '@typescript-eslint/no-unsafe-enum-comparison': 'error',

      '@typescript-eslint/class-methods-use-this': 'error',
      '@typescript-eslint/max-params': 'off',
      '@typescript-eslint/prefer-destructuring': 'off',

      '@typescript-eslint/no-unsafe-unary-minus': 'error',

      '@typescript-eslint/consistent-return': 'off',
      '@typescript-eslint/no-array-delete': 'error',
      '@typescript-eslint/prefer-find': 'error',

      '@typescript-eslint/prefer-promise-reject-errors': 'off',

      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
      '@typescript-eslint/only-throw-error': [
        'error',
        {
          allowThrowingAny: false,
          allowThrowingUnknown: false,
        },
      ],

      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-unnecessary-parameter-property-assignment':
        'error',
      '@typescript-eslint/no-unnecessary-template-expression': 'error',

      '@typescript-eslint/no-unnecessary-type-parameters': 'off',

      '@typescript-eslint/no-unsafe-function-type': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',
      '@typescript-eslint/no-deprecated': 'error',

      '@typescript-eslint/no-unsafe-type-assertion': 'error',

      '@typescript-eslint/related-getter-setter-pairs': 'error',

      '@typescript-eslint/no-misused-spread': 'error',

      // deprecated
      '@typescript-eslint/no-type-alias': 0,
      '@typescript-eslint/prefer-ts-expect-error': 0,
      '@typescript-eslint/sort-type-constituents': 0,
      '@typescript-eslint/no-var-requires': 0,
      '@typescript-eslint/no-empty-interface': 0,
      '@typescript-eslint/no-loss-of-precision': 0,

      'array-func/from-map': 'error',
      'array-func/no-unnecessary-this-arg': 'error',
      'array-func/prefer-array-from': 'error',
      'array-func/avoid-reverse': 'error',
      'array-func/prefer-flat-map': 'error',
      'array-func/prefer-flat': 'error',

      'functional/immutable-data': ['error', immutableDataOptions],
      'functional/no-let': ['error', noLetOptions],
      'functional/prefer-property-signatures': 'error',
      'functional/no-classes': 'off',
      'functional/no-mixed-types': 'off',
      'functional/no-this-expressions': 'off',
      'functional/no-conditional-statements': 'off',
      'functional/no-expression-statements': 'off',
      'functional/no-loop-statements': 'off',
      'functional/no-return-void': 'off',
      'functional/no-promise-reject': 'off',
      'functional/no-throw-statements': 'off',
      'functional/no-try-statements': 'off',
      'functional/functional-parameters': 'off',
      'functional/prefer-tacit': 'off', // false positives
      'functional/readonly-type': ['error', 'generic'],
      'functional/type-declaration-immutability': 'off',
      'functional/no-class-inheritance': 'error',

      'import/named': 'off',
      'import/default': 'error',
      'import/namespace': 'error',
      'import/no-restricted-paths': 'off', // TODO
      'import/no-absolute-path': 'error',
      'import/no-dynamic-require': 'error',
      'import/no-internal-modules': [
        'error',
        {
          allow: ['vitest/config', '*/index.mjs', '*/index.js'],
        },
      ],
      'import/no-webpack-loader-syntax': 'error',
      'import/no-self-import': 'error',
      'import/no-cycle': 'error',
      'import/no-useless-path-segments': 'error',
      'import/no-relative-parent-imports': 'off',

      // relates to @typescript-eslint/consistent-type-imports rule
      'import/consistent-type-specifier-style': ['error', 'prefer-inline'],

      'import/no-relative-packages': 'error',

      // helpfulWarnings
      'import/export': 'error',
      'import/no-named-as-default': 'error',
      'import/no-named-as-default-member': 'error',

      // prefer @typescript-eslint/no-deprecated
      // https://github.com/import-js/eslint-plugin-import/issues/1532
      'import/no-deprecated': 'off',

      'import/no-mutable-exports': 'error',
      'import/no-unused-modules': 'off',

      'import/unambiguous': 'error',
      'import/no-commonjs': 'off',
      'import/no-amd': 'error',
      'import/no-nodejs-modules': 'off',
      'import/no-import-module-exports': 'off',

      'import/first': ['error', 'absolute-first'],
      'import/exports-last': 'off',
      'import/no-duplicates': 'error',
      'import/no-namespace': 'off',
      'import/extensions': [
        'error',
        'never',
        {
          pattern: { json: 'always', mjs: 'always' },
        },
      ],

      'import/order': 'off',
      'import/newline-after-import': [
        'error',
        {
          considerComments: true,
          count: 1,
        },
      ],
      'import/prefer-default-export': 'off',
      'import/max-dependencies': 'off',
      'import/no-unassigned-import': [
        'error',
        {
          allow: [
            '**/*.css',
            '@testing-library/jest-dom/**',
            'solid-js',
            'zx/globals',
          ],
        },
      ],
      'import/no-named-default': 'off',

      'import/no-default-export': 'error',

      'import/no-named-export': 'off',
      'import/no-anonymous-default-export': 'error',
      'import/group-exports': 'off',
      'import/dynamic-import-chunkname': 'error',
      'import/no-empty-named-blocks': 'error',

      'import/no-extraneous-dependencies': [
        'error',
        {
          packageDir: import.meta.dirname,
        },
      ],

      'prefer-arrow-functions/prefer-arrow-functions': [
        'error',
        {
          allowedNames: [],
          allowObjectProperties: false,
          allowNamedFunctions: false,
          classPropertiesAllowed: false,
          disallowPrototype: true,
          returnStyle: 'implicit',
          singleReturnOnly: false,
        },
      ],

      'promise/catch-or-return': ['error', { allowFinally: true }],
      'promise/no-return-wrap': 'error',
      'promise/param-names': 'error',
      'promise/always-return': 'off',
      'promise/no-native': 'off',
      'promise/no-nesting': 'error',
      'promise/no-promise-in-callback': 'error',
      'promise/avoid-new': 'off',
      'promise/no-new-statics': 'error',
      'promise/no-return-in-finally': 'error',
      'promise/valid-params': 'error',
      'promise/prefer-await-to-then': 'off',
      'promise/prefer-await-to-callbacks': 'off',
      'promise/no-multiple-resolved': 'error',
      'promise/spec-only': 'error',
      'promise/prefer-catch': 'error',

      'security/detect-unsafe-regex': 'error',
      'security/detect-non-literal-regexp': 'error',
      'security/detect-non-literal-require': 'error',
      'security/detect-non-literal-fs-filename': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-pseudoRandomBytes': 'error',
      'security/detect-possible-timing-attacks': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'error',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-object-injection': 'off', // too many false positives
      'security/detect-new-buffer': 'error',
      'security/detect-bidi-characters': 'error',

      /**
       * Disable in favor of prettier
       *
       * @link https://github.com/prettier/eslint-config-prettier/blob/main/index.js
       */
      'unicorn/empty-brace-spaces': 'off',
      'unicorn/no-nested-ternary': 'off',
      'unicorn/number-literal-case': 'off',

      'unicorn/better-regex': 'error',
      'unicorn/catch-error-name': 'error',

      /** Enforce consistent destructuring usage for props */
      'unicorn/consistent-destructuring': 'error',

      'unicorn/consistent-function-scoping': 'error',
      'unicorn/custom-error-definition': 'off',
      'unicorn/error-message': 'error',
      'unicorn/escape-case': 'error',
      'unicorn/expiring-todo-comments': 'error',
      'unicorn/explicit-length-check': 'off',

      /** Enforce consistent filename casing */
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
          ignore: ['serviceWorker.ts', 'setupTests.ts'],
        },
      ],

      'unicorn/import-style': [
        'error',
        {
          styles: {
            util: {
              namespace: true,
              named: false,
            },
            'node:util': {
              namespace: true,
              named: false,
            },
            path: {
              namespace: true,
              named: false,
            },
            'node:path': {
              namespace: true,
              named: false,
            },
          },
        },
      ],
      'unicorn/new-for-builtins': 'error',
      'unicorn/no-abusive-eslint-disable': 'error',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-array-for-each': 'error',
      'unicorn/no-array-method-this-argument': 'off', // not compatible with my Arr.map utility
      'unicorn/no-array-push-push': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-await-expression-member': 'error',
      'unicorn/no-console-spaces': 'off', // turned off to enable aligning output
      'unicorn/no-document-cookie': 'error',
      'unicorn/no-empty-file': 'error',
      'unicorn/no-for-loop': 'error',
      'unicorn/no-hex-escape': 'error',
      'unicorn/no-instanceof-array': 'error',
      'unicorn/no-invalid-remove-event-listener': 'error',
      'unicorn/no-keyword-prefix': 'off', // {"onlyCamelCase": false}
      'unicorn/no-lonely-if': 'error',
      'unicorn/no-negated-condition': 'off',
      'unicorn/no-new-array': 'error',
      'unicorn/no-new-buffer': 'error',
      'unicorn/no-null': 'off',
      'unicorn/no-object-as-default-parameter': 'error',
      'unicorn/no-process-exit': 'error',
      'unicorn/no-static-only-class': 'error',
      'unicorn/no-thenable': 'error',
      'unicorn/no-this-assignment': 'error',
      'unicorn/no-typeof-undefined': 'error',
      'unicorn/no-unnecessary-await': 'error',
      'unicorn/no-unreadable-array-destructuring': 'error',
      'unicorn/no-unsafe-regex': 0, // dup of "security/detect-unsafe-regex"
      'unicorn/no-unused-properties': 'error',
      'unicorn/no-useless-fallback-in-spread': 'error',
      'unicorn/no-useless-length-check': 'error',
      'unicorn/no-useless-promise-resolve-reject': 'error',
      'unicorn/no-useless-spread': 'error',
      'unicorn/no-useless-undefined': 'off', // this conflicts with @typescript-eslint/init-declarations
      'unicorn/no-zero-fractions': 'error',
      'unicorn/numeric-separators-style': 'off',
      'unicorn/prefer-add-event-listener': 'error',
      'unicorn/prefer-array-find': 'error',
      'unicorn/prefer-array-flat': 'error',
      'unicorn/prefer-array-flat-map': 'error',
      'unicorn/prefer-array-index-of': 'error',
      'unicorn/prefer-array-some': 'error',
      // TODO: Enable this by default when targeting a Node.js version that supports `Array#at`.
      'unicorn/prefer-at': [
        'error',
        {
          checkAllIndexAccess: false,
        },
      ],
      'unicorn/prefer-code-point': 'error',
      'unicorn/prefer-date-now': 'error',
      'unicorn/prefer-default-parameters': 'error',
      'unicorn/prefer-dom-node-append': 'error',
      'unicorn/prefer-dom-node-dataset': 'error',
      'unicorn/prefer-dom-node-remove': 'error',
      'unicorn/prefer-dom-node-text-content': 'error',
      'unicorn/prefer-export-from': 'error',
      'unicorn/prefer-includes': 'error',
      'unicorn/prefer-json-parse-buffer': 'off',
      'unicorn/prefer-keyboard-event-key': 'error',
      'unicorn/prefer-math-trunc': 'error',
      'unicorn/prefer-modern-dom-apis': 'error',
      'unicorn/prefer-module': 'error',
      'unicorn/prefer-negative-index': 'error',
      'unicorn/prefer-node-protocol': 'off', // TODO: enable this
      'unicorn/prefer-number-properties': 'error',
      'unicorn/prefer-object-from-entries': 'error',
      'unicorn/prefer-optional-catch-binding': 'error',
      'unicorn/prefer-prototype-methods': 'error',
      'unicorn/prefer-query-selector': 'error',
      'unicorn/prefer-reflect-apply': 'error',
      'unicorn/prefer-regexp-test': 'error',
      'unicorn/prefer-set-has': 'error',
      'unicorn/prefer-set-size': 'error',
      'unicorn/prefer-spread': 'off', // prefer array-func/prefer-array-from
      // TODO: Enable this by default when targeting Node.js 16.
      'unicorn/prefer-string-replace-all': 'error',
      'unicorn/prefer-string-slice': 'error',
      'unicorn/prefer-string-starts-ends-with': 'error',
      'unicorn/prefer-string-trim-start-end': 'error',
      'unicorn/prefer-switch': [
        'error',
        { minimumCases: 2, emptyDefaultCase: 'no-default-case' },
      ],
      'unicorn/prefer-ternary': ['error', 'only-single-line'],
      // TODO: Enable this by default when targeting Node.js 14.
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/prefer-type-error': 'error',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/relative-url-style': 'error',
      'unicorn/require-array-join-separator': 'error',
      'unicorn/require-number-to-fixed-digits-argument': 'error',
      // Turned off because we can't distinguish `widow.postMessage` and `{Worker,MessagePort,Client,BroadcastChannel}#postMessage()`
      // See #1396
      'unicorn/require-post-message-target-origin': 'off',
      'unicorn/string-content': 'error',
      'unicorn/switch-case-braces': 'off', // TODO: Enable this
      'unicorn/template-indent': 'error',
      'unicorn/text-encoding-identifier-case': 'error',
      'unicorn/throw-new-error': 'error',
      'unicorn/no-unreadable-iife': 'error',
      'unicorn/no-useless-switch-case': 'error',
      'unicorn/prefer-modern-math-apis': 'error',

      /**
       * `.some(b => b)` is better than `.some(Boolean)` because `Boolean` coerce
       * non-boolean type to boolean.
       *
       * Related rules:
       *
       * - `@typescript-eslint/strict-boolean-expressions`
       */
      'unicorn/prefer-native-coercion-functions': 'off',

      'unicorn/prefer-event-target': 'error',
      'unicorn/prefer-logical-operator-over-ternary': 'error',
      'unicorn/prefer-blob-reading-methods': 'error',
      'unicorn/no-unnecessary-polyfills': 'error',
      'unicorn/no-anonymous-default-export': 'error',
      'unicorn/no-await-in-promise-methods': 'error',
      'unicorn/no-single-promise-in-promise-methods': 'error',
      'unicorn/consistent-empty-array-spread': 'error',
      'unicorn/no-invalid-fetch-options': 'error',
      'unicorn/no-magic-array-flat-depth': 'error',
      'unicorn/prefer-string-raw': 'error',
      'unicorn/prefer-structured-clone': 'error',
      'unicorn/no-length-as-slice-end': 'error',
      'unicorn/no-negation-in-equality-check': 'error',
      'unicorn/consistent-existence-index-check': 'error',
      'unicorn/prefer-global-this': 'error',
      'unicorn/prefer-math-min-max': 'error',

      'vitest/expect-expect': 'off',
      'vitest/max-expects': 'off',
      'vitest/max-nested-describe': 'error',
      'vitest/no-commented-out-tests': 'off',
      'vitest/no-conditional-expect': 'off',
      'vitest/no-conditional-in-test': 'off',
      'vitest/no-duplicate-hooks': 'error',
      'vitest/no-hooks': 'error',
      'vitest/no-restricted-matchers': [
        'error',
        {
          toBeTruthy: 'Use `.toBe(true)` instead.',
          toBeFalsy: 'Use `.toBe(false)` instead.',
        },
      ],
      'vitest/no-standalone-expect': 'error',
      'vitest/prefer-comparison-matcher': 'error',
      'vitest/prefer-equality-matcher': 'error',
      'vitest/prefer-hooks-in-order': 'error',
      'vitest/prefer-hooks-on-top': 'error',
      'vitest/prefer-strict-equal': 'error',
      'vitest/prefer-to-be': 'error',
      'vitest/prefer-to-contain': 'error',
      'vitest/prefer-to-have-length': 'error',
      'vitest/require-hook': 'off',
      'vitest/require-to-throw-message': 'error',
      'vitest/require-top-level-describe': 'off',
      'vitest/valid-describe-callback': 'error',
      'vitest/valid-expect': 'error',
      'vitest/valid-title': 'off',

      'vitest/consistent-test-it': ['error', { fn: 'test' }],
      'vitest/no-alias-methods': 'error',
      'vitest/no-disabled-tests': 'error',
      'vitest/no-focused-tests': 'error',
      'vitest/no-identical-title': 'error',
      'vitest/no-interpolation-in-snapshots': 'error',
      'vitest/no-large-snapshots': 'error',
      'vitest/no-mocks-import': 'error',
      'vitest/no-restricted-vi-methods': [
        'error',
        {
          advanceTimersByTime: null,
          spyOn: null,
        },
      ],
      'vitest/no-test-prefixes': 'error',
      'vitest/no-test-return-statement': 'error',
      'vitest/prefer-called-with': 'error',
      'vitest/prefer-each': 'error',
      'vitest/prefer-expect-assertions': 'off',
      'vitest/prefer-expect-resolves': 'error',
      'vitest/prefer-lowercase-title': 'off',
      'vitest/prefer-mock-promise-shorthand': 'error',
      'vitest/prefer-snapshot-hint': 'error',
      'vitest/prefer-spy-on': 'error',
      'vitest/prefer-todo': 'error',

      // Turned off because it prevents writing inline tests
      'vitest/no-conditional-tests': 'off',

      'vitest/consistent-test-filename': 'error',
      'vitest/no-import-node-test': 'error',

      // toBeFalsy() is looser than toBe(false), so these rules are rejected
      'vitest/prefer-to-be-falsy': 'off',
      'vitest/prefer-to-be-truthy': 'off',

      'vitest/prefer-to-be-object': 'error',
      'vitest/require-local-test-context-for-concurrent-snapshots': 'error',
    },
  },
  {
    files: ['test/**/*.mts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/no-restricted-types': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
    },
  },
  {
    files: ['scripts/**/*'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      'unicorn/no-process-exit': 'off',
      'import/no-unassigned-import': 'off',
    },
  },
  {
    files: ['configs/**/*', '.markdownlint-cli2.mjs'],
    rules: { 'import/no-default-export': 'off' },
  },
  {
    files: ['**/*.test.mts'],
    rules: {
      'unicorn/consistent-function-scoping': 'off',
    },
  },
  {
    files: ['samples/**/*'],
    rules: { 'import/no-extraneous-dependencies': 'off' },
  },
  {
    files: ['**/*.d.mts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
);
