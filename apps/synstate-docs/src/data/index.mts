/**
 * The committed measurements, written by
 * `pnpm --filter @synstate/docs run benchmark`.
 *
 * A barrel because the readers are elsewhere in the package — the chart
 * components under `src/components/`, the prose numbers under `scripts/` — and
 * `import-x/no-internal-modules` allows `../../<dir>/index.mjs` while
 * forbidding a reach at a file inside it. Each reader still applies its own
 * type to what it takes: the JSON's inferred type is the literal contents of
 * whatever run wrote it, which is not a shape anything should be written
 * against.
 */

export { default as cascadedDiamond } from './results-cascaded-diamond.json' with { type: 'json' };
export { default as conditionalFanOut } from './results-conditional-fan-out.json' with { type: 'json' };
export { default as deepChain } from './results-deep-chain.json' with { type: 'json' };
export { default as diamond } from './results-diamond.json' with { type: 'json' };
export { default as derivedChain } from './results.json' with { type: 'json' };
