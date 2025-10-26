import { withDefaultOption, type EslintPromiseRules } from '../types/index.mjs';

export const eslintPromiseRules = {
  'promise/catch-or-return': ['error', { allowFinally: true }],
  'promise/no-return-wrap': withDefaultOption('error'),
  'promise/param-names': withDefaultOption('error'),
  'promise/always-return': 'off',
  'promise/no-native': 'off',
  'promise/no-nesting': 'error',
  'promise/no-promise-in-callback': 'error',

  // When using promise.then(...).catch(...),
  // this rule points out that errors thrown in callbacks within then() will be caught by the catch().
  // However, this doesn't seem like a valid reason to prohibit writing callbacks inside then(), so we disable it.
  'promise/no-callback-in-promise': 'off',

  'promise/avoid-new': 'off',
  'promise/no-new-statics': 'error',
  'promise/no-return-in-finally': 'error',
  'promise/valid-params': withDefaultOption('error'),
  'promise/prefer-await-to-then': 'off',
  'promise/prefer-await-to-callbacks': 'off',
  'promise/no-multiple-resolved': 'error',
  'promise/spec-only': withDefaultOption('error'),
  'promise/prefer-catch': 'error',
} as const satisfies EslintPromiseRules;
