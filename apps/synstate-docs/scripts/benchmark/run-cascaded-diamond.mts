/**
 * Cascaded Diamond Benchmark
 *
 * Measures the exponential O(2^N) blowup of RxJS's combineLatest with cascaded
 * diamond dependencies.
 *
 * Graph topology (N=3):
 *   source → left₁, right₁ → combineLatest₁
 *          → left₂, right₂ → combineLatest₂
 *          → left₃, right₃ → combineLatest₃ → subscriber
 *
 * Each combineLatest doubles the emission count, producing 2^N subscriber calls
 * per source update in RxJS.
 */
import { selectProductionBuilds } from './production-builds.mjs';
import { runSeriesSweep, scenarioModule } from './series-sweep.mjs';

selectProductionBuilds();

/** K = number of source updates per measurement */
const K = 100;

/** Cascade depths to test. RxJS fires 2^N times per update. */
const DEPTHS = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20] as const;

await runSeriesSweep({
  scriptUrl: import.meta.url,
  title: 'Cascaded Diamond',
  workload: `K=${K.toString()} updates`,
  updates: K,
  points: DEPTHS,
  pointLabel: (d) => `N=${d.toString()}`,
  entries: [
    { label: '**SynState**', file: '04-cascaded-diamond.synstate.mts' },
    { label: 'RxJS', file: '04-cascaded-diamond.rxjs.mts' },
    { label: 'Jotai', file: '04-cascaded-diamond.jotai.mts' },
    { label: 'MobX', file: '04-cascaded-diamond.mobx.mts' },
    { label: 'Redux', file: '04-cascaded-diamond.redux.mts' },
    { label: 'Solid', file: '04-cascaded-diamond.solid.mts' },
    {
      label: 'Preact Signals',
      file: '04-cascaded-diamond.preact-signals.mts',
    },
  ],
  prepare: scenarioModule(K, {
    updates: 3,
    // Each stage maps x to (x + 1) + (x + 2) = 2x + 3, so after the source's
    // last write k, N stages give 2^N (k + 3) − 3: about 1.1e8 at K=100, N=20.
    // Every stage's value is below the last, so the result being a safe
    // integer, which `scenarioModule` checks, keeps them all exact; the product
    // 2^N (k + 3) is a power of two times a small integer, exact as well.
    expected: (k, depth) => 2 ** depth * (k + 3) - 3,
  }),
  resultsFile: 'results-cascaded-diamond.md',
});
