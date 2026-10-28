import viteReact from '@vitejs/plugin-react';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { UserConfig, Plugin as VitePlugin } from 'vite';
import { appDevPort } from './app-dev-ports.mjs';

/**
 * Builds the Vite config for an app under `apps/` whose configs live in
 * `<package-root>/configs`.
 *
 * What every app shares is the shape: the package directory is the Vite root
 * (so `index.html` and `public/` are found where they sit), and the output
 * goes to `build/` — the directory `build-pages-site.mts` copies for an app on
 * the GitHub Pages site, and the one `firebase.json` serves for an app on
 * Firebase Hosting.
 *
 * Preact and synstate-dom apps pass no plugin. Vite's esbuild transform reads
 * `jsx` and `jsxImportSource` from the package's `tsconfig.json`, which already
 * say `react-jsx` and `preact` (or `synstate-dom`), so the build matches what
 * the type check sees.
 * `@vitejs/plugin-react` is here for React's Fast Refresh; the Preact
 * equivalent would pull Babel in, which is not worth it for a dev-server
 * nicety.
 *
 * The dev-server port comes from `app-dev-ports.mts`, keyed by the package
 * directory name, so that this config and the app's Playwright config cannot
 * disagree about it.
 */
export const defineViteAppConfig = ({
  packageRoot,
  framework,
  jsxImportSource,
  base,
  routePaths,
}: Readonly<{
  /** The package's root directory, i.e. the parent of `configs`. */
  packageRoot: string;
  framework: 'preact' | 'react' | 'synstate-dom';
  /**
   * Passed to `@vitejs/plugin-react` so that the build agrees with the
   * package's `tsconfig.json`. Emotion's `css` prop needs
   * `'@emotion/react'`; leave it off where the tsconfig does.
   */
  jsxImportSource?: string;
  /**
   * The path the built site is served under, for an app published to GitHub
   * Pages rather than to a Firebase host of its own. Pages serves this
   * repository at `/mono/`, and `build-pages-site.mts` puts each app in a
   * directory below that, so the asset URLs Vite writes have to carry the
   * whole prefix — the default `/` would ask the browser for
   * `noshiro-pf.github.io/assets/…` and get the user page's 404.
   *
   * Left off by the Firebase-hosted apps, which are served at the root of
   * their own domain.
   */
  base?: string;
  /**
   * The app's screens, as paths below `base` (`/create/`, `/plan/edit/`):
   * the build writes a copy of `index.html` at each, so that GitHub Pages,
   * which has no rewrites, has a page for a direct visit or a reload there.
   * Only the finite set of screens goes here; a dynamic value such as an ID
   * goes in the query string. See `docs/frontend-hosting.md`.
   */
  routePaths?: readonly string[];
}>): UserConfig => {
  // `strictPort` so that a port already taken is an error rather than Vite
  // quietly moving to the next one — the e2e config points at this exact
  // number, and a silent move would leave it waiting on an empty port.
  const port = appDevPort(packageRoot);

  return {
    root: packageRoot,

    ...(base === undefined ? {} : { base }),

    build: {
      outDir: path.resolve(packageRoot, 'build'),
      emptyOutDir: true,
    },

    server: { port, strictPort: true },
    preview: { port, strictPort: true },

    plugins: [
      ...(framework === 'react' ? [viteReact({ jsxImportSource })] : []),
      ...(routePaths === undefined ? [] : [routeEntryPages(routePaths)]),
    ],
  };
};

/**
 * Copies the built `index.html` to `<route>/index.html` under `outDir` for
 * each of `routePaths`.
 *
 * The copies are the page itself: its asset URLs carry `base`, so it loads
 * from any depth, and the app stays one page — it routes with
 * `history.pushState`, and a copy is only what a direct visit or a reload of
 * that path receives, as a server rewrite would serve it.
 */
export const writeRouteEntryPages = (
  outDir: string,
  routePaths: readonly string[],
): void => {
  const indexHtml = path.resolve(outDir, 'index.html');

  for (const route of routePaths) {
    const relative = route.slice(1, -1);

    if (
      relative === '' ||
      !route.startsWith('/') ||
      !route.endsWith('/') ||
      relative.split('/').some((segment) => segment === '' || segment === '..')
    ) {
      throw new Error(
        `routePaths: "${route}" is not a route below the root, like "/create/".`,
      );
    }

    const routeDir = path.resolve(outDir, relative);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(routeDir, { recursive: true });

    fs.copyFileSync(indexHtml, path.resolve(routeDir, 'index.html'));
  }
};

const routeEntryPages = (routePaths: readonly string[]): VitePlugin =>
  ({
    name: 'vite-app-config:route-entry-pages',
    apply: 'build',
    writeBundle: ({ dir }): void => {
      if (dir === undefined) {
        throw new Error(
          'route-entry-pages: the build has no output directory.',
        );
      }

      writeRouteEntryPages(dir, routePaths);
    },
  }) as const;
