import {
  defineKnownRules,
  eslintConfigForReact,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';

const thisDir = import.meta.dirname;

export default [
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),

  eslintPluginTsTypeForge.configs.recommended,
  eslintPluginTsDataForge.configs.recommended,

  ...eslintConfigForReact(),

  {
    files: ['src/memo-named.mts'],
    rules: defineKnownRules({
      // These rules describe how a component is written. This file defines no
      // component: it is the helper that memoizes one and gives it the
      // `displayName` the rules ask for, so it cannot be shaped like its own
      // output.
      'react-coding-style/component-var-type-annotation': 'off',
      'react-coding-style/display-name': 'off',
      'react-coding-style/react-memo-type-parameter': 'off',
    }),
  },
] satisfies readonly FlatConfig[];
