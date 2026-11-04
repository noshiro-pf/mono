import * as path from 'node:path';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: path.resolve(import.meta.dirname, '..'),
  coverage: {
    include: ['src/**/*.mts', 'src-old/**/*.mts'],
  },
  node: {
    // No in-source tests: `scripts/build.mts` transpiles `src/` with esbuild,
    // which would keep the `import.meta.vitest` blocks.
    includeSource: [],
    include: ['src/**/*.test.mts', 'src-old/**/*.test.mts'],
  },
});
