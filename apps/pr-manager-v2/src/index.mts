/**
 * What the tests and the demo page import.
 *
 * An app has no consumers, so this is not an entry point in the usual sense: it
 * exists because `import-x/no-internal-modules` allows `../src/index.mjs` and
 * nothing deeper.
 */
export * from './domain/index.mjs';
export * from './github/index.mjs';
export * from './store/index.mjs';
export * from './ui/index.mjs';
