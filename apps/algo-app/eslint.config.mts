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
      // Each component file exports the component together with the styled
      // parts that belong to it, as the rest of the restored apps do.
      'react-refresh/only-export-components': 'off',
    }),
  },

  {
    files: ['src/components/balloon/balloon-base.tsx'],
    rules: defineKnownRules({
      // These take a goober `StyledDiv` and pass it straight to `styled(…)`.
      // `Readonly<StyledDiv>` is not something goober accepts, and there is
      // nothing to make readonly on a component type anyway.
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    }),
  },
] satisfies readonly FlatConfig[];
