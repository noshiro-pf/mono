import {
  defineConfig,
  defineKnownRules,
  eslintConfigForTypeScript,
} from 'eslint-config-typed';

const thisDir = import.meta.dirname;

export default defineConfig([
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),
  {
    rules: defineKnownRules({
      // ...
    }),
  },
]);
