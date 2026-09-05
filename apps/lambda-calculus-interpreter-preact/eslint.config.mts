import {
  defineKnownRules,
  eslintConfigForReact,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';

const thisDir = import.meta.dirname;

export default [
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),

  eslintPluginTsDataForge.configs.recommended,

  ...eslintConfigForReact(),

  {
    files: ['src/**'],
    rules: defineKnownRules({
      // Each component file exports the component together with the styled
      // parts that belong to it, as the rest of the restored apps do.
      'react-refresh/only-export-components': 'off',
    }),
  },
] satisfies readonly FlatConfig[];
