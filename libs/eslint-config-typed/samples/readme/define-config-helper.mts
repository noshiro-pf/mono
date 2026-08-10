import {
  defineConfig,
  defineKnownRules,
  eslintConfigForTypeScript,
} from 'eslint-config-typed';
import { Arr } from 'ts-data-forge';

const thisDir = import.meta.dirname;

export default defineConfig(
  Arr.toPushed(
    eslintConfigForTypeScript({
      tsconfigRootDir: thisDir,
      tsconfigFileName: './tsconfig.json',
      packageDirs: [thisDir],
    }),
    {
      rules: defineKnownRules({
        // ...
      }),
    },
  ),
);
