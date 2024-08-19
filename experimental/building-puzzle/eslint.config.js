import {
  eslintFlatConfigForTypeScript,
  eslintFlatConfigForVitest,
} from '@tier4/eslint';
import { toThisDir } from '@tier4/node-utils';
import * as path from 'node:path';

const thisDir = toThisDir(import.meta.url);

/** @returns {readonly import('@tier4/eslint').FlatConfig[]} */
const defineConfig = () => [
  {
    ignores: ['dist', 'build.config.ts'],
  },
  ...eslintFlatConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [path.resolve(thisDir, '../../..'), thisDir],
  }),
  eslintFlatConfigForVitest(),
];

export default defineConfig();
