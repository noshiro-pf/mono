import {
  defineKnownRules,
  eslintConfigForTypeScriptWithoutRules,
  eslintStylisticRules,
} from '../../src/index.mjs';

import type { FlatConfig } from '../../src/types/flat-config.mjs';

export default [
  {
    ignores: ['scripts/**'],
  },
  ...eslintConfigForTypeScriptWithoutRules({
    tsconfigFileName: 'tsconfig.gen.json',
    tsconfigRootDir: import.meta.dirname,
  }),
  {
    files: ['src/types/rules/!(index).mts'],
    rules: {
      ...defineKnownRules({
        '@typescript-eslint/no-duplicate-type-constituents': [
          'error',
          { ignoreIntersections: false, ignoreUnions: false },
        ],
        '@typescript-eslint/consistent-indexed-object-style': [
          'error',
          'record',
        ],

        '@stylistic/padding-line-between-statements':
          eslintStylisticRules['@stylistic/padding-line-between-statements'],
      }),
    },
  },
] as const satisfies readonly FlatConfig[];
