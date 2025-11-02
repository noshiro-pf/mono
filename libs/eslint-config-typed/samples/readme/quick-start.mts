import {
  defineConfig,
  defineKnownRules,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  withDefaultOption,
} from 'eslint-config-typed';

// import * as path from 'node:path';
// import * as url from 'node:url';

const thisDir = import.meta.dirname;
// or path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig([
  {
    // config with just ignores is the replacement for `.eslintignore`
    ignores: ['**/build/**', '**/dist/**', 'src/some/file/to/ignore.ts'],
  },

  // Base config for TypeScript & JavaScript code
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],

    // If you are using a monorepo and the root package.json is located at ../../../:
    // packageDirs: [path.resolve(thisDir, '../../..'), thisDir],
  }),
  eslintConfigForVitest(),

  // You can override per-rule settings if necessary.
  {
    rules: defineKnownRules({
      '@typescript-eslint/no-explicit-any': withDefaultOption('warn'),
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      'react-hooks/exhaustive-deps': withDefaultOption('warn'),
      'functional/no-let': [
        'error',
        {
          allowInForLoopInit: true,
          allowInFunctions: false,
          ignoreIdentifierPattern: ['^mut_', '^_mut_', '^#mut_'],
        },
      ],
    }),
  },
]);
