import { type EslintPreferArrowFunctionRules } from '../types/index.mjs';

export const eslintPreferArrowFunctionRules: EslintPreferArrowFunctionRules = {
  'prefer-arrow-functions/prefer-arrow-functions': [
    'error',
    {
      allowedNames: [],
      allowObjectProperties: false,
      allowNamedFunctions: false,
      classPropertiesAllowed: false,
      disallowPrototype: true,
      returnStyle: 'implicit',
      singleReturnOnly: false,
    },
  ],
} as const;
