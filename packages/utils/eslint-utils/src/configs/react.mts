import { type FlatConfig } from '../types/flat-config.mjs';
import { type TypeScriptEslintRulesOption } from '../types/rules/typescript-eslint-rules.mjs';
import { eslintFlatConfigReactBase } from './react-base.mjs';

export const eslintFlatConfigForReact = ({
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
  isViteProject?: boolean;
}>): readonly FlatConfig[] =>
  [
    ...eslintFlatConfigReactBase({
      tsconfigFileName,
      tsconfigRootDir,
      packageDirs,
      restrictedImports,
      isViteProject: isViteProject ?? false,
    }),
    {
      settings: {
        react: {
          version: 'detect',
        },
      },
    } satisfies FlatConfig,
  ] as const;
