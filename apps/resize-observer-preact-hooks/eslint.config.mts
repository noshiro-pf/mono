import {
  eslintConfigForReact,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';
import { eslintConfigOffForOxlint } from '../../tools/configs/oxlint-rules.mjs';

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

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];
