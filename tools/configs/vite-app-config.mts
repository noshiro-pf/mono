import viteReact from '@vitejs/plugin-react';
import * as path from 'node:path';
import { type UserConfig } from 'vite';

/**
 * Builds the Vite config for an app under `apps/` whose configs live in
 * `<package-root>/configs`.
 *
 * What every app shares is the shape: the package directory is the Vite root
 * (so `index.html` and `public/` are found where they sit), and the output
 * goes to `build/`, which is the directory each app's `firebase.json` serves.
 *
 * Preact apps pass no plugin. Vite's esbuild transform reads `jsx` and
 * `jsxImportSource` from the package's `tsconfig.json`, which already say
 * `react-jsx` and `preact`, so the build matches what the type check sees.
 * `@vitejs/plugin-react` is here for React's Fast Refresh; the Preact
 * equivalent would pull Babel in, which is not worth a dev-server nicety for
 * apps this repository does not deploy.
 */
export const defineViteAppConfig = ({
  packageRoot,
  framework,
  jsxImportSource,
}: Readonly<{
  /** The package's root directory, i.e. the parent of `configs`. */
  packageRoot: string;
  framework: 'preact' | 'react';
  /**
   * Passed to `@vitejs/plugin-react` so that the build agrees with the
   * package's `tsconfig.json`. Emotion's `css` prop needs
   * `'@emotion/react'`; leave it off where the tsconfig does.
   */
  jsxImportSource?: string;
}>): UserConfig => ({
  root: packageRoot,

  build: {
    outDir: path.resolve(packageRoot, 'build'),
    emptyOutDir: true,
  },

  plugins: framework === 'react' ? [viteReact({ jsxImportSource })] : [],
});
