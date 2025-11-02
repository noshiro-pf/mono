import {
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';

const thisDir = import.meta.dirname;

export default eslintConfigForTypeScript({
  tsconfigRootDir: thisDir, // Must be absolute path
  tsconfigFileName: './tsconfig.json', // Relative to tsconfigRootDir
  packageDirs: [thisDir],
}) satisfies readonly FlatConfig[];
