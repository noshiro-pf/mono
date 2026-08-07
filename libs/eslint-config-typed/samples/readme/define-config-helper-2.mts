import {
  defineKnownRules,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
import { Arr } from 'ts-data-forge';

const thisDir = import.meta.dirname;

export default Arr.toPushed(
  eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),
  {
    rules: defineKnownRules({
      // ...
    }),
  },
) satisfies readonly FlatConfig[];
