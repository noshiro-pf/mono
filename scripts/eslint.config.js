/** @typedef {import('@noshiro/eslint-configs').FlatConfig} FlatConfig */

import {
  eslintFlatConfigForTypeScript,
  eslintFlatConfigForVitest,
} from '@noshiro/eslint-configs';
import * as nodePath from 'node:path';
import * as nodeUrl from 'node:url';

const toThisDir = (importMetaUrl) =>
  nodePath.dirname(nodeUrl.fileURLToPath(importMetaUrl));

const thisDir = toThisDir(import.meta.url);

/** @type {readonly FlatConfig[]} */
const configs = [
  {
    ignores: ['**/*.d.mts', 'esm'],
  },
  ...eslintFlatConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [nodePath.resolve(thisDir, '..'), thisDir],
  }),
  eslintFlatConfigForVitest(),
  {
    rules: {
      'no-restricted-globals': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      'import/no-extraneous-dependencies': 'off',
      'no-await-in-loop': 'off',
    },
  },
];

export default configs;
