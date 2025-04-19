import * as replace from '@rollup/plugin-replace';
import * as typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';
import 'zx/globals';

const files = await glob('src/commands/*.mts');

const config = defineConfig({
  input: ['src/index.mts', ...files],
  output: {
    dir: 'dist',
    preserveModules: true,
    sourcemap: true,
  },
  plugins: [
    replace.default({
      'import.meta.vitest': 'undefined',
    }),
    typescript.default({
      declaration: true,
      declarationMap: true,
      rootDir: 'src',
      declarationDir: 'dist',
    }),
    replace.default({
      "import 'vitest'": 'undefined',
    }),
  ],
});

// eslint-disable-next-line import/no-default-export
export default config;
