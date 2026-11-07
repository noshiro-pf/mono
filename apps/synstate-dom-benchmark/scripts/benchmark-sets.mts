import { keyIsIn } from 'ts-data-forge';

/**
 * The sets of libraries a run can measure, chosen by `BENCHMARK_SET`: every one
 * but synstate-dom-next, or synstate-dom, synstate-dom-next (the rebuild that
 * is to replace it) and Solid. The run writes a set's results to the file the
 * Vitest config, which reads this, names, and `repeat-benchmark.mts` reads them
 * back from the same file.
 */
export const benchmarkSets = {
  all: {
    script: 'benchmark',
    results: 'RESULTS.md',
    title: '# Results',
  },
  next: {
    script: 'benchmark:next',
    results: 'RESULTS-NEXT.md',
    title: '# Results: synstate-dom-next',
  },
} as const;

export type BenchmarkSet = keyof typeof benchmarkSets;

/** The set `BENCHMARK_SET` names; every library when it names none. */
export const benchmarkSetOf = (name: string | undefined): BenchmarkSet => {
  if (name === undefined) {
    return 'all';
  }

  if (!keyIsIn(name, benchmarkSets)) {
    throw new Error(`BENCHMARK_SET names no set: ${name}`);
  }

  return name;
};
