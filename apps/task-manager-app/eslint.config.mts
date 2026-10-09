import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForPlaywright,
  eslintConfigForPreact,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
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

  ...eslintConfigForPreact(),
  eslintConfigForVitest(),
  eslintConfigForPlaywright(['e2e/**']),

  {
    // date-fns 2 publishes its locales from the `date-fns/locale` subpath
    // only. The rest is the shared allow list as far as this file needs it.
    files: ['src/date-picker/date-time-picker.tsx'],
    rules: defineKnownRules({
      'import-x/no-internal-modules': [
        'error',
        {
          allow: [
            'date-fns/locale',
            '@blueprintjs/*',
            'preact/**',
            '*/index.mjs',
          ],
        },
      ],
    }),
  },

  eslintConfigForNodeJs(['scripts/**', 'configs/**']),
  {
    files: ['scripts/**', 'configs/**'],
    rules: defineKnownRules({
      '@typescript-eslint/explicit-function-return-type': 'off',
      'import-x/no-default-export': 'off',
    }),
  },
] satisfies readonly FlatConfig[];
