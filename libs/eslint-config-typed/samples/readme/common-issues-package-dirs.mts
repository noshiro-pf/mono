import {
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';

const thisDir = import.meta.dirname;

export default eslintConfigForTypeScript({
  tsconfigRootDir: thisDir,
  tsconfigFileName: './tsconfig.json',
  packageDirs: [
    path.resolve(thisDir, '../../..'), // Monorepo root
    thisDir, // Current package
  ],
}) satisfies readonly FlatConfig[];
