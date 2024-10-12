import * as replace from '@rollup/plugin-replace';
import * as typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';

const config = defineConfig({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    preserveModules: true,
  },
  plugins: [
    replace.default({
      'import.meta.vitest': 'undefined',
      preventAssignment: true,
    }),
    typescript.default({
      compilerOptions: {},
      declaration: true,
      declarationMap: true,
      rootDir: 'src',
      declarationDir: 'dist',
    }),
  ],
});

// eslint-disable-next-line import/no-default-export
export default config;
