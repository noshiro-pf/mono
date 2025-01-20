import { toThisDir } from '@noshiro/mono-utils';
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react-swc';
import * as nodePath from 'node:path';
import { defineConfig } from 'vite';
import { type UserConfig } from 'vitest/node';
import { createInjectDef } from './inject-def';

const thisDir: string = toThisDir(import.meta.url);

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const injectDef = await createInjectDef();

  return {
    plugins: [
      react({ jsxImportSource: '@emotion/react' }),
      injectDef,
      legacy(),
    ],
    build: {
      outDir: 'build',
    },
    resolve: {
      alias: [
        { find: '~', replacement: nodePath.resolve(thisDir, '../', 'src') },
      ],
    },
    test: {
      include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
      globals: true,
      environment: 'happy-dom',
      typecheck: {
        tsconfig: nodePath.resolve(thisDir, 'tsconfig.test.json'),
      },
    } satisfies UserConfig,
  };
});
