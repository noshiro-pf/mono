import { type PreferArrowFunctionRules } from '../types/rules/eslint-prefer-arrow-functions-rules.mjs';

export const eslintPreferArrowFunctionRules: PreferArrowFunctionRules = {
  'prefer-arrow-functions/prefer-arrow-functions': [
    'error',
    {
      allowNamedFunctions: false,
      classPropertiesAllowed: false,
      disallowPrototype: false,
      returnStyle: 'unchanged',
      singleReturnOnly: false,
    },
  ],
};
