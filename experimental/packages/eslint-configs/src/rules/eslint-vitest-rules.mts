import { type EslintVitestRules } from '../types/index.mjs';
import { withDefaultOption } from '../types/rule-severity-branded.mjs';

export const eslintVitestRules: EslintVitestRules = {
  /* jest, playwright と共通のルール（設定値をなるべく合わせる） */
  'vitest/expect-expect': withDefaultOption('error'),
  'vitest/max-expects': 'off',
  'vitest/max-nested-describe': withDefaultOption('error'),
  'vitest/no-commented-out-tests': 'off',
  'vitest/no-conditional-expect': 'error',
  'vitest/no-conditional-in-test': 'off',
  'vitest/no-duplicate-hooks': 'error',
  'vitest/no-hooks': withDefaultOption('error'),
  'vitest/no-restricted-matchers': [
    'error',
    {
      toBeTruthy: 'Use `.toBe(true)` instead.',
      toBeFalsy: 'Use `.toBe(false)` instead.',
    },
  ],
  'vitest/no-standalone-expect': withDefaultOption('error'),
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
  'vitest/valid-expect': withDefaultOption('error'),
  'vitest/valid-title': 'off',

  /* jest と共通のルール（設定値をなるべく合わせる） */

  'vitest/consistent-test-it': ['error', { fn: 'test' }],
  'vitest/no-alias-methods': 'error',
  'vitest/no-disabled-tests': 'error',
  'vitest/no-focused-tests': withDefaultOption('error'),
  'vitest/no-identical-title': 'error',
  'vitest/no-interpolation-in-snapshots': 'error',
  'vitest/no-large-snapshots': withDefaultOption('error'),
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
  'vitest/prefer-snapshot-hint': withDefaultOption('error'),
  'vitest/prefer-spy-on': 'error',
  'vitest/prefer-todo': 'error',

  /* eslint-plugin-vitest 独自ルール */

  // inline test を書けなくなるのでオフ
  'vitest/no-conditional-tests': 'off',

  'vitest/consistent-test-filename': withDefaultOption('error'),
  'vitest/no-import-node-test': 'error',

  // toBeFalsy() は toBe(false) より緩いのでこれらのルールは却下
  'vitest/prefer-to-be-falsy': 'off',
  'vitest/prefer-to-be-truthy': 'off',

  'vitest/prefer-to-be-object': 'error',
  'vitest/require-local-test-context-for-concurrent-snapshots': 'error',

  // deprecated
  'vitest/no-done-callback': 0,
} as const;
