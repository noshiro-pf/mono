import * as path from 'node:path';
import { hasKey, isRecord } from 'ts-data-forge';
import { type FixedLengthTuple } from 'ts-type-forge';

/**
 * The apps published as part of the GitHub Pages site, and the directory each
 * one is served from.
 *
 * Two places need this and they must not disagree: Vite writes the asset URLs
 * at build time from `base`, and `build-pages-site.mts` decides where the
 * files land. A mismatch is a page that loads and then asks for its script at
 * a path nothing serves — a blank screen with a 404 in the console and no
 * failing check anywhere, since both halves did exactly what they were told.
 *
 * Keyed by the package's directory name, in the same way and for the same
 * reason as `app-dev-ports.mts`.
 */
const pagesApps = {
  'pr-manager-app': 'pr-manager',
} as const;

/**
 * The repository's Pages site is a project site, so everything it serves is
 * under the repository name rather than at the domain root.
 */
export const PAGES_SITE_ROOT = '/mono/';

/** Where the app rooted at `packageRoot` is served from, e.g. `pr-manager`. */
export const pagesAppDir = (packageRoot: string): string => {
  const name = path.basename(packageRoot);

  if (!(isRecord(pagesApps) && hasKey(pagesApps, name))) {
    throw new Error(
      `pagesAppDir: "${name}" is not published to Pages. Add it to tools/configs/pages-apps.mts.`,
    );
  }

  return pagesApps[name as keyof typeof pagesApps];
};

/** The same, as the URL prefix Vite writes into the built `index.html`. */
export const pagesAppBase = (packageRoot: string): string =>
  `${PAGES_SITE_ROOT}${pagesAppDir(packageRoot)}/`;

/** Every published app, as `[package directory, site directory]` pairs. */
export const pagesAppEntries = (): readonly FixedLengthTuple<2, string>[] =>
  Object.entries(pagesApps);
