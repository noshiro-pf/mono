import mdx from '@mdx-js/rollup';
import preact from '@preact/preset-vite';
import legacy from '@vitejs/plugin-legacy';
import * as path from 'node:path';
import { defineConfig, PluginOption } from 'vite';
import { type UserConfig } from 'vitest/node';
import { createInjectDef } from './inject-def';

const thisDir: string = import.meta.dirname;

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const injectDef = await createInjectDef();

  return {
    plugins: [
      mdx({ jsxImportSource: 'preact' }) as PluginOption,
      preact(),
      injectDef,
      legacy(),
    ],
    build: {
      outDir: 'build',
    },
    resolve: {
      alias: [{ find: '~', replacement: path.resolve(thisDir, '../', 'src') }],
    },
    test: {
      include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
      globals: true,
      environment: 'happy-dom',
      typecheck: {
        tsconfig: path.resolve(thisDir, 'tsconfig.test.json'),
      },
    } satisfies UserConfig,
  };
});
