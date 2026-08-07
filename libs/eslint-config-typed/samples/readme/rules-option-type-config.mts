// eslint.config.mts

import {
  defineKnownRules,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
import { Arr } from 'ts-data-forge';
import { restrictedSyntax } from './restricted-syntax-defs.mjs';

const thisDir = import.meta.dirname;

export default Arr.toPushed(
  eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),
  {
    rules: defineKnownRules({
      'no-restricted-syntax': ['error', ...restrictedSyntax],
    }),
  },
) satisfies readonly FlatConfig[];
