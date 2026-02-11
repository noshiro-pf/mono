import {
  defineKnownRules,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';

const thisDir = import.meta.dirname;

export default [
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),
  {
    rules: defineKnownRules({
      // @ts-expect-error typo of rule name
      'no-restricted-globalsSSSS': 'error',
      // ~~~~~~~~~~~~~~~~~~~~~~~
    }),
  },
  {
    rules: defineKnownRules({
      'no-unsafe-optional-chaining': [
        'error',
        // @ts-expect-error typo of an option key
        { disallowArithmeticOperatorsSSSSS: true },
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      ],
    }),
  },
] satisfies readonly FlatConfig[];
