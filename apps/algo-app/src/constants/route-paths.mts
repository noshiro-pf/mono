// Imports nothing, because `configs/vite.config.mts` reads it: the config is
// loaded by Node, which cannot import a workspace package that ships only its
// `.mts` source, such as `tiny-router-observable`.

export const routes = {
  main: '/',
  createRoom: '/create',
  rooms: '/rooms',
} as const;

/**
 * Every page's path, for the build to write a copy of `index.html` at.
 *
 * Every page is a fixed path, and the room a page is about is a query
 * parameter: GitHub Pages has no rewrites, so it can only answer a path the
 * build has written a page at, and a room ID can be anything. The paths are
 * below the app's base; the router adds it.
 */
export const routePaths: readonly string[] = [
  `${routes.createRoom}/`,
  `${routes.rooms}/`,
] as const;
