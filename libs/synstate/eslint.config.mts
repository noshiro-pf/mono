import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  eslintImportsRules,
  mergeRestrictedImportsOptions,
  restrictedImportsOptions,
  restrictedSyntax,
  typescriptEslintRules,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';
import { eslintConfigOffForOxlint } from '../../tools/configs/oxlint-rules.mjs';
import { getSnapshotBan } from './configs/eslint/rules/get-snapshot-ban.mjs';

export default [
  ...eslintConfigForTypeScript({
    tsconfigRootDir: import.meta.dirname,
    tsconfigFileName: 'tsconfig.json',
    packageDirs: [import.meta.dirname],
  }),

  eslintPluginTsTypeForge.configs.recommended,
  eslintPluginTsDataForge.configs.recommended,
  eslintPluginTsFortress.configs.recommended,

  eslintConfigForVitest(),

  {
    files: ['test/**'],
    rules: defineKnownRules({
      // A test reads a node's state that the public types leave out.
      'import-x/no-internal-modules': [
        'error',
        {
          allow: [
            ...eslintImportsRules['import-x/no-internal-modules'][1].allow,
            'synstate/internal',
            // test/eslint-config.test.mts reads the ban it tests.
            '**/configs/eslint/rules/get-snapshot-ban.mjs',
          ],
        },
      ],
    }),
  },

  {
    files: ['src/**'],
    rules: defineKnownRules({
      // See configs/eslint/rules/get-snapshot-ban.mts.
      'no-restricted-syntax': ['error', ...restrictedSyntax, getSnapshotBan],
      // The observables are classes: a node per derived value has to be
      // cheap, so the methods live on a prototype and each operator is a
      // subclass that overrides `recompute`. See DESIGN.md.
      'functional/no-class-inheritance': 'off',
      // The graph's nodes are mutable by nature: a parent records its
      // children, a child is queued and recomputed in place.
      '@typescript-eslint/prefer-readonly-parameter-types': [
        'error',
        {
          ...typescriptEslintRules[
            '@typescript-eslint/prefer-readonly-parameter-types'
          ][1],
          allow: [
            ...typescriptEslintRules[
              '@typescript-eslint/prefer-readonly-parameter-types'
            ][1].allow,
            {
              from: 'file',
              name: [
                'DerivedClass',
                'DerivedNode',
                'EffectClass',
                'EffectNode',
                'FirstEmission',
                'ObservableClass',
                'OwnedNode',
                'Owner',
                'QueuedNode',
              ],
            },
            // What `fromAbortablePromise` hands its factory: the factory
            // listens on it, which a readonly type would not let it do.
            { from: 'lib', name: ['AbortSignal'] },
          ],
        },
      ],
    }),
  },

  // The other libraries' code that the documentation's benchmark and async
  // comparison set beside synstate's, each written the way its own
  // documentation writes it (the operators-on-signals pages show Preact
  // Signals the same way): their stores are mutated in place, and some are
  // imported from the entry point each library documents for use outside a
  // framework. synstate's own samples there keep every rule.
  {
    files: [
      'samples/docs-site/benchmark/**',
      'samples/docs-site/async-comparison/**',
      'samples/docs-site/operators-on-signals/**',
    ],
    ignores: ['**/*.synstate.mts'],
    rules: defineKnownRules({
      'functional/immutable-data': 'off',
      'functional/no-let': 'off',
      'import-x/no-internal-modules': [
        'error',
        {
          allow: [
            ...eslintImportsRules['import-x/no-internal-modules'][1].allow,
            'zustand/vanilla',
            'jotai/vanilla',
            'jotai/vanilla/utils',
            'jotai/utils',
            'valtio/vanilla',
            'rxjs/fetch',
          ],
        },
      ],
    }),
  },

  // Each sample's `createSearch` returns its library's own handle (an
  // observable, an atom, a store), whose inferred type is what the page shows;
  // spelled out, it would bury the code being compared.
  {
    files: ['samples/docs-site/async-comparison/**/01-search.*.mts'],
    rules: defineKnownRules({
      '@typescript-eslint/explicit-function-return-type': 'off',
    }),
  },

  // Solid's root export is its server build under Node, where nothing
  // reacts; the benchmark and the async comparison import the client build
  // through a shim (`solid-js-client.mts`, beside the files it serves), and a
  // bare import would measure, or test, a graph that never updates.
  {
    files: [
      'samples/docs-site/benchmark/**',
      'samples/docs-site/async-comparison/**',
    ],
    ignores: ['**/*.d.mts'],
    rules: defineKnownRules({
      'no-restricted-imports': [
        'error',
        mergeRestrictedImportsOptions(restrictedImportsOptions, {
          // `solid-js/store`, `solid-js/web` and the rest resolve to server
          // builds too. The shim's own deep import is exempted beside it, and
          // a type-only import is allowed, since it is erased.
          patterns: [
            {
              regex: String.raw`^solid-js(?:/|$)`,
              allowTypeImports: true,
              message:
                'Import Solid through the `solid-js-client.mjs` shim at the top of this sample directory, whose client build reacts under Node.',
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
      'no-await-in-loop': 'off',
      'import-x/no-unassigned-import': 'off',
      'import-x/no-internal-modules': 'off',
      'import-x/no-default-export': 'off',
    }),
  },

  // What src/ imports from ts-data-forge and ts-std-forge at run time is in
  // every bundle that uses synstate. esbuild keeps an object such as `Arr`,
  // `Num` or `SafeUint` whole once a module uses any member of it, when the
  // object comes from the package root. So src/ imports `Arr` as
  // `import * as Arr from 'ts-data-forge/array'`, which esbuild tree-shakes,
  // and from the roots only the names below. Add a standalone function to a
  // list, never an object. `Optional` and `Result` are the exception: objects,
  // but what src/ is built on, so every bundle that uses it has them anyway.
  // Tests are bundled by nobody. The ts-data-forge rules' fixes still import
  // from the package root, so a fix that adds `Arr` or an object is reported
  // here; move that import to the subpath by hand.
  {
    files: ['src/**'],
    ignores: ['src/**/*.test.mts'],
    rules: defineKnownRules({
      'no-restricted-imports': [
        'error',
        mergeRestrictedImportsOptions(restrictedImportsOptions, {
          paths: [
            {
              name: 'ts-data-forge',
              allowImportNames: ['replaceEqualDeep'],
              allowTypeImports: true,
              message:
                "synstate src/ imports only standalone functions from the ts-data-forge root, and `Arr` from 'ts-data-forge/array'; see the comment in eslint.config.mts.",
            },
            {
              name: 'ts-std-forge',
              allowImportNames: ['Optional', 'Result'],
              allowTypeImports: true,
              message:
                'synstate src/ imports only `Optional`, `Result` and standalone functions from ts-std-forge; see the comment in eslint.config.mts.',
            },
          ],
        }),
      ],
    }),
  },

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];
