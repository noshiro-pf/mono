// Imports nothing, because `configs/vite.config.mts` reads it: the config is
// loaded by Node, and importing the route tree from here would make loading it
// need `synstate-router`'s `dist/`.

/**
 * Each tab's path below the app's base, in the order the tabs are drawn, for
 * the build to write a copy of `index.html` at. `e2e/main-page.spec.mts` opens
 * each and checks that the router shows its tab, which checks the list against
 * the route tree in `tabs.mts`.
 */
export const routePaths: readonly string[] = [
  '/career/',
  '/biography/',
  '/skills/',
  '/products/',
  '/writings/',
] as const;
