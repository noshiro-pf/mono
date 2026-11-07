import type { UserConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
// eslint-disable-next-line import-x/no-relative-packages -- shared with synstate-docs' measurement (#3066)
import { productionBuildConfig } from '../../../tools/scripts/lib/bundle-size.mjs';

/**
 * How every library is compiled, shared by the timed run
 * (`configs/vitest.config.mts`) and by `measure-bundle-size.mts`, so that the
 * bundles measured are the code that is timed. A function, because the
 * Solid plugin keeps state per build.
 */
export const createProductionConfig = (): UserConfig =>
  ({
    // Production builds of every library, as an application would ship them.
    ...productionBuildConfig(),
    // The production JSX runtimes (`jsx`, not `jsxDEV`) for the same reason.
    oxc: {
      jsx: { development: false },
    },
    plugins: [
      solidPlugin({
        // Only Solid's files go through its compiler; the others keep the JSX
        // transform their `@jsxImportSource` pragma names.
        include: [
          'src/frameworks/solid.tsx',
          'src/scenarios/*/solid.tsx',
          'src/counter/solid.tsx',
        ],
        dev: false,
        hot: false,
      }),
    ],
  }) as const;
