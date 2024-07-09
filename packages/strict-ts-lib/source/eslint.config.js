/** @typedef {import('@noshiro/eslint-configs').FlatConfig} FlatConfig */

import {
  eslintFlatConfigCommon,
  restrictedSyntax,
} from '@noshiro/eslint-configs';
import { toThisDir } from '@noshiro/mono-scripts';
import * as nodePath from 'node:path';

const thisDir = toThisDir(import.meta.url);

/** @returns {readonly FlatConfig[]} */
const defineConfig = () => [
  {
    ignores: ['**/*.d.ts', '**/*.d.mts'],
  },
  ...eslintFlatConfigCommon({
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
      'import/no-internal-modules': 'off',
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
];

export default defineConfig();
