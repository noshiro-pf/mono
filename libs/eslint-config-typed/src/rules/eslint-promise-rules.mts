import { withDefaultOption, type EslintPromiseRules } from '../types/index.mjs';

export const eslintPromiseRules = {
  'promise/catch-or-return': ['error', { allowFinally: true }],
  // Covered by unicorn/no-useless-promise-resolve-reject (checks async functions
  // too)
  'promise/no-return-wrap': 'off',
  'promise/param-names': withDefaultOption('error'),
  'promise/always-return': 'off',
  'promise/no-native': 'off',
  'promise/no-nesting': 'error',
  'promise/no-promise-in-callback': withDefaultOption('error'),

  // When using promise.then(...).catch(...), this rule points out that errors
  // thrown in callbacks within then() will be caught by the catch().
  // However, this doesn't seem like a valid reason to prohibit writing callbacks inside then(), so we disable it.
  'promise/no-callback-in-promise': 'off',

  'promise/avoid-new': 'off',
  'promise/no-new-statics': 'error',
  'promise/no-return-in-finally': 'error',
  'promise/valid-params': withDefaultOption('error'),
  'promise/prefer-await-to-then': 'off',
  'promise/prefer-await-to-callbacks': 'off',
  // Covered by unicorn/no-multiple-promise-resolver-calls (checks more patterns)
  'promise/no-multiple-resolved': 'off',
  'promise/spec-only': withDefaultOption('error'),

  // Off for `ts-restrictions/prefer-catch`, the same rule with its fix only
  // suggested: `--fix` rewrites `p.then(a, b)` into `p.catch(b).then(a)`, which
  // calls `a` with what `b` returns after a rejection too.
  'promise/prefer-catch': 'off',
} as const satisfies EslintPromiseRules;
