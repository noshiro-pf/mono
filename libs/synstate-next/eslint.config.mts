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
    files: ['test/**'],
    rules: defineKnownRules({
      // A test reads a node's state that the public types leave out.
      'import-x/no-internal-modules': [
        'error',
        {
          allow: [
            ...eslintImportsRules['import-x/no-internal-modules'][1].allow,
            'synstate-next/internal',
          ],
        },
      ],
    }),
  },

  {
    files: ['src/**'],
    rules: defineKnownRules({
      // The observables are classes: a node per derived value has to be
      // cheap, so the methods live on a prototype and each operator is a
      // subclass that overrides `recompute`. See DESIGN.md.
      'functional/no-class-inheritance': 'off',
      // The graph's nodes are mutable by nature: a parent records its
      // children, a child is queued and recomputed in place.
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
            {
              from: 'file',
              name: [
                'DerivedClass',
                'DerivedNode',
                'EffectClass',
                'EffectNode',
                'ObservableClass',
                'OwnedNode',
                'Owner',
                'QueuedNode',
              ],
            },
            // What `fromAbortablePromise` hands its factory: the factory
            // listens on it, which a readonly type would not let it do.
            { from: 'lib', name: ['AbortSignal'] },
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
