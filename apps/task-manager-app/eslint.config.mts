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

  {
    // Every read from Firestore and every write to it goes through
    // `src/api/`, which prunes each document written to its codec. Outside
    // it, Firestore gives only what builds a reference or sets it up: a new
    // name is allowed here only if it neither reads nor writes. The
    // TypeScript rule is used so as not to replace the options of the base
    // `no-restricted-imports`.
    files: ['src/**'],
    ignores: ['src/api/**'],
    rules: defineKnownRules({
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'firebase/firestore',
              allowImportNames: [
                'collection',
                'doc',
                'initializeFirestore',
                'persistentLocalCache',
                'persistentMultipleTabManager',
              ],
              allowTypeImports: true,
              message:
                'Read and write Firestore through src/api/, which prunes every document written to its codec.',
            },
          ],
          patterns: [
            {
              group: [
                'firebase/firestore/*',
                '@firebase/firestore',
                '@firebase/firestore/*',
              ],
              message:
                'Read and write Firestore through src/api/, which prunes every document written to its codec.',
            },
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
