import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForPlaywright,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
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

  eslintConfigForVitest(['src/**', 'test/**']),
  eslintConfigForPlaywright(['e2e/**']),

  {
    // Every read from Firestore and every write to it goes through
    // `src/api/`, which prunes each document written to its codec. Outside
    // it, Firestore gives only what builds a reference or sets it up: a new
    // name is allowed here only if it neither reads nor writes.
    files: ['src/**'],
    ignores: ['src/api/**'],
    rules: defineKnownRules({
      'no-restricted-imports': [
        'error',
        {
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
        },
      ],
    }),
  },

  eslintConfigForNodeJs(['scripts/**', 'configs/**']),

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];
