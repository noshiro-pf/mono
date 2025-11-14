import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForReact,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  eslintImportsRules,
  type FlatConfig,
} from 'eslint-config-typed';

const thisDir = import.meta.dirname;

export default [
  {
    ignores: ['.eslintrc.cjs'],
  },
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),

  eslintConfigForVitest(),

  {
    rules: defineKnownRules({
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
    }),
  },

  ...eslintConfigForReact(['test/**/*.{mts,tsx}']),

  {
    files: ['src/**'],
    rules: defineKnownRules({
      'import-x/no-unused-modules': [
        'error',
        { unusedExports: true, ignoreExports: ['src/entry-point.mts'] },
      ],
    }),
  },
  {
    files: ['src/entry-point.mts'],
    rules: defineKnownRules({
      '@typescript-eslint/no-restricted-imports': 'off',
    }),
  },
  {
    files: ['src/types/rules/*.mts'],
    rules: defineKnownRules({
      'functional/readonly-type': ['error', 'keyword'],
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
  {
    files: ['test/**'],
    rules: defineKnownRules({
      'ts-restrictions/no-restricted-cast-name': [
        'error',
        {
          name: 'Int',
          fixWith: {
            kind: 'function',
            name: 'asInt',
          },
        },
      ],
    }),
  },
] satisfies FlatConfig[];
