import { eslintConfigForSumi } from '@sumi-lang/eslint-config';
import { type FlatConfig } from 'eslint-config-typed';
import * as path from 'node:path';

const packageRootPath = path.resolve(import.meta.dirname, '..');

/**
 * The ESLint bridge preset as test/eslint-bridge.test.mts runs it over the
 * corpus — the preset alone, type-checked under the fixtures' own tsconfig.
 * A config file rather than an inline `overrideConfig`, because ESLint then
 * loads it the way it loads every other `eslint.config.mts`.
 */
export default eslintConfigForSumi({
  tsconfigRootDir: path.resolve(packageRootPath, 'fixtures'),
  tsconfigFileName: './tsconfig.json',
  packageDirs: [packageRootPath],
}) satisfies readonly FlatConfig[];
