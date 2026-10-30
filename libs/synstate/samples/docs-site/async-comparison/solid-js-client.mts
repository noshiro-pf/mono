/**
 * Solid's reactive primitives, from the build in which they react under Node:
 * the benchmark's shim, which says why. A browser application imports the same
 * functions from `solid-js`.
 */
// eslint-disable-next-line import-x/no-internal-modules -- one shim for both directories, so that they cannot import different builds.
export * from '../benchmark/solid-js-client.mjs';
