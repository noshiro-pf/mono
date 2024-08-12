/** @typedef {import('@noshiro/eslint-configs').FlatConfig} FlatConfig */

import { eslintConfigForTypeScript } from '@noshiro/eslint-configs';
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
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [nodePath.resolve(thisDir, '..'), thisDir],
  }),
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
