/**
 * Solid's reactive primitives, from the build in which they react under Node.
 *
 * The root export of `solid-js` resolves to its server build under Node's
 * `node` condition. In that build a memo is computed once and an effect never
 * runs, which is what server rendering needs and not what the benchmark
 * measures. The benchmark runs in Node, so the Solid scenarios import the
 * client build, the one a bundler picks for the browser, by its path. A browser
 * application imports the same functions from `solid-js`.
 *
 * The deep chain's Solid adapter (`throughput-adapters/solid-adapter.mts`)
 * imports it too, and `../async-comparison/solid-js-client.mts` re-exports it,
 * so that every Solid sample runs the same build.
 */
// eslint-disable-next-line import-x/no-internal-modules, no-restricted-imports -- the client build has no export condition Node picks; see above.
export * from 'solid-js/dist/solid.js';
