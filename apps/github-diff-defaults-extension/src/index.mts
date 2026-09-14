/**
 * What the tests import.
 *
 * An app has no consumers, so this is not an entry point in the usual sense: it
 * exists because `import-x/no-internal-modules` allows `../src/index.mjs` and
 * nothing deeper, and because `diff-url.mts` is the part that can be tested
 * without a browser. `content.mts` is the other half, and is reached by the
 * manifest rather than by an import.
 */
export * from './diff-url.mjs';
