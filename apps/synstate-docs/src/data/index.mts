/**
 * The committed measurements: a baseline `synstate-benchmark.yml` measured on
 * its pinned runner, committed from its artifact. The workflow fails on `main`
 * once a later baseline has drifted from them beyond run-to-run noise, or
 * measures a library or point they lack or no longer has one they show
 * (`scripts/benchmark/check-drift.mts`).
 * `pnpm --filter @synstate/docs run benchmark` writes the same files locally.
 * Beside them, hand-written, the colour each chart draws a results label in
 * (`library-colors.mts`), which the charts and `gen:benchmark-doc` share, and
 * which labels the charts draw dashed; and how both write a measurement
 * (`format-ms.mts`).
 *
 * `bundle-size-comparison.json` is measured apart from the benchmark, by
 * `pnpm run bundle-size`, and no workflow re-measures it. Only
 * `scripts/embed-bundle-size.mts` reads it, so it is not exported here.
 *
 * A barrel because the readers are elsewhere in the package — the chart
 * components under `src/components/`, the prose numbers under `scripts/` — and
 * `import-x/no-internal-modules` allows `../../<dir>/index.mjs` while
 * forbidding a reach at a file inside it. Each reader still applies its own
 * type to what it takes: the JSON's inferred type is the literal contents of
 * whatever run wrote it, which is not a shape anything should be written
 * against.
 */

export { MS_TENTHS_BELOW, formatCount, formatMs } from './format-ms.mjs';
export { isNaiveForm, libraryColorOf } from './library-colors.mjs';
export { default as cascadedDiamond } from './results-cascaded-diamond.json' with { type: 'json' };
export { default as conditionalFanOut } from './results-conditional-fan-out.json' with { type: 'json' };
export { default as deepChain } from './results-deep-chain.json' with { type: 'json' };
export { default as diamond } from './results-diamond.json' with { type: 'json' };
export { default as equalityCutOff } from './results-equality-cut-off.json' with { type: 'json' };
export { default as singleState } from './results-single-state.json' with { type: 'json' };
export { default as derivedChain } from './results.json' with { type: 'json' };
