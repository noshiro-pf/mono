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
 * `apps/synstate-docs/src/components/throughput-demo/adapters/solid-js-client.mts` is the same
 * module for the other half of the benchmark, and the two must import the same
 * build. `../async-comparison/solid-js-client.mts` re-exports this one.
 */
// eslint-disable-next-line import-x/no-internal-modules, import-x/extensions, no-restricted-imports -- the client build has no export condition Node picks; see above.
export * from 'solid-js/dist/solid.js';
