import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForReact,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  restrictedSyntaxForReact,
  type FlatConfig,
} from 'eslint-config-typed';

const thisDir = import.meta.dirname;

export default [
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),

  eslintConfigForVitest(),

  {
    rules: defineKnownRules({
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              /**
               * make src independent of other modules
               */
              from: './!(src)/**/*',
              target: './src/**/*',
            },
            {
              /**
               * make src/types independent of other modules
               */
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
      'import/no-unassigned-import': 'off',
      'import/no-internal-modules': 'off',
      'import/no-default-export': 'off',
      'import/no-extraneous-dependencies': 'off',
    }),
  },

  ...eslintConfigForReact(['test/**/*.{mts,tsx}']),
  {
    files: ['test/**/*.{mts,tsx}'],
    rules: defineKnownRules({
      'no-restricted-syntax': [
        'error',
        ...restrictedSyntaxForReact.componentName.maxLength(),
        ...restrictedSyntaxForReact.componentVarTypeAnnotation,
        ...restrictedSyntaxForReact.importStyle,
        ...restrictedSyntaxForReact.propsTypeAnnotationStyle,
        ...restrictedSyntaxForReact.reactHooksDefinitionStyle,
        ...restrictedSyntaxForReact.reactMemoPropsArgumentName,
        ...restrictedSyntaxForReact.reactMemoTypeParam,
      ],
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
] satisfies FlatConfig[];
