/** @typedef {import('@noshiro/eslint-configs').FlatConfig} FlatConfig */

import {
  eslintFlatConfigForTypeScript,
  restrictedSyntax,
} from '@noshiro/eslint-configs';
import { toThisDir } from '@noshiro/node-utils';
import * as nodePath from 'node:path';

const thisDir = toThisDir(import.meta.url);

/** @returns {readonly FlatConfig[]} */
const defineConfig = () => [
  {
    ignores: ['**/*.d.ts', '**/*.d.mts'],
  },
  ...eslintFlatConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [nodePath.resolve(thisDir, '../../..'), thisDir],
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
    },
  },
];

export default defineConfig();
