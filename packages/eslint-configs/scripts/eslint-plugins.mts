export const eslintPlugins = {
  EslintRules: {
    typeName: 'EslintRules',
    pluginName: 'eslint',
    rulePrefix: 'xxx/',
    outputFileName: 'eslint-rules.mts',
  },
  EslintArrayFuncRules: {
    typeName: 'EslintArrayFuncRules',
    pluginName: 'eslint-plugin-array-func',
    rulePrefix: 'array-func/',
    outputFileName: 'eslint-array-func-rules.mts',
  },
  EslintPreferArrowFunctionRules: {
    typeName: 'EslintPreferArrowFunctionRules',
    pluginName: 'eslint-plugin-prefer-arrow-functions',
    rulePrefix: 'prefer-arrow-functions/',
    outputFileName: 'eslint-prefer-arrow-functions-rules.mts',
  },
  EslintTotalFunctions: {
    typeName: 'EslintTotalFunctionsRules',
    pluginName: 'eslint-plugin-total-functions',
    rulePrefix: 'total-functions/',
    outputFileName: 'eslint-total-functions-rules.mts',
  },
  EslintCypressRules: {
    typeName: 'EslintCypressRules',
    pluginName: 'eslint-plugin-cypress',
    rulePrefix: 'cypress/',
    outputFileName: 'eslint-cypress-rules.mts',
  },
  EslintFunctionalRules: {
    typeName: 'EslintFunctionalRules',
    pluginName: 'eslint-plugin-functional',
    rulePrefix: 'functional/',
    outputFileName: 'eslint-functional-rules.mts',
  },
  EslintImportsRules: {
    typeName: 'EslintImportsRules',
    pluginName: 'eslint-plugin-import',
    rulePrefix: 'import/',
    outputFileName: 'eslint-import-rules.mts',
  },
  EslintStrictDependencies: {
    typeName: 'EslintStrictDependenciesRules',
    pluginName: 'eslint-plugin-strict-dependencies',
    rulePrefix: 'strict-dependencies/',
    outputFileName: 'eslint-strict-dependencies-rules.mts',
  },
  EslintPromiseRules: {
    typeName: 'EslintPromiseRules',
    pluginName: 'eslint-plugin-promise',
    rulePrefix: 'promise/',
    outputFileName: 'eslint-promise-rules.mts',
  },
  EslintSecurityRules: {
    typeName: 'EslintSecurityRules',
    pluginName: 'eslint-plugin-security',
    rulePrefix: 'security/',
    outputFileName: 'eslint-security-rules.mts',
  },
  EslintDeprecationRules: {
    typeName: 'EslintDeprecationRules',
    pluginName: 'eslint-plugin-deprecation',
    rulePrefix: 'deprecation/',
    outputFileName: 'eslint-deprecation-rules.mts',
  },
  EslintUnicornRules: {
    typeName: 'EslintUnicornRules',
    pluginName: 'eslint-plugin-unicorn',
    rulePrefix: 'unicorn/',
    outputFileName: 'eslint-unicorn-rules.mts',
  },
  EslintReactRules: {
    typeName: 'EslintReactRules',
    pluginName: 'eslint-plugin-react',
    rulePrefix: 'react/',
    outputFileName: 'eslint-react-rules.mts',
  },
  EslintReactHooksRules: {
    typeName: 'EslintReactHooksRules',
    pluginName: 'eslint-plugin-react-hooks',
    rulePrefix: 'react-hooks/',
    outputFileName: 'eslint-react-hooks-rules.mts',
  },
  EslintReactRefresh: {
    typeName: 'EslintReactRefreshRules',
    pluginName: 'eslint-plugin-react-refresh',
    rulePrefix: 'react-refresh/',
    outputFileName: 'eslint-react-refresh-rules.mts',
  },
  EslintJsxA11y: {
    typeName: 'EslintJsxA11yRules',
    pluginName: 'eslint-plugin-jsx-a11y',
    rulePrefix: 'jsx-a11y/',
    outputFileName: 'eslint-jsx-a11y-rules.mts',
  },
  EslintJestRules: {
    typeName: 'EslintJestRules',
    pluginName: 'eslint-plugin-jest',
    rulePrefix: 'jest/',
    outputFileName: 'eslint-jest-rules.mts',
  },
  EslintVitestRules: {
    typeName: 'EslintVitestRules',
    pluginName: 'eslint-plugin-vitest',
    rulePrefix: 'vitest/',
    outputFileName: 'eslint-vitest-rules.mts',
  },
  EslintTestingLibrary: {
    typeName: 'EslintTestingLibraryRules',
    pluginName: 'eslint-plugin-testing-library',
    rulePrefix: 'testing-library/',
    outputFileName: 'eslint-testing-library-rules.mts',
  },
  TypeScriptEslintRules: {
    typeName: 'TypeScriptEslintRules',
    pluginName: '@typescript-eslint/eslint-plugin',
    rulePrefix: '@typescript-eslint/',
    outputFileName: 'typescript-eslint-rules.mts',
  },
} as const satisfies Record<
  string,
  {
    typeName: `${string}Rules`;
    pluginName:
      | '@typescript-eslint/eslint-plugin'
      | 'eslint'
      | `eslint-plugin-${string}`;
    rulePrefix: `${string}/`;
    outputFileName: `${string}.mts`;
  }
>;
