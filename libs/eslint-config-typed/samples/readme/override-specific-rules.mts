import {
  defineKnownRules,
  eslintConfigForTypeScript,
  type FlatConfig,
  typescriptEslintRules,
  withDefaultOption,
} from 'eslint-config-typed';
import { Arr } from 'ts-data-forge';

const thisDir = import.meta.dirname;

export default Arr.toPushed(
  eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),
  {
    rules: defineKnownRules({
      // Downgrade to warning (Option settings are inherited)
      '@typescript-eslint/no-explicit-any': withDefaultOption('warn'),
      // Disable a rule
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      // Configure with options
      'functional/no-let': [
        'error',
        {
          allowInForLoopInit: true,
          allowInFunctions: false,
        },
      ],

      // Update rule options
      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            ...typescriptEslintRules[
              '@typescript-eslint/no-restricted-types'
            ][1].types,
            Function: "Don't use Function type",
          },
        },
      ],
    }),
  },
) satisfies readonly FlatConfig[];
