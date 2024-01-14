import { toThisDir } from '@noshiro/mono-scripts/node-utils/path-utils.mjs';
import * as nodePath from 'node:path';
import { defineConfig } from 'vitest/config';
import { createInjectDef } from './inject-def';

const thisDir: string = toThisDir(import.meta.url);

export default defineConfig(async () => {
  const injectDef = await createInjectDef();

  return {
    plugins: [injectDef],
    test: {
      globals: true,
      environment: 'happy-dom',
      typecheck: {
        tsconfig: nodePath.resolve(thisDir, 'tsconfig.test.json'),
      },
    },
  };
});
