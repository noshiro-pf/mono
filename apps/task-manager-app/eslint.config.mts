import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForPlaywright,
  eslintConfigForPreact,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  mergeRestrictedImportsOptions,
  restrictedImportsOptionsForPreact,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';
import { eslintConfigOffForOxlint } from '../../tools/configs/oxlint-rules.mjs';

const thisDir = import.meta.dirname;

const firestoreMessage =
  'Read and write Firestore through src/api/, which prunes every document written to its codec.';

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
  eslintConfigForVitest(['src/**', 'test/**']),
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
    // name is allowed here only if it neither reads nor writes.
    //
    // A rule's options are replaced, not merged, by a later config, so the
    // ones `eslintConfigForPreact` set are merged in again.
    files: ['src/**'],
    ignores: ['src/api/**'],
    rules: defineKnownRules({
      'no-restricted-imports': [
        'error',
        mergeRestrictedImportsOptions(restrictedImportsOptionsForPreact, {
          paths: [
            {
              name: 'firebase/firestore',
              allowImportNames: [
                'clearIndexedDbPersistence',
                'collection',
                'connectFirestoreEmulator',
                'doc',
                'initializeFirestore',
                'memoryLocalCache',
                'persistentLocalCache',
                'persistentMultipleTabManager',
                'terminate',
                'waitForPendingWrites',
              ],
              allowTypeImports: true,
              message: firestoreMessage,
            },
          ],
          patterns: [
            {
              group: [
                'firebase/firestore/*',
                '@firebase/firestore',
                '@firebase/firestore/*',
              ],
              message: firestoreMessage,
            },
          ],
        }),
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

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];
