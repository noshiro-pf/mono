import {
  defineKnownRules,
  eslintConfigForReact,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
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
  eslintPluginTsFortress.configs.recommended,

  ...eslintConfigForReact(),

  {
    files: ['src/**'],
    rules: defineKnownRules({
      // Most component files here export the component *and* the props type or
      // the styled parts that go with it. Splitting each of those in two to
      // satisfy Fast Refresh would make the app harder to read for no gain.
      'react-refresh/only-export-components': 'off',

      // `Temporal` is not available on Node 22, which is the floor this
      // repository declares in `engines`, and this app's calendar arithmetic
      // is the same `Date` arithmetic `apps/ts-fortress-types` turns the rule
      // off for. Revisit when that floor moves.
      'unicorn/prefer-temporal': 'off',
    }),
  },
] satisfies readonly FlatConfig[];
