import { type EslintPromiseRules } from '../types/index.mjs';
import { withDefaultOption } from '../types/rule-severity-branded.mjs';

export const eslintPromiseRules: EslintPromiseRules = {
  'promise/catch-or-return': ['error', { allowFinally: true }],
  'promise/no-return-wrap': withDefaultOption('error'),
  'promise/param-names': withDefaultOption('error'),
  'promise/always-return': 'off',
  'promise/no-native': 'off',
  'promise/no-nesting': 'error',
  'promise/no-promise-in-callback': 'error',

  // promise.then(...).catch(...) と書かれているときに、
  // then の中で呼び出した callback でエラーを throw していた場合に catch でそれも拾ってしまうという問題を指摘しているが、
  // then の中に callback を書かないべきであるとする根拠としては妥当でないと思われるため使用しない。
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
} as const;
