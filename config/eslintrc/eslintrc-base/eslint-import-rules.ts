import type { Linter } from 'eslint';

export const eslintImportsRules: Readonly<{
  staticAnalysis: Partial<Linter.RulesRecord>;
  helpfulWarnings: Partial<Linter.RulesRecord>;
  moduleSystems: Partial<Linter.RulesRecord>;
  styleGuide: Partial<Linter.RulesRecord>;
}> = {
  staticAnalysis: {
    // // 'import/no-unresolved': 'warn',
    // // 'import/named': 'off',
    // // 'import/default': 'warn',
    // // 'import/namespace': 'warn',
    // 'import/no-restricted-paths': 'warn',
    'import/no-absolute-path': 'warn',
    // 'import/no-dynamic-require': 'warn',
    'import/no-internal-modules': [
      'warn',
      {
        allow: [
          'rxjs/operators',
          'solid-js/web',
          '@testing-library/jest-dom/extend-expect',
          'preact/**',
          'immer/**',
          'firebase/*',
          '@blueprintjs/*',
          '@material-ui/*',
        ],
      },
    ],
    // 'import/no-webpack-loader-syntax': 'warn',
    'import/no-self-import': 'warn',
    'import/no-cycle': 'warn',
    'import/no-useless-path-segments': 'warn',
    // 'import/no-relative-parent-imports': 'warn',
  },
  helpfulWarnings: {
    // // 'import/export': 'warn',
    // // 'import/no-named-as-default': 'warn',
    // // 'import/no-named-as-default-member': 'warn',
    // 'import/no-deprecated': 'warn',
    // 'import/no-extraneous-dependencies': 'warn',
    // 'import/no-mutable-exports': 'warn',
    // 'import/no-unused-modules': 'warn',
  },
  moduleSystems: {
    // 'import/unambiguous': 'warn',
    // 'import/no-commonjs': 'warn',
    // 'import/no-amd': 'warn',
    // 'import/no-nodejs-modules': 'warn',
    // 'import/no-import-module-exports': 'warn',
  },
  styleGuide: {
    // 'import/first': 'warn',
    // 'import/exports-last': 'warn',
    // // 'import/no-duplicates': 'warn',
    // 'import/no-namespace': 'warn',
    // 'import/extensions': 'warn',
    // // 'import/order': 'warn',
    // // 'import/newline-after-import': 'warn',
    // 'import/prefer-default-export': 'warn',
    // 'import/max-dependencies': 'warn',
    // 'import/no-unassigned-import': 'warn',
    // 'import/no-named-default': 'warn',
    // 'import/no-default-export': 'warn',
    // 'import/no-named-export': 'warn',
    // 'import/no-anonymous-default-export': 'warn',
    // 'import/group-exports': 'warn',
    // 'import/dynamic-import-chunkname': 'warn',
  },
};
