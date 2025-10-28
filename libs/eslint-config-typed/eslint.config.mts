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
