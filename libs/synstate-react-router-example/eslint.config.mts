import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForReact,
  eslintConfigForTsDataForge,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  typescriptEslintRules,
  withDefaultOption,
  type FlatConfig,
} from 'eslint-config-typed';
import { projectRootPath } from '../../scripts/project-root-path.mjs';

export default [
  ...eslintConfigForTypeScript({
    tsconfigRootDir: import.meta.dirname,
    tsconfigFileName: 'tsconfig.json',
    packageDirs: [import.meta.dirname, projectRootPath],
  }),

  eslintConfigForTsDataForge(),

  ...eslintConfigForReact(),
  {
    files: ['src/**'],
    rules: defineKnownRules({
      // React の import 方法やコンポーネントスタイルに関するルール群
      'react-coding-style/component-name': withDefaultOption('error'),
      'react-coding-style/component-var-type-annotation': 'error',
      'react-coding-style/import-style': [
        'error',
        { importStyle: 'namespace' },
      ],
      'react-coding-style/props-type-annotation-style': 'error',
      'react-coding-style/react-memo-props-argument-name': 'error',
      'react-coding-style/react-memo-type-parameter': 'error',
      'react-coding-style/use-memo-hook-style': 'error',
      'react-coding-style/ban-use-imperative-handle-hook': 'error',
      // useRouteMatch handlers return ReactNode, not components
      'react/no-unstable-nested-components': 'off',
    }),
  },

  eslintConfigForVitest(),

  {
    rules: defineKnownRules({
      '@typescript-eslint/no-shadow': [
        'error',
        {
          ...typescriptEslintRules['@typescript-eslint/no-shadow'][1],
          allow: ['Observable'],
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
      'import-x/no-extraneous-dependencies': 'off',
    }),
  },
] satisfies readonly FlatConfig[];
