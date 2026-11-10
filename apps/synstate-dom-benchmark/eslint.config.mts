import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForSynstateDom,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  eslintImportsRules,
  typescriptEslintRules,
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

  // Accessibility, reading synstate-dom's `constant(x)` as `x`, for the
  // synstate-dom implementations; the other frameworks' are measured as their
  // own documentation writes them.
  eslintConfigForSynstateDom([
    'src/**/synstate-dom.tsx',
    'src/**/synstate-dom-derive.tsx',
  ]),

  {
    files: ['src/**'],
    rules: defineKnownRules({
      // A signal is mutable by design, and the Preact components take theirs
      // as props; so is a VanJS state, which the scenarios pass to helpers.
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
              from: 'package',
              package: '@preact/signals-core',
              name: ['ReadonlySignal', 'Signal'],
            },
            { from: 'package', package: 'vanjs-core', name: 'State' },
          ],
        },
      ],
      // `commands`, with which the run writes RESULTS.md, is exported from
      // Vitest's browser entry point.
      'import-x/no-internal-modules': [
        'error',
        {
          allow: [
            ...eslintImportsRules['import-x/no-internal-modules'][1].allow,
            'vitest/browser',
          ],
        },
      ],
    }),
  },

  eslintConfigForVitest(['src/run.bench-browser.mts']),

  eslintConfigForNodeJs(['scripts/**', 'configs/**']),

  {
    files: ['scripts/**'],
    rules: defineKnownRules({
      'import-x/no-internal-modules': [
        'error',
        {
          allow: [
            ...eslintImportsRules['import-x/no-internal-modules'][1].allow,
            // The bundle-size measurement shared with synstate-docs (#3066).
            '**/tools/scripts/lib/bundle-size.mjs',
            // How the repository runs a process (`runInherited`).
            '**/tools/scripts/lib/child-process.mjs',
          ],
        },
      ],
    }),
  },

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];
