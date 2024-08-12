import {
  type EslintFunctionalRules,
  type EslintFunctionalRulesOption,
} from '../types/index.mjs';

export const ignorePattern = [
  '^draft', // allow immer.js draft object
  '^mut_',
  '^_mut_',
  '^#mut_',
];

export const immutableDataOptions: EslintFunctionalRulesOption['functional/immutable-data'] =
  {
    ignoreClasses: true,
    ignoreImmediateMutation: true,
    ignoreIdentifierPattern: [...ignorePattern, 'window.location.href'],
    ignoreNonConstDeclarations: false,
    ignoreAccessorPattern: [
      '**.current.**', // allow React Ref object
      '**.displayName', // allow React component displayName
      '**.scrollTop', // allow modifying scrollTop
    ],
  };

export const noLetOptions: EslintFunctionalRulesOption['functional/no-let'] = {
  allowInForLoopInit: false,
  allowInFunctions: false,
  ignoreIdentifierPattern: ignorePattern.filter((p) => p !== '^draft'),
};

// const noExpressionStatementOptions:NoExpressionStatementOptions = {
//   ignoreVoid: true,
//   ignorePattern: [
//     '^this\\..*',
//     'yield',
//     'dispatch',
//     '^set.*',
//     '.*subscribe.*',
//     ...ignorePattern,
//   ],
// };

/** @link {https://github.com/jonaskello/eslint-plugin-functional} */
export const eslintFunctionalRules: EslintFunctionalRules = {
  // No Mutations Rules
  'functional/immutable-data': ['error', immutableDataOptions],
  'functional/no-let': ['error', noLetOptions],
  'functional/prefer-property-signatures': 'error',
  // 'functional/prefer-readonly-type': ['warn', preferReadonlyTypeOptions],

  // No Object-Orientation Rules
  'functional/no-classes': 'off',
  'functional/no-mixed-types': 'off',
  // 'functional/no-mixed-types': [
  //   'error',
  //   {
  //     checkInterfaces: true,
  //     checkTypeLiterals: true,
  //   },
  // ],
  'functional/no-this-expressions': 'off',

  // No Statements Rules
  'functional/no-conditional-statements': 'off',
  // 'functional/no-expression-statement': ['warn', noExpressionStatementOptions],
  'functional/no-expression-statements': 'off',
  'functional/no-loop-statements': 'off',
  'functional/no-return-void': 'off',

  // No Exceptions Rules
  'functional/no-promise-reject': 'off',
  'functional/no-throw-statements': 'off',
  'functional/no-try-statements': 'off',

  // Currying Rules
  'functional/functional-parameters': 'off',

  // Stylistic Rules
  'functional/prefer-tacit': 'off', // false positives

  'functional/readonly-type': ['error', 'generic'],

  // TODO
  'functional/prefer-immutable-types': 'off',
  // 'functional/prefer-immutable-types': [
  //   'warn',
  //   {
  //     enforcement: 'Immutable',
  //     ignoreNamePattern: ignorePattern,
  //     ignoreClasses: false,
  //     ignoreInferredTypes: false,
  //     fixer: {
  //       ReadonlyShallow: [
  //         {
  //           pattern:
  //             '^([_$a-zA-Z\\xA0-\\uFFFF][_$a-zA-Z0-9\\xA0-\\uFFFF]*\\[\\])$',
  //           replace: 'readonly $1',
  //         },
  //         {
  //           pattern: '^(Array|Map|Set)<(.+)>$',
  //           replace: 'Readonly$1<$2>',
  //         },
  //         {
  //           pattern: '^(.+)$',
  //           replace: 'Readonly<$1>',
  //         },
  //       ],
  //       ReadonlyDeep: false,
  //       Immutable: false,
  //     },
  //   },
  // ],
  'functional/type-declaration-immutability': 'off',
  // 'functional/type-declaration-immutability': [
  //   'error',
  //   {
  //     ignorePattern,
  //     rules: [
  //       {
  //         identifiers: '^.+',
  //         immutability: 'Immutable',
  //         comparator: 'AtLeast',
  //         fixer: false,
  //       },
  //       {
  //         identifiers: 'I?Mutable.+',
  //         immutability: 'Mutable',
  //         comparator: 'AtLeast',
  //         fixer: false,
  //       },
  //     ],
  //     ignoreInterfaces: false,
  //   },
  // ],

  // deprecated
  'functional/prefer-readonly-type': 0,
};
