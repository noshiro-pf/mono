import {
  eslintReactHooksRules,
  eslintReactRefresh,
  eslintReactRules,
} from '../rules/index.mjs';
import { type FlatConfig } from '../types/flat-config.mjs';
import { type TypeScriptEslintRulesOption } from '../types/rules/typescript-eslint-rules.mjs';
import { eslintFlatConfigCommon } from './common.mjs';

export const eslintFlatConfigReactBase = ({
  tsconfigFileName,
  tsconfigRootDir,
  packageDirs,
  restrictedImports,
  isViteProject,
}: Readonly<{
  tsconfigFileName: string;
  tsconfigRootDir: string;
  packageDirs: readonly string[];
  restrictedImports?: TypeScriptEslintRulesOption['@typescript-eslint/no-restricted-imports'];
  isViteProject: boolean;
}>): readonly FlatConfig[] =>
  [
    ...eslintFlatConfigCommon({
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
          jest: true,
          es2021: true,
        },
        sourceType: 'module',
      },
      rules: {
        ...eslintReactHooksRules,
        ...eslintReactRefresh,
        ...eslintReactRules,

        ...(isViteProject
          ? {
              '@typescript-eslint/no-namespace': 'error', // enable in Vite project
            }
          : {}),
      },
    } satisfies FlatConfig,
  ] as const;
