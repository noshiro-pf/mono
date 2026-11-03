import {
  defineKnownRules,
  eslintConfigForPlaywright,
  eslintConfigForTypeScript,
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

  {
    files: ['src/canvas/**'],
    rules: defineKnownRules({
      // PixiJS's scene graph is mutated in place: `updatePixiBbox` and the
      // pointer handlers exist to move `Graphics` and `Sprite` instances
      // around. A `Readonly<PixiBbox>` parameter cannot express that, and
      // there is nothing to make readonly on the library's side either — so
      // the rule has no useful reading here. The mutated parameters carry the
      // repository's `mut_` prefix, which is how deliberate mutation is
      // signalled elsewhere.
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    }),
  },

  eslintConfigForPlaywright(['e2e/**']),

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];
