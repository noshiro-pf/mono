import {
  type RestrictedImportsOption,
  type TypeScriptEslintRules,
  type TypeScriptEslintRulesOption,
} from '../types/index.mjs';

export const banTypes: TypeScriptEslintRulesOption['@typescript-eslint/no-restricted-types']['types'] =
  {
    Date: {
      message: 'Use `DateType` from @noshiro/ts-utils instead.',
    },
    Set: {
      message: 'Use `ISet` or `MutableSet` from @noshiro/ts-utils instead.',
    },
    Map: {
      message: 'Use `IMap` or `MutableMap` from @noshiro/ts-utils instead.',
    },
    JSON: {
      message: 'Use `Json` from @noshiro/ts-utils instead.',
    },
    object: {
      message: 'Use `Record<string, unknown>` instead.',
      fixWith: 'Record<string, unknown>',
    },
  } as const;

// Note: 同名の name の path を複数回定義すると後から定義したもので上書きされている可能性あり
export const restrictedImportsOption: RestrictedImportsOption = {
  paths: [
    {
      name: 'react',
      importNames: ['memo', 'useState'],
      message: 'use memoNamed, useState from @noshiro/react-utils instead.',
    },
    {
      name: 'preact/hooks',
      importNames: ['useState'],
      message: 'use useState from @noshiro/preact-utils instead.',
    },
    {
      name: 'preact/compat',
      importNames: [
        'memo',
        'useState',
        'useReducer',
        'useMemo',
        'useCallback',
        'useRef',
        'useContext',
        'useEffect',
        'useLayoutEffect',
        'useErrorBoundary',
      ],
      message:
        'import hooks from preact/hooks or use memoNamed from @noshiro/preact-utils instead.',
    },
  ],
};

export const typescriptEslintRules: TypeScriptEslintRules = {
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
  '@typescript-eslint/consistent-type-definitions': ['error', 'type'], // modified
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
    'error',
    { fixMixedExportsWithInlineTypeSpecifier: true },
  ],
  '@typescript-eslint/default-param-last': 'error',

  /** Prefer noPropertyAccessFromIndexSignature */
  '@typescript-eslint/dot-notation': 'off',
  // '@typescript-eslint/dot-notation': [
  //   'error',
  //   { allowIndexSignaturePropertyAccess: true },
  // ], // modified

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
  ], // modified
  '@typescript-eslint/explicit-member-accessibility': [
    'error',
    { accessibility: 'no-public' },
  ], // modified
  '@typescript-eslint/explicit-module-boundary-types': 'off', // preferred to use explicit-function-return-type
  '@typescript-eslint/init-declarations': 'error',
  '@typescript-eslint/member-ordering': 'off', // disabled

  /**
   * 関数メンバーをメソッド記法で書くと双変になり安全性が低くなるため
   * https://github.com/Microsoft/TypeScript/wiki/FAQ#why-are-function-parameters-bivariant
   */
  '@typescript-eslint/method-signature-style': 'error',
  '@typescript-eslint/prefer-function-type': 'error',

  '@typescript-eslint/naming-convention': 'off', // disabled
  '@typescript-eslint/no-array-constructor': 'error',
  '@typescript-eslint/no-base-to-string': 'error',
  '@typescript-eslint/no-confusing-non-null-assertion': 'error',
  '@typescript-eslint/no-confusing-void-expression': 'error',
  '@typescript-eslint/no-dupe-class-members': 'error',
  '@typescript-eslint/no-dynamic-delete': 'error',
  '@typescript-eslint/no-empty-function': 'off', // disabled
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-extra-non-null-assertion': 'error',
  '@typescript-eslint/no-extraneous-class': 'error',
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-for-in-array': 'error',
  '@typescript-eslint/no-implied-eval': 'error',

  /** 型を明示的に書きたい場合もあるためオフに */
  '@typescript-eslint/no-inferrable-types': 'off', // disabled

  '@typescript-eslint/no-invalid-this': 'error',
  '@typescript-eslint/no-invalid-void-type': 'error',
  '@typescript-eslint/no-loop-func': 'error',
  '@typescript-eslint/no-magic-numbers': 'off', // disabled
  '@typescript-eslint/no-meaningless-void-operator': 'error',
  '@typescript-eslint/no-misused-new': 'error',
  '@typescript-eslint/no-misused-promises': [
    'error',
    {
      checksConditionals: false, // strict-boolean-expression で十分
    },
  ],
  '@typescript-eslint/no-namespace': 'off', // disabled
  '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
  '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
  '@typescript-eslint/no-non-null-assertion': 'error',
  '@typescript-eslint/no-redeclare': 'off', // disabled
  '@typescript-eslint/no-redundant-type-constituents': 'error', // modified
  '@typescript-eslint/no-require-imports': 'error',
  '@typescript-eslint/no-restricted-imports': [
    // modified
    'error',
    restrictedImportsOption,
  ],
  '@typescript-eslint/no-shadow': [
    'error',
    {
      builtinGlobals: true,
      hoist: 'all',
      ignoreTypeValueShadow: false,
      ignoreFunctionTypeParameterNameValueShadow: false,
    },
  ], // modified
  '@typescript-eslint/no-this-alias': 'error',
  '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
  '@typescript-eslint/no-unnecessary-condition': [
    'error',
    { allowConstantLoopConditions: true },
  ], // modified
  '@typescript-eslint/no-unnecessary-qualifier': 'error',
  '@typescript-eslint/no-unnecessary-type-arguments': 'off', // disabled
  '@typescript-eslint/no-unnecessary-type-assertion': 'error',
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
  ], // modified
  '@typescript-eslint/no-use-before-define': 'off', // disabled
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
      allow: [
        {
          from: 'lib',
          name: [
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
        {
          from: 'package',
          package: 'discord.js',
          name: [
            'MessageReaction',
            'PartialUser',
            'User',
            'Message',
            'Collection',
            'GuildTextBasedChannel',
            'TextBasedChannel',
            'Guild',
            'AnonymousGuild',
            'BaseGuild',
            'GuildBasedChannel',
            'CategoryChannel',
            'DMChannel',
            'PartialDMChannel',
            'PartialGroupDMChannel',
            'NewsChannel',
            'StageChannel',
            'TextChannel',
            'AnyThreadChannel',
            'VoiceChannel',
            'ForumChannel',
            'MediaChannel',
            'Client',
          ],
        },
        'CallableContext', // firebase-functions/v1/https
        'OverlayToaster', // @blueprintjs/core
      ],
    },
  ], // modified
  '@typescript-eslint/prefer-reduce-type-parameter': 'error',
  '@typescript-eslint/prefer-regexp-exec': 'error',
  '@typescript-eslint/prefer-return-this-type': 'error',
  '@typescript-eslint/prefer-string-starts-ends-with': 'error',
  '@typescript-eslint/promise-function-async': 'off', // disabled

  /** `sort` はデフォルトで文字列としての比較を行うため、数値のソートを行おうとしたときに比較関数を忘れることを防ぐため使用。 */
  '@typescript-eslint/require-array-sort-compare': [
    'error',
    {
      ignoreStringArrays: true,
    },
  ],
  '@typescript-eslint/require-await': 'error',

  /**
   * `+` の曖昧性回避のため使用。 restrict-plus-operands で bigint, number, string
   * 同士にしか使用できないように制限し、 prefer-template で文字列の連結に `+` を使うことも禁止する。 修正方法： template
   * literal を使うか、文字列の配列を `join("")` で結合する。
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
  ], // modified
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
  ], // modified
  '@typescript-eslint/return-await': 'error',

  /**
   * Boolean への暗黙のキャストを回避するために使用。 数値 `0`, `NaN` や 文字列 `""` が条件部に来たときに false
   * として扱われるのを 見落とさないようにするため。
   */
  '@typescript-eslint/strict-boolean-expressions': [
    'error',
    { allowString: false, allowNumber: false, allowNullableObject: false },
  ], // modified

  /** Switch の case 漏れを防ぐ（型情報を使用） */
  '@typescript-eslint/switch-exhaustiveness-check': [
    'error',
    {
      allowDefaultCaseForExhaustiveSwitch: true,
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
  // It is not necessary now as we will change the type definition of strict-ts-lib if necessary.
  // [ 'error', { allowEmptyReject: false }, ],

  '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off', // unnecessary in TypeScript with strict-ts-lib
  '@typescript-eslint/only-throw-error': [
    'error',
    {
      allowThrowingAny: false,
      allowThrowingUnknown: false,
    },
  ],

  '@typescript-eslint/no-empty-object-type': 'error',
  '@typescript-eslint/no-unnecessary-parameter-property-assignment': 'error',
  '@typescript-eslint/no-unnecessary-template-expression': 'error',

  // 再帰型で無限ループが発生して落ちるバグがあるため一旦オフ
  '@typescript-eslint/no-unnecessary-type-parameters': 'off',

  '@typescript-eslint/no-unsafe-function-type': 'error',
  '@typescript-eslint/no-wrapper-object-types': 'error',

  // deprecated
  '@typescript-eslint/no-type-alias': 0,
  '@typescript-eslint/prefer-ts-expect-error': 0,
  '@typescript-eslint/sort-type-constituents': 0,
  '@typescript-eslint/no-var-requires': 0,
  '@typescript-eslint/no-empty-interface': 0,
  '@typescript-eslint/no-loss-of-precision': 0,
};
