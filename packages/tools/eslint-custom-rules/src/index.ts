import {
  preferReadonlyParameterTypesRule,
  preferReadonlyParameterTypesRuleName,
} from './rules/prefer-readonly-parameter-types';

const thisPluginName = 'noshiro-custom';

const all = {
  plugins: [thisPluginName],
  rules: {
    [`${thisPluginName}/${preferReadonlyParameterTypesRuleName}`]: 'error',
  },
  // need all these for parsing dependencies (even if _your_ code doesn't need
  // all of them)
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    project: '../tsconfig.json',
  },
};

export = {
  rules: {
    [preferReadonlyParameterTypesRuleName]: preferReadonlyParameterTypesRule,
  },
  configs: {
    parser: '@typescript-eslint/parser',
    parserOptions: all.parserOptions,
    plugins: ['@typescript-eslint'],
    all,
  },
};
