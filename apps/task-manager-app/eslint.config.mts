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
import { Arr, hasKey, isRecord } from 'ts-data-forge';

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
    // name is allowed here only if it neither reads nor writes.
    //
    // A rule's options are replaced, not merged, by a later config, so the
    // paths `eslintConfigForPreact` restricts are carried over
    // (`inheritedRestrictedPaths`). `@typescript-eslint/no-restricted-imports`
    // would have sidestepped that, but it is deprecated, and
    // `defineKnownRules` accepts it only turned off.
    files: ['src/**'],
    ignores: ['src/api/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            ...inheritedRestrictedPaths(eslintConfigForPreact()),
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
    },
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

/**
 * The `paths` of every `no-restricted-imports` entry in `configs`, so a
 * config that sets the rule again can keep them.
 */
function inheritedRestrictedPaths(
  configs: readonly FlatConfig[],
): readonly unknown[] {
  return configs.flatMap(({ rules }) => {
    const entry: unknown = rules?.['no-restricted-imports'];

    if (!Arr.isArray(entry)) {
      return [];
    }

    const options: unknown = entry[1];

    return isRecord(options) &&
      hasKey(options, 'paths') &&
      Arr.isArray(options.paths)
      ? options.paths
      : [];
  });
}
