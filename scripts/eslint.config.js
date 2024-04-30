/** @typedef {import('@noshiro/eslint-utils').FlatConfig} FlatConfig */

import { eslintFlatConfigCommon } from '@noshiro/eslint-utils';
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
  ...eslintFlatConfigCommon({
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
