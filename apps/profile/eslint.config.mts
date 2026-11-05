import {
  defineKnownRules,
  eslintConfigForPlaywright,
  eslintConfigForTypeScript,
  eslintJsxA11yRules,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
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
  eslintPluginTsFortress.configs.recommended,

  // The components are synstate-dom, not React, so `eslintConfigForReact` and
  // its accessibility rules do not apply. Only the rules that check whether an
  // element has an attribute or content are taken: jsx-a11y reads a
  // `constant('#')` value as the string "constant('#')" or as no literal at
  // all, so a rule that reads `href`, `role` or `aria-*` values passes wrong
  // ones and reports correct ones. The rest wait for a synstate-dom
  // configuration in eslint-config-typed (#3408).
  {
    files: ['src/**/*.tsx'],
    rules: defineKnownRules({
      'jsx-a11y/alt-text': eslintJsxA11yRules['jsx-a11y/alt-text'],
      'jsx-a11y/anchor-has-content':
        eslintJsxA11yRules['jsx-a11y/anchor-has-content'],
    }),
  },

  eslintConfigForPlaywright(['e2e/**']),

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];
