import { allExtensionsRegexUnionStr } from '../constants/index.mjs';
import {
  withDefaultOption,
  type TypeScriptEslintRules,
} from '../types/index.mjs';

export const typescriptEslintRules = {
  '@typescript-eslint/adjacent-overload-signatures': 'error',
  '@typescript-eslint/array-type': [
    'error',
    { default: 'array', readonly: 'array' },
  ],
  '@typescript-eslint/await-thenable': 'error',
  '@typescript-eslint/ban-ts-comment': withDefaultOption('error'),
  '@typescript-eslint/ban-tslint-comment': 'error',
  '@typescript-eslint/no-restricted-types': [
    'error',
    {
      types: {
        object: {
          message:
            'Use `UnknownRecord` from https://www.npmjs.com/package/ts-type-forge instead.',
          fixWith: 'UnknownRecord',
        },
      },
    },
  ],

  '@typescript-eslint/class-literal-property-style': withDefaultOption('error'),
  '@typescript-eslint/consistent-indexed-object-style':
    withDefaultOption('error'),
  '@typescript-eslint/consistent-type-assertions': [
    'error',
    {
      // Only the style of casting with <T> is prohibited here.
      // Type assertions themselves are prohibited by total-functions/no-unsafe-type-assertion.
      assertionStyle: 'as',
      arrayLiteralTypeAssertions: 'allow',
      objectLiteralTypeAssertions: 'allow',
    },
  ],
  '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
  '@typescript-eslint/consistent-type-imports': [
    // relates to import-x/consistent-type-specifier-style rule
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

  /** Related to noPropertyAccessFromIndexSignature tsc option */
  '@typescript-eslint/dot-notation': [
    'error',
    { allowIndexSignaturePropertyAccess: true },
  ],

  '@typescript-eslint/explicit-member-accessibility': [
    'error',
    { accessibility: 'no-public' },
  ],

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
  '@typescript-eslint/explicit-module-boundary-types': 'off', // Covered by explicit-function-return-type

  '@typescript-eslint/init-declarations': 'off', // let is disabled by functional/no-let
  '@typescript-eslint/member-ordering': 'off', // disabled

  /**
   * Function members written in method notation become bivariant, reducing type
   * safety
   * https://github.com/Microsoft/TypeScript/wiki/FAQ#why-are-function-parameters-bivariant
   */
  '@typescript-eslint/method-signature-style': ['error', 'property'],
  '@typescript-eslint/prefer-function-type': 'error',

  '@typescript-eslint/naming-convention': 'off', // disabled
  '@typescript-eslint/no-array-constructor': 'error',
  '@typescript-eslint/no-base-to-string': withDefaultOption('error'),
  '@typescript-eslint/no-confusing-non-null-assertion': 'error',
  '@typescript-eslint/no-confusing-void-expression': [
    'error',
    {
      ignoreArrowShorthand: false,
      ignoreVoidOperator: false,
      ignoreVoidReturningFunctions: false,
    },
  ],
  '@typescript-eslint/no-dupe-class-members': 'error',
  '@typescript-eslint/no-dynamic-delete': 'error',
  '@typescript-eslint/no-empty-function': 'off', // disabled
  '@typescript-eslint/no-explicit-any': [
    'error',
    { fixToUnknown: false, ignoreRestArgs: false },
  ],
  '@typescript-eslint/no-extra-non-null-assertion': 'error',
  '@typescript-eslint/no-extraneous-class': withDefaultOption('error'),
  '@typescript-eslint/no-floating-promises': withDefaultOption('error'),
  '@typescript-eslint/no-for-in-array': 'error',
  '@typescript-eslint/no-implied-eval': 'error',

  /** Off to allow explicit type annotations when desired */
  '@typescript-eslint/no-inferrable-types': 'off', // disabled

  '@typescript-eslint/no-invalid-this': withDefaultOption('error'),
  '@typescript-eslint/no-invalid-void-type': withDefaultOption('error'),
  '@typescript-eslint/no-loop-func': 'error',
  '@typescript-eslint/no-magic-numbers': 'off', // disabled
  '@typescript-eslint/no-meaningless-void-operator': withDefaultOption('error'),
  '@typescript-eslint/no-misused-new': 'error',
  '@typescript-eslint/no-misused-promises': [
    'error',
    {
      checksVoidReturn: true,
      checksSpreads: true,
      checksConditionals: false, // Covered by strict-boolean-expressions
    },
  ],
  '@typescript-eslint/no-namespace': 'off', // disabled
  '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
  '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
  '@typescript-eslint/no-non-null-assertion': 'error',
  '@typescript-eslint/no-redeclare': 'off', // disabled
  '@typescript-eslint/no-redundant-type-constituents': 'error',

  // Note: If paths with the same name are defined multiple times, later definitions may overwrite earlier ones
  '@typescript-eslint/no-restricted-imports': [
    'error',
    {
      patterns: [
        {
          regex: String.raw`^(\.\/|\.\.\/)+index\.(${allExtensionsRegexUnionStr})$`,
          message:
            'Do not specify index.mjs directly by relative path, but import it by module name (e.g. ./X/index.mjs).',
        },
      ],
    },
  ],

  '@typescript-eslint/no-shadow': [
    'error',
    {
      builtinGlobals: true,
      hoist: 'all',
      ignoreTypeValueShadow: false,
      ignoreFunctionTypeParameterNameValueShadow: false,
    },
  ],
  '@typescript-eslint/no-this-alias': withDefaultOption('error'),
  '@typescript-eslint/no-unnecessary-boolean-literal-compare': [
    'error',
    {
      allowComparingNullableBooleansToTrue: true,
      allowComparingNullableBooleansToFalse: true,
    },
  ],
  '@typescript-eslint/no-unnecessary-condition': [
    'error',
    { allowConstantLoopConditions: true },
  ],
  '@typescript-eslint/no-unnecessary-qualifier': 'error',
  '@typescript-eslint/no-unnecessary-type-arguments': 'off', // disabled
  '@typescript-eslint/no-unnecessary-type-assertion': [
    'error',
    { checkLiteralConstAssertions: true },
  ],
  '@typescript-eslint/no-unnecessary-type-constraint': 'error',
  '@typescript-eslint/no-unsafe-argument': 'error',
  '@typescript-eslint/no-unsafe-assignment': 'error',
  '@typescript-eslint/no-unsafe-call': 'error',
  '@typescript-eslint/no-unsafe-declaration-merging': 'error',
  '@typescript-eslint/no-unsafe-member-access': [
    'error',
    { allowOptionalChaining: false },
  ],
  '@typescript-eslint/no-unsafe-return': 'error',
  '@typescript-eslint/no-unused-expressions': [
    'error',
    {
      allowShortCircuit: false,
      allowTernary: false,
      allowTaggedTemplates: false,
      enforceForJSX: true,
      ignoreDirectives: false,
    },
  ],
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
  '@typescript-eslint/no-use-before-define': 'off', // disabled
  '@typescript-eslint/no-useless-empty-export': 'error',
  '@typescript-eslint/no-useless-constructor': 'error',
  '@typescript-eslint/non-nullable-type-assertion-style': 'error',
  '@typescript-eslint/prefer-as-const': 'error',
  '@typescript-eslint/prefer-enum-initializers': 'error',
  '@typescript-eslint/prefer-for-of': 'error',

  '@typescript-eslint/prefer-includes': 'error',
  '@typescript-eslint/prefer-literal-enum-member': withDefaultOption('error'),
  '@typescript-eslint/prefer-namespace-keyword': 'error',
  '@typescript-eslint/prefer-nullish-coalescing': [
    'error',
    {
      allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
      ignoreConditionalTests: false,
      ignoreTernaryTests: false,
      ignoreMixedLogicalExpressions: false,
      ignoreBooleanCoercion: false,
      ignoreIfStatements: false,
      ignorePrimitives: {
        bigint: false,
        boolean: false,
        number: false,
        string: false,
      },
    },
  ],
  '@typescript-eslint/prefer-optional-chain': [
    'error',
    {
      allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing: false,
      checkAny: true,
      checkBigInt: true,
      checkBoolean: true,
      checkNumber: true,
      checkString: true,
      checkUnknown: true,
      requireNullish: false,
    },
  ],
  '@typescript-eslint/prefer-readonly': ['error', { onlyInlineLambdas: false }],
  '@typescript-eslint/prefer-readonly-parameter-types': [
    'error',
    {
      checkParameterProperties: true,
      ignoreInferredTypes: true,
      treatMethodsAsReadonly: true,
      allow: [
        {
          from: 'lib',
          name: [
            'RegExp',
            'AnimationEvent',
            'ClipboardEvent',
            'CompositionEvent',
            'DragEvent',
            'Element',
            'Event',
            'FocusEvent',
            'HTMLCanvasElement',
            'HTMLDivElement',
            'HTMLElement',
            'HTMLImageElement',
            'HTMLInputElement',
            'HTMLSelectElement',
            'HTMLTextAreaElement',
            'KeyboardEvent',
            'MouseEvent',
            'PointerEvent',
            'TouchEvent',
            'TransitionEvent',
            'UIEvent',
            'WheelEvent',
          ],
        },
        {
          from: 'package',
          package: 'react',
          name: [
            // 'AbstractView',
            // 'TouchList',
            // 'Touch',
            // 'BaseSyntheticEvent',
            // 'ChangeEvent',
            // 'Element',
            'FC',
            // 'Event',
            // 'FormEvent',
            // 'KeyboardEvent',
            // 'KeyboardEventHandler',
            // 'MouseEvent',
            // 'MouseEventHandler',
            'ReactNode',
            // 'SyntheticEvent',
            // 'TouchEvent',
            // 'TouchEventHandler',
            // 'UIEvent',
          ],
        },
        // {
        //   from: 'package',
        //   package: 'preact',
        //   name: ['FunctionComponent'],
        // },
      ],
    },
  ],
  '@typescript-eslint/prefer-reduce-type-parameter': 'error',
  '@typescript-eslint/prefer-regexp-exec': 'error',
  '@typescript-eslint/prefer-return-this-type': 'error',
  '@typescript-eslint/prefer-string-starts-ends-with': [
    'error',
    {
      // Allows code like: `text[0] === text[0].toUpperCase();`
      allowSingleElementEquality: 'always',
    },
  ],

  /**
   * Prevent forgetting compare function when sorting numbers, as `sort`
   * defaults to string comparison.
   */
  '@typescript-eslint/require-array-sort-compare': [
    'error',
    { ignoreStringArrays: true },
  ],

  '@typescript-eslint/require-await': 'error',
  '@typescript-eslint/promise-function-async': 'off', // Conflicts with require-await rule

  /**
   * Used to avoid ambiguity with `+` operator. restrict-plus-operands limits
   * usage to only bigint, number, string types, and prefer-template prohibits
   * using `+` for string concatenation. Fix: Use template literals or join
   * string arrays with `join("")`.
   *
   * - A + b -> `${a}${b}`
   * - S_1 + s_2 + ... + s_n -> [s_1, ..., s_n].join("")
   */
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
  '@typescript-eslint/return-await': withDefaultOption('error'),

  /**
   * Used to avoid implicit casting to Boolean. Prevents overlooking that
   * numbers `0`, `NaN` and string `""` are treated as false in conditionals.
   */
  '@typescript-eslint/strict-boolean-expressions': [
    'error',
    {
      allowAny: false,
      allowNullableBoolean: false,
      allowNullableEnum: false,
      allowNullableNumber: false,
      allowNullableObject: false, // default: true
      allowNullableString: false,
      allowNumber: false, // default: true
      allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
      allowString: false, // default: true
    },
  ],

  /** Prevent missing switch cases (using type information) */
  '@typescript-eslint/switch-exhaustiveness-check': [
    'error',
    {
      allowDefaultCaseForExhaustiveSwitch: false,
      requireDefaultForNonUnion: true,
    },
  ],

  '@typescript-eslint/triple-slash-reference': [
    'error',
    { lib: 'never', types: 'always', path: 'always' },
  ],
  '@typescript-eslint/unbound-method': withDefaultOption('error'),
  '@typescript-eslint/unified-signatures': withDefaultOption('error'),

  '@typescript-eslint/consistent-generic-constructors':
    withDefaultOption('error'),
  '@typescript-eslint/no-duplicate-enum-values': 'error',
  '@typescript-eslint/parameter-properties': withDefaultOption('error'),

  // This rule must be enabled when the --verbatimModuleSyntax compiler option is enabled
  '@typescript-eslint/no-import-type-side-effects': 'off',

  '@typescript-eslint/no-mixed-enums': 'error',

  '@typescript-eslint/no-duplicate-type-constituents':
    withDefaultOption('error'),
  '@typescript-eslint/no-unsafe-enum-comparison': 'error',

  '@typescript-eslint/class-methods-use-this': [
    'error',
    {
      enforceForClassFields: true,
      exceptMethods: [],
      ignoreOverrideMethods: true, // default: false
      ignoreClassesThatImplementAnInterface: false,
    },
  ],
  '@typescript-eslint/max-params': 'off',
  '@typescript-eslint/prefer-destructuring': 'off',

  '@typescript-eslint/no-unsafe-unary-minus': 'error',

  '@typescript-eslint/consistent-return': 'off',
  '@typescript-eslint/no-array-delete': 'error',
  '@typescript-eslint/prefer-find': 'error',

  // This is not necessary if you change the type definition in strict-ts-lib.
  '@typescript-eslint/prefer-promise-reject-errors': [
    'error',
    { allowEmptyReject: false },
  ],

  // This is not necessary if you change the type definition in strict-ts-lib.
  '@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',

  '@typescript-eslint/only-throw-error': [
    'error',
    {
      allow: [],
      allowRethrowing: true,
      allowThrowingAny: false,
      allowThrowingUnknown: false,
    },
  ],

  '@typescript-eslint/no-empty-object-type': withDefaultOption('error'),
  '@typescript-eslint/no-unnecessary-parameter-property-assignment': 'error',
  '@typescript-eslint/no-unnecessary-template-expression': 'error',

  // Off temporarily due to bug causing infinite loop with recursive types
  '@typescript-eslint/no-unnecessary-type-parameters': 'off',

  '@typescript-eslint/no-unsafe-function-type': 'error',
  '@typescript-eslint/no-wrapper-object-types': 'error',
  '@typescript-eslint/no-deprecated': withDefaultOption('error'),

  // Off as total-functions/no-unsafe-type-assertion provides stricter checking
  '@typescript-eslint/no-unsafe-type-assertion': 'off',

  '@typescript-eslint/related-getter-setter-pairs': 'error',

  '@typescript-eslint/no-misused-spread': withDefaultOption('error'),

  '@typescript-eslint/no-unnecessary-type-conversion': 'error',

  '@typescript-eslint/no-unused-private-class-members': 'error',
  '@typescript-eslint/no-useless-default-assignment': 'error',
  '@typescript-eslint/strict-void-return': ['error', { allowReturnAny: false }],

  // For browser environment only

  // For Node.js environment only
  '@typescript-eslint/no-require-imports': withDefaultOption('error'),
  '@typescript-eslint/no-var-requires': 0,

  // deprecated
  '@typescript-eslint/no-type-alias': 0,
  '@typescript-eslint/prefer-ts-expect-error': 0,
  '@typescript-eslint/sort-type-constituents': 0,
  '@typescript-eslint/no-empty-interface': 0,
  '@typescript-eslint/no-loss-of-precision': 0,
  '@typescript-eslint/typedef': 0,
} as const satisfies TypeScriptEslintRules;
