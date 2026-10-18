// The lint pass after the codemod. See `generateRulesType` in `main.mts` for
// why it is a pass of its own.
//
// Node loads this file itself when oxlint reads it, so the two packages below
// resolve to their `dist/`.
import { eslintStylisticRules } from 'eslint-config-typed';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';
import { defineConfig } from 'oxlint';
import { castDeepMutable } from 'ts-data-forge';

export default defineConfig({
  plugins: ['typescript'],
  jsPlugins: ['./oxlint-plugin-ts-type-forge.mts', '@stylistic/eslint-plugin'],
  // `no-duplicate-type-constituents` needs type information, which oxlint
  // gets from `oxlint-tsgolint`.
  options: { typeAware: true },
  // oxlint turns `correctness` on by default; only the rules listed here run.
  categories: { correctness: 'off' },
  rules: {
    ...eslintPluginTsTypeForge.configs.recommended.rules,
    'typescript/no-duplicate-type-constituents': [
      'error',
      { ignoreIntersections: false, ignoreUnions: false },
    ],
    '@stylistic/padding-line-between-statements': castDeepMutable(
      eslintStylisticRules['@stylistic/padding-line-between-statements'],
    ),
  },
});
