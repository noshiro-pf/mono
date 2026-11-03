/**
 * Conditional Fan-Out Benchmark
 *
 * Measures the cost of "oversubscription" in static graphs vs.
 * dynamic dependency tracking.
 *
 * Graph topology:
 *   selector ─┐
 *   branch[0] ─┤
 *   branch[1] ─┼─ select → result
 *   ...        │
 *   branch[B-1]┘
 *
 * Only branch[selector] is "active". The benchmark updates an
 * INACTIVE branch K times and measures propagation cost.
 *
 * - SynState and RxJS with `switchMap` (the "(switchMap)" rows), the way
 *   they write a dynamic dependency: only the selected branch is subscribed,
 *   as in the dynamic graphs below.
 *
 * - The same two written naively, as a static graph (the "(naive …)" rows):
 *   a `derive` / `combineLatest` over every branch fires on every update, the
 *   projection produces the same value, and an equality check prevents
 *   downstream propagation. Cost scales with B (number of branches). These
 *   rows show what holding every branch costs, not how either library is
 *   meant to be used, and the chart draws them dashed.
 *
 * - Dynamic graphs (Jotai, MobX, Solid, Preact Signals): the inactive branch
 *   is not in the dependency set, so updates do not trigger recomputation at
 *   all.
 */
import { selectProductionBuilds } from './production-builds.mjs';
import { runSeriesSweep, scenarioModule } from './series-sweep.mjs';

selectProductionBuilds();

/** K = number of inactive-branch updates per measurement */
const K = 100_000;

/** Branch counts to test */
const BRANCH_COUNTS = [2, 5, 10, 20, 50, 100, 200, 500, 1000] as const;

await runSeriesSweep({
  scriptUrl: import.meta.url,
  title: 'Conditional Fan-Out',
  workload: `K=${K.toString()} inactive-branch updates`,
  updates: K,
  points: BRANCH_COUNTS,
  pointLabel: (b) => `B=${b.toString()}`,
  entries: [
    {
      label: '**SynState** (switchMap)',
      file: '05-conditional-fan-out.synstate-switch-map.mts',
    },
    {
      label: '**SynState** (naive derive)',
      file: '05-conditional-fan-out.synstate.mts',
    },
    {
      label: 'RxJS (switchMap)',
      file: '05-conditional-fan-out.rxjs-switch-map.mts',
    },
    {
      label: 'RxJS (naive combineLatest)',
      file: '05-conditional-fan-out.rxjs.mts',
    },
    { label: 'Jotai', file: '05-conditional-fan-out.jotai.mts' },
    { label: 'MobX', file: '05-conditional-fan-out.mobx.mts' },
    { label: 'Redux', file: '05-conditional-fan-out.redux.mts' },
    { label: 'Solid', file: '05-conditional-fan-out.solid.mts' },
    {
      label: 'Preact Signals',
      file: '05-conditional-fan-out.preact-signals.mts',
    },
  ],
  // Result should be 0: selector=0, active branch=branch[0]=0
  prepare: scenarioModule(K, {
    updates: 3,
    accepts: (result) => Number.isFinite(result),
  }),
  resultsFile: 'results-conditional-fan-out.md',
});
