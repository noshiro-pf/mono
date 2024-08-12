import { type EslintPreferArrowFunctionRules } from '../types/index.mjs';

export const eslintPreferArrowFunctionRules: EslintPreferArrowFunctionRules = {
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
