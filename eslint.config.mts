import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';
import nodeSupport from './tools/configs/node-support.json' with { type: 'json' };
import { projectRootPath } from './tools/scripts/project-root-path.mjs';

// The repository's own tooling runs on `volta.node`, which is
// `targets.current` (`check:root:node-support`), not on the `engines.node`
// floor the published packages promise.
const toolingNodeMajor = Number(nodeSupport.targets.current.split('.')[0]);

export default [
  {
    // Legacy monorepo contents. Excluded from the pnpm workspace, so its
    // dependencies are never installed and type-aware linting cannot resolve
    // them. Revived package by package into libs/ / apps/ over time.
    ignores: ['experimental/**', 'articles/**', 'books/**', 'docs/**'],
  },

  ...eslintConfigForTypeScript({
    tsconfigRootDir: projectRootPath,
    tsconfigFileName: 'tsconfig.json',
    packageDirs: [projectRootPath],
  }),

  eslintPluginTsTypeForge.configs.recommended,
  eslintPluginTsDataForge.configs.recommended,
  eslintPluginTsFortress.configs.recommended,

  eslintConfigForNodeJs(['tools/**'], { nodeMajor: toolingNodeMajor }),
  {
    files: ['tools/**'],
    rules: defineKnownRules({
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-await-in-loop': 'off',
      'import-x/no-unassigned-import': 'off',
      'import-x/no-internal-modules': 'off',
      'import-x/no-default-export': 'off',
    }),
  },
  {
    // The diff gate and the install step run before anything is installed, so
    // this file imports `node:*` alone (its test holds it). Every rule of this
    // plugin is about ts-data-forge's API, and its fixes write an import of a
    // package that is not there yet, so all of them are off here, the ones it
    // adds later included.
    files: ['tools/scripts/cmd/workflow-steps.mts'],
    rules: Object.fromEntries(
      Object.keys(eslintPluginTsDataForge.configs.recommended.rules).map(
        (rule) => [rule, 'off'] as const,
      ),
    ),
  },
] satisfies readonly FlatConfig[];
