import { eslintCypressRules } from '../rules/eslint-cypress-rules.mjs';
import { type FlatConfig } from '../types/flat-config.mjs';
import { type TypeScriptEslintRulesOption } from '../types/rules/typescript-eslint-rules.mjs';
import { eslintConfigForTypeScript } from './typescript.mjs';

export const eslintFlatConfigForCypress = ({
  tsconfigFileName,
  tsconfigRootDir,
  packageDirs,
  restrictedImports,
}: Readonly<{
  tsconfigFileName: string;
  tsconfigRootDir: string;
  packageDirs: readonly string[];
  restrictedImports?: TypeScriptEslintRulesOption['@typescript-eslint/no-restricted-imports'];
}>): readonly FlatConfig[] =>
  [
    ...eslintConfigForTypeScript({
      tsconfigFileName,
      tsconfigRootDir,
      packageDirs,
      restrictedImports,
    }),
    {
      languageOptions: {
        // https://github.com/sindresorhus/globals/blob/main/globals.json
        globals: {
          browser: true,
          node: true,
          es2021: true,
        },
      },
      rules: {
        ...eslintCypressRules,
        'jest/consistent-test-it': 'off',
        'jest/expect-expect': 'off',
        'jest/valid-describe-callback': 'off',
      },
    } satisfies FlatConfig,
  ] as const;
