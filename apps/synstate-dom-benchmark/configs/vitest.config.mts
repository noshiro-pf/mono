import { playwright } from '@vitest/browser-playwright';
import solidPlugin from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';

/**
 * Runs `src/run.bench-browser.mts` in Chromium. Not a test suite: nothing
 * here runs in CI, and the run prints a table rather than asserting.
 */
export default defineConfig({
  root: workspaceRootPath,
  // Production builds of every library, as an application would ship them:
  // Solid and Preact carry development-only checks behind these.
  mode: 'production',
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    // Which library the run measures first (`scripts/repeat-benchmark.mts`
    // turns it from run to run): the first one measured starts on a colder
    // browser than the rest.
    'process.env.BENCHMARK_ROTATE': JSON.stringify(
      process.env['BENCHMARK_ROTATE'] ?? '0',
    ),
  },
  resolve: {
    conditions: ['module', 'browser', 'production'],
  },
  // The production JSX runtimes (`jsx`, not `jsxDEV`) for the same reason.
  oxc: {
    jsx: { development: false },
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
  plugins: [
    solidPlugin({
      // Only Solid's file goes through its compiler; the others keep the JSX
      // transform their `@jsxImportSource` pragma names.
      include: ['src/frameworks/solid.tsx'],
      dev: false,
      hot: false,
    }),
  ],
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
