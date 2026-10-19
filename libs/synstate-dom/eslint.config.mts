import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  eslintImportsRules,
  typescriptEslintRules,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';
import { eslintConfigOffForOxlint } from '../../tools/configs/oxlint-rules.mjs';

export default [
  ...eslintConfigForTypeScript({
    tsconfigRootDir: import.meta.dirname,
    tsconfigFileName: 'tsconfig.json',
    packageDirs: [import.meta.dirname],
  }),

  eslintPluginTsTypeForge.configs.recommended,
  eslintPluginTsDataForge.configs.recommended,
  eslintPluginTsFortress.configs.recommended,

  eslintConfigForVitest(),

  {
    rules: defineKnownRules({
      // The `JSX` namespace has to declare an `Element` type of its own.
      '@typescript-eslint/no-shadow': [
        'error',
        {
          ...typescriptEslintRules['@typescript-eslint/no-shadow'][1],
          allow: ['Element'],
        },
      ],
      // The DOM nodes a mount creates and moves are mutable by nature, as the
      // elements the shared configuration already allows are.
      '@typescript-eslint/prefer-readonly-parameter-types': [
        'error',
        {
          ...typescriptEslintRules[
            '@typescript-eslint/prefer-readonly-parameter-types'
          ][1],
          allow: [
            ...typescriptEslintRules[
              '@typescript-eslint/prefer-readonly-parameter-types'
            ][1].allow,
            { from: 'lib', name: ['ChildNode', 'Comment', 'Node', 'Text'] },
          ],
        },
      ],
    }),
  },

  {
    files: ['test/**'],
    rules: defineKnownRules({
      // `samples.test.tsx` runs the README samples, which are modules of
      // their own rather than part of the package.
      'import-x/no-internal-modules': [
        'error',
        {
          allow: [
            ...eslintImportsRules['import-x/no-internal-modules'][1].allow,
            '**/samples/readme/*',
          ],
        },
      ],
    }),
  },

  eslintConfigForNodeJs(['scripts/**', 'configs/**']),
  {
    files: ['scripts/**', 'configs/**'],
    rules: defineKnownRules({
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-await-in-loop': 'off',
      'import-x/no-unassigned-import': 'off',
      'import-x/no-internal-modules': 'off',
      'import-x/no-default-export': 'off',
    }),
  },

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];
