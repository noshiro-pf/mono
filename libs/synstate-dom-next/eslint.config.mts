import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  eslintImportsRules,
  mergeRestrictedImportsOptions,
  restrictedImportsOptions,
  typescriptEslintRules,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';
import { eslintConfigOffForOxlint } from '../../tools/configs/oxlint-rules.mjs';

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
    rules: defineKnownRules({
      // The `JSX` namespace has to declare an `Element` type of its own.
      '@typescript-eslint/no-shadow': [
        'error',
        {
          ...typescriptEslintRules['@typescript-eslint/no-shadow'][1],
          allow: ['Element'],
        },
      ],
    }),
  },

  {
    files: ['src/**'],
    rules: defineKnownRules({
      // A binding is a subclass of synstate-next's effect class, and a
      // description of the abstract `Description`: one object per binding,
      // its methods on the prototype. See synstate-next's DESIGN.md.
      'functional/no-class-inheritance': 'off',
      // The renderer is built on synstate-next's classes, which only
      // `synstate-next/internal` exports.
      'import-x/no-internal-modules': [
        'error',
        {
          allow: [
            ...eslintImportsRules['import-x/no-internal-modules'][1].allow,
            'synstate-next/internal',
          ],
        },
      ],
      // The DOM nodes a mount creates and moves, and the graph's nodes, are
      // mutable by nature, as the elements the shared configuration already
      // allows are.
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
              from: 'lib',
              name: [
                'ChildNode',
                'Comment',
                'CSSStyleDeclaration',
                'Document',
                'Node',
                'Text',
              ],
            },
            {
              from: 'file',
              name: ['Description', 'MountedNodes', 'Row'],
            },
            {
              from: 'package',
              package: 'synstate-next',
              name: ['ObservableClass', 'Owner', 'State'],
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
      'no-await-in-loop': 'off',
      'import-x/no-unassigned-import': 'off',
      'import-x/no-internal-modules': 'off',
      'import-x/no-default-export': 'off',
    }),
  },

  // What src/ imports from ts-data-forge and ts-std-forge at run time is in
  // every bundle that uses synstate-dom-next. esbuild keeps an object such as `Arr`,
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
              allowImportNames: ['isNonNullObject'],
              allowTypeImports: true,
              message:
                "synstate-dom-next src/ imports only standalone functions from the ts-data-forge root, and `Arr` from 'ts-data-forge/array'; see the comment in eslint.config.mts.",
            },
            {
              name: 'ts-std-forge',
              allowImportNames: ['Optional', 'Result'],
              allowTypeImports: true,
              message:
                'synstate-dom-next src/ imports only `Optional`, `Result` and standalone functions from ts-std-forge; see the comment in eslint.config.mts.',
            },
          ],
        }),
      ],
    }),
  },

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];
