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
] satisfies readonly FlatConfig[];
