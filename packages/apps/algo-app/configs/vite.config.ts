import { toThisDir } from '@noshiro/mono-scripts';
import preact from '@preact/preset-vite';
import legacy from '@vitejs/plugin-legacy';
import * as nodePath from 'node:path';
import { defineConfig } from 'vite';
import { createInjectDef } from './inject-def';

const thisDir: string = toThisDir(import.meta.url);

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const injectDef = await createInjectDef();

  return {
    plugins: [preact(), injectDef, legacy()],
    build: {
      outDir: 'build',
    },
    resolve: {
      alias: [
        { find: '~', replacement: nodePath.resolve(thisDir, '../', 'src') },
      ],
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      typecheck: {
        tsconfig: nodePath.resolve(thisDir, 'tsconfig.test.json'),
      },
    },
  };
});
