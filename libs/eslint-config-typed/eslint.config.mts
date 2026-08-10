import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForReact,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  eslintImportsRules,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import {
  eslintPluginTsTypeForge,
  type EslintTsTypeForgeRules,
} from 'eslint-plugin-ts-type-forge';

const thisDir = import.meta.dirname;

export default [
  {
    ignores: ['docs/**', 'agents/**'],
  },
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),

  eslintConfigForVitest(),

  eslintPluginTsTypeForge.configs.recommended,
  eslintPluginTsDataForge.configs.recommended,
  eslintPluginTsFortress.configs.recommended,

  {
    rules: defineKnownRules({
      'immer-coding-style/prefer-curried-produce': 'error',

      'import-x/no-internal-modules': [
        'error',
        {
          allow: [
            ...eslintImportsRules['import-x/no-internal-modules'][1].allow,
            '@typescript-eslint/utils/ts-eslint',
          ],
        },
      ],
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              // make src independent of other modules
              from: './!(src)/**/*',
              target: './src/**/*',
            },
            {
              // make src/types independent of other modules
              from: './src/!(types)/**/*',
              target: './src/types/**/*',
            },
          ],
        },
      ],

      'strict-dependencies/strict-dependencies': [
        'error',
        [
          {
            /**
             * Disallow importing from `configs`
             */
            module: './src/configs',
            allowReferenceFrom: ['./src/index.mts'],
          },
          {
            /**
             * Allow only `plugins --> {configs}` dependency
             */
            module: './src/plugins',
            allowReferenceFrom: ['./src/configs', './src/index.mts'],
          },
          {
            /**
             * Allow only `rules --> {configs}` dependency
             */
            module: './src/rules',
            allowReferenceFrom: ['./src/configs/**', './src/index.mts'],
          },
          {
            /**
             * Allow only `types --> {configs,plugins,rules}` dependency
             */
            module: 'src/types',
            allowReferenceFrom: [
              'src/configs',
              'src/plugins',
              'src/rules',
              'src/index.mts',
            ],
          },
        ].map((o) => ({ ...o, allowSameModule: true })),
        {
          resolveRelativeImport: true,
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
      'import-x/no-extraneous-dependencies': 'off',
      // Code-generation scripts legitimately export helpers, await inside
      // codegen flows, break out of nested loops, and build dynamic strings.
      'unicorn/no-exports-in-scripts': 'off',
      'unicorn/no-break-in-nested-loop': 'off',
      'unicorn/no-unsafe-string-replacement': 'off',
      'unicorn/prefer-await': 'off',
      'unicorn/prefer-top-level-await': 'off',
    }),
  },

  {
    // Generated rule-type definitions: comment/format style is produced by the
    // generator and is not worth (and cannot stay) hand-aligned to these rules.
    files: ['src/types/rules/**'],
    rules: defineKnownRules({
      'unicorn/comment-content': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
    }),
  },
  {
    // `json-schema-to-typescript` emits the built-in `Record` for
    // `patternProperties` / `additionalProperties`, so the generated rule-type
    // definitions cannot use the ts-type-forge aliases.
    files: ['src/types/rules/**'],
    rules: {
      'ts-type-forge/prefer-readonly-or-mutable-record': 'off',
    } satisfies Partial<EslintTsTypeForgeRules>,
  },
  {
    // Verbatim copy of vitest's own `globals.d.ts`; keeping it byte-comparable
    // with upstream matters more than the ts-type-forge alias preference.
    files: ['vitest-globals.d.ts'],
    rules: {
      'ts-type-forge/prefer-readonly-or-mutable-record': 'off',
      'ts-type-forge/prefer-strict-or-relaxed-utility-type': 'off',
    } satisfies Partial<EslintTsTypeForgeRules>,
  },

  {
    // ESLint rule implementations are AST-heavy; these opinionated rules conflict
    // with idiomatic visitor/traversal code.
    files: ['src/plugins/**'],
    rules: defineKnownRules({
      'unicorn/no-unsafe-property-key': 'off',
      'unicorn/no-break-in-nested-loop': 'off',
      'unicorn/no-declarations-before-early-exit': 'off',
      'unicorn/no-unsafe-string-replacement': 'off',
      'unicorn/prefer-number-is-safe-integer': 'off',
      'unicorn/prefer-early-return': 'off',
    }),
  },

  {
    files: ['src/**'],
    rules: defineKnownRules({
      'import-x/no-unused-modules': 'off',
    }),
  },
  {
    files: ['src/entry-point.mts'],
    rules: defineKnownRules({
      'no-restricted-imports': 'off',
      '@stylistic/padding-line-between-statements': 'off',
    }),
  },
  {
    files: [
      'src/plugins/total-functions/rules/**',
      'src/plugins/tree-shakable/rules/**',
    ],
    rules: defineKnownRules({
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    }),
  },
  {
    files: ['samples/**'],
    rules: defineKnownRules({
      'import-x/no-default-export': 'off',
    }),
  },

  ...eslintConfigForReact(['test/**/*.{mts,tsx}']),

  {
    files: ['test/**'],
    rules: defineKnownRules({
      // Test fixtures intentionally contain top-level rendering side effects.
      'unicorn/no-top-level-side-effects': 'off',
      'ts-restrictions/no-restricted-cast-name': [
        'error',
        {
          name: 'MyInt',
          fixWith: {
            kind: 'function',
            name: 'asMyInt',
          },
        },
      ],
    }),
  },
  {
    files: ['test/react-named-imports/**'],
    rules: defineKnownRules({
      'react-coding-style/import-style': [
        'error',
        {
          importStyle: 'named',
        },
      ],
    }),
  },
] satisfies readonly FlatConfig[];
