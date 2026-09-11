/**
 * What the tests import.
 *
 * An app has no consumers, so this is not an entry point in the usual sense: it
 * exists because `import-x/no-internal-modules` allows `../src/index.mjs` and
 * nothing deeper, and because these three directories are the parts that can be
 * tested without a browser.
 */
export * from './layout/index.mjs';
export * from './shared/index.mjs';
export * from './state/index.mjs';
