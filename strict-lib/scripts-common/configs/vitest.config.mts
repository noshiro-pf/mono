import * as path from 'node:path';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: path.resolve(import.meta.dirname, '..'),
  // code-check runs the tests through `ws:check:test:cov`, so `check:test:cov`
  // is what reaches them there. Nothing uploads this package's coverage.
  coverage: {
    include: ['src/**/*.mts'],
  },
  node: {
    include: ['src/**/*.test.mts'],
  },
  browser: false,
});
