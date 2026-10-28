import * as path from 'node:path';

/**
 * The apps published as part of the GitHub Pages site, by package directory
 * name, which is also the directory each one is served from.
 *
 * Two places need this and they must not disagree: Vite writes the asset URLs
 * at build time from `base`, and `build-pages-site.mts` decides where the
 * files land. A mismatch is a page that loads and then asks for its script at
 * a path nothing serves — a blank screen with a 404 in the console and no
 * failing check anywhere, since both halves did exactly what they were told.
 *
 * The site directory is the package directory, not a second name kept beside
 * it, so renaming an app's directory moves its URL.
 */
const pagesApps: readonly string[] = [
  'annotation-tool',
  'cant-stop-probability',
  'catan-dice',
  'color-demo',
  'housing-loan-calculator',
  'lambda-calculus-interpreter-preact',
  'lambda-calculus-interpreter-react',
  'life-plan-simulator',
  'pr-manager',
  'profile',
  'task-manager',
];

/**
 * The repository's Pages site is a project site, so everything it serves is
 * under the repository name rather than at the domain root.
 */
export const PAGES_SITE_ROOT = '/mono/';

/** The host the Pages site is served from. */
export const PAGES_SITE_ORIGIN = 'https://noshiro-pf.github.io';

/**
 * Where the reveal.js decks under `docs/reveal-slides/` are served from, each
 * in a directory of its own name below this one.
 */
export const PAGES_SLIDES_DIR = 'slides';

/** Where the app rooted at `packageRoot` is served from, e.g. `pr-manager`. */
export const pagesAppDir = (packageRoot: string): string => {
  const name = path.basename(packageRoot);

  // Written before the `includes` guard: under the strict standard library
  // `includes` is a type predicate that also narrows when it is false, so
  // `name` would read as `never` inside the branch.
  const notPublished = `pagesAppDir: "${name}" is not published to Pages. Add it to tools/configs/pages-apps.mts.`;

  if (!pagesApps.includes(name)) {
    throw new Error(notPublished);
  }

  return name;
};

/** The same, as the URL prefix Vite writes into the built `index.html`. */
export const pagesAppBase = (packageRoot: string): string =>
  `${PAGES_SITE_ROOT}${pagesAppDir(packageRoot)}/`;

/** The same, as the whole URL a page is reached at, e.g. for `og:url`. */
export const pagesAppUrl = (packageRoot: string): string =>
  `${PAGES_SITE_ORIGIN}${pagesAppBase(packageRoot)}`;

/** The directory name of every published app, under `apps/` and the site. */
export const pagesAppDirs = (): readonly string[] => pagesApps;
