/**
 * Equality Cut-Off Benchmark
 *
 * Measures what a library does with an update whose intermediate value comes
 * out equal to the previous one.
 *
 * Graph topology:
 *   source → bucket ─┬─ view[0] → subscriber
 *                    ├─ view[1] → subscriber
 *                    ...
 *                    └─ view[W-1] → subscriber
 *
 * `bucket` is `Math.floor(source / 1000)`, so it changes on one update in 1000
 * and is equal to its previous value on the rest. `view[i]` is `bucket + i`,
 * each with a subscriber of its own: W readers of one derived flag, as many
 * components read an "is the list empty" flag under a list that changes on
 * every keystroke. The benchmark writes the source K times.
 *
 * Every library here, except the naive RxJS row, compares a derived value and
 * stops at an equal one; what differs is how much of the subgraph below it is
 * visited first. RxJS compares only where `distinctUntilChanged` is written, so
 * it is measured with it and, naively, without it (the "(naive …)" row, which
 * the chart draws dashed).
 */
import { Num } from 'ts-data-forge';
import { selectProductionBuilds } from './production-builds.mjs';
import { runSeriesSweep, scenarioModule } from './series-sweep.mjs';

selectProductionBuilds();

/** K = number of source updates per measurement */
const K = 100_000;

/** View counts to test */
const VIEW_COUNTS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000] as const;

/**
 * What `runBenchmark(k, width)` returns. The last write is k, in bucket
 * b = ⌊k / 1000⌋, so the views hold b, b + 1, …, b + width − 1, which sum to
 * width · b + width (width − 1) / 2. The 1000 and the `b + i` views are the
 * scenarios' own (`06-equality-cut-off.*.mts`), written again here: a scenario
 * that changes them so that the sum moves, at the check's updates or at `K`,
 * fails with the value it got and the one expected.
 */
const expected = (k: number, width: number): number =>
  width * Math.floor(k / 1000) + Num.div(width * (width - 1), 2);

await runSeriesSweep({
  scriptUrl: import.meta.url,
  title: 'Equality Cut-Off',
  workload: `K=${K.toString()} source updates`,
  updates: K,
  points: VIEW_COUNTS,
  pointLabel: (w) => `W=${w.toString()}`,
  entries: [
    { label: '**SynState**', file: '06-equality-cut-off.synstate.mts' },
    { label: 'RxJS', file: '06-equality-cut-off.rxjs.mts' },
    {
      label: 'RxJS (naive, no distinctUntilChanged)',
      file: '06-equality-cut-off.rxjs-naive.mts',
    },
    { label: 'Jotai', file: '06-equality-cut-off.jotai.mts' },
    { label: 'MobX', file: '06-equality-cut-off.mobx.mts' },
    { label: 'Redux', file: '06-equality-cut-off.redux.mts' },
    { label: 'Solid', file: '06-equality-cut-off.solid.mts' },
    { label: 'Preact Signals', file: '06-equality-cut-off.preact-signals.mts' },
  ],
  prepare: scenarioModule(K, { updates: 2500, expected }),
  resultsFile: 'results-equality-cut-off.md',
});
