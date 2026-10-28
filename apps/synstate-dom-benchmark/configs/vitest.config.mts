import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
import { createProductionConfig } from '../scripts/production-config.mjs';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';

const productionConfig = createProductionConfig();

/**
 * Runs `src/run.bench-browser.mts` in Chromium. Not a test suite: nothing
 * here runs in CI, and the run prints a table rather than asserting.
 */
export default defineConfig({
  ...productionConfig,
  root: workspaceRootPath,
  define: {
    ...productionConfig.define,
    // Which library the run measures first (`scripts/repeat-benchmark.mts`
    // turns it from run to run): the first one measured starts on a colder
    // browser than the rest.
    'process.env.BENCHMARK_ROTATE': JSON.stringify(
      process.env['BENCHMARK_ROTATE'] ?? '0',
    ),
  },
  optimizeDeps: {
    // Named up front so that Vite does not discover them mid-run and reload
    // the page; see `optimizeDepsInclude` in tools/configs/vite-config.mts.
    include: [
      '@preact/signals',
      'preact',
      'preact/compat',
      'preact/hooks',
      'preact/jsx-runtime',
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'solid-js',
      'solid-js/web',
      'vanjs-core',
      'synstate-dom > ts-data-forge > @sindresorhus/is',
    ],
  },
  test: {
    globals: true,
    // vite-plugin-solid defaults this to jsdom for Vitest; the run is in a
    // real browser, so there is no environment to emulate.
    environment: 'node',
    include: ['src/run.bench-browser.mts'],
    testTimeout: 600_000,
    browser: {
      enabled: true,
      headless: true,
      screenshotFailures: false,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
});
