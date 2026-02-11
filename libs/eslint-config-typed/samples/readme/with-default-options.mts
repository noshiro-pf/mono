import {
  defineKnownRules,
  eslintConfigForTypeScript,
  withDefaultOption,
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
      // @ts-expect-error Simply passing the string "error" to a rule with options is not allowed
      'no-restricted-globals': 'error',
      // ~~~~~~~~~~~~~~~~~~~~
      // ^ Type Error! (Because "no-restricted-globals" has options)
      // NOTE: In addition, some rules, such as "no-restricted-syntax" "and no-restricted-globals", have no effect unless you set the option.

      // OK
      'object-shorthand': withDefaultOption('error'),

      // OK (options are set explicitly)
      'no-unsafe-optional-chaining': [
        'error',
        { disallowArithmeticOperators: true },
      ],
    }),
  },
] satisfies readonly FlatConfig[];
