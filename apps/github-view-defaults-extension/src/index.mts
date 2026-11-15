/**
 * What the tests import.
 *
 * An app has no consumers, so this is not an entry point in the usual sense: it
 * exists because `import-x/no-internal-modules` allows `../src/index.mjs` and
 * nothing deeper, and because `page-url.mts`, `page-title.mts` and `github/`
 * are the parts that can be tested without a browser. `content.mts`,
 * `pull-request-buttons.mts` and `background.mts` are the other half, and are
 * reached by the manifest rather than by an import.
 */
export * from './github/index.mjs';
export * from './page-title.mjs';
export * from './page-url.mjs';
