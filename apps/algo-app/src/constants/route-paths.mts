// Imports nothing, because `configs/vite.config.mts` reads it: the config is
// loaded by Node, and importing the route tree from here would make loading it
// need `synstate-router`'s `dist/`.

/**
 * Every page's path but the main one, for the build to write a copy of
 * `index.html` at. `routes.test.mts` checks it against the route tree.
 *
 * Every page is a fixed path, and the room a page is about is a search
 * parameter: GitHub Pages has no rewrites, so it can only answer a path the
 * build has written a page at, and a room ID can be anything. The paths are
 * below the app's base; the router adds it.
 */
export const routePaths: readonly string[] = ['/create/', '/rooms/'] as const;
