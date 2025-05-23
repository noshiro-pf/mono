/** @typedef {import('@noshiro/eslint-configs').FlatConfig} FlatConfig */

import {
  eslintFlatConfigForTypeScript,
  restrictedSyntax,
} from '@noshiro/eslint-configs';
import 'zx/globals';

const thisDir = import.meta.dirname;

/** @returns {readonly FlatConfig[]} */
const defineConfig = () => [
  {
    ignores: ['**/*.d.ts', '**/*.d.mts', 'scripts/dist/**/*.mjs'],
  },
  ...eslintFlatConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [path.resolve(thisDir, '../../..'), thisDir],
  }),
  {
    rules: {
      /** @satisfies {import('@noshiro/eslint-configs').EslintRules['no-restricted-syntax']} */
      'no-restricted-syntax': [
        'error',
        ...restrictedSyntax,
        {
          // ban ".replaceAll"
          selector: "MemberExpression[property.name='replaceAll']",
          message: 'Use `replaceWithNoMatchCheck` instead.',
        },
      ],
      'no-restricted-globals': 'off',
      'import/no-internal-modules': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'no-await-in-loop': 'off',
    },
  },
];

export default defineConfig();
