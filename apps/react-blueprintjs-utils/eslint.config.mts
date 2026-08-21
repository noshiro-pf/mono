import {
  defineKnownRules,
  eslintConfigForReact,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
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

  ...eslintConfigForReact(),

  {
    files: ['src/**'],
    rules: defineKnownRules({
      // This package is a component library, not an application: every file
      // here exports the component *and* the props type or the styled parts
      // that go with it. Fast Refresh's constraint is about an application's
      // own modules, and splitting each of these in two to satisfy it would
      // make the package harder to read for no gain.
      'react-refresh/only-export-components': 'off',
    }),
  },

  {
    files: ['src/components/wrapper/**'],
    rules: defineKnownRules({
      // These wrappers pull one or two props out and spread the rest through
      // to the Blueprint component. The rule wants every remaining prop
      // named — several hundred of them, for `InputGroup` — which is the
      // opposite of what a pass-through wrapper is for.
      'ts-restrictions/check-destructuring-completeness': 'off',
    }),
  },
] satisfies readonly FlatConfig[];
