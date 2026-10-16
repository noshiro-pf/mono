import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  type FlatConfig,
  restrictedSyntax,
} from 'eslint-config-typed';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';
import { eslintConfigOffForOxlint } from '../../tools/configs/oxlint-rules.mjs';
import { workspaceRootPath } from './scripts/workspace-root-path.mjs';

export default [
  {
    ignores: ['dist/**'],
  },
  ...eslintConfigForTypeScript({
    tsconfigRootDir: workspaceRootPath,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [workspaceRootPath],
  }),

  eslintPluginTsTypeForge.configs.recommended,
  eslintPluginTsFortress.configs.recommended,

  eslintConfigForVitest(),

  {
    rules: defineKnownRules({
      'import-x/no-unused-modules': 'off',
    }),
  },

  {
    files: ['**/*.test.mts'],
    rules: defineKnownRules({
      /* A test file is a leaf: nothing imports it, so an `export` there is
         either dead code or a way to dodge the unused-variable check. The base
         entries are spread back in because a flat-config override replaces the
         whole option array. */
      'no-restricted-syntax': [
        'error',
        ...restrictedSyntax,
        {
          selector:
            'ExportNamedDeclaration, ExportDefaultDeclaration, ExportAllDeclaration',
          message:
            'Test files must not export. Keep helpers local and reference them from a test; move anything genuinely shared into a non-test module.',
        },
      ],
    }),
  },

  eslintConfigForNodeJs(['scripts/**', 'configs/**']),
  {
    files: ['scripts/**', 'configs/**'],
    rules: defineKnownRules({
      '@typescript-eslint/explicit-function-return-type': 'off',
      'import-x/no-internal-modules': 'off',
      'import-x/no-default-export': 'off',
    }),
  },
  {
    files: ['configs/**/*'],
    rules: defineKnownRules({
      'import-x/no-anonymous-default-export': 'off',
    }),
  },

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];
