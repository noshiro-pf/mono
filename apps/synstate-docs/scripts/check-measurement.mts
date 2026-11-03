import {
  assertEveryLibraryHasAColour,
  recordedEnvironment,
} from './measurement-checks.mjs';

/**
 * The checks of `measurement-checks.mts`, on whatever `src/data` holds — in the
 * benchmark workflow, the measurement it has just taken, before it is uploaded
 * or saved as a baseline. A table that records no environment is an error here,
 * where `gen:benchmark-doc` shows it as dashes: every runner writes one, so a
 * fresh measurement without it is a runner that stopped doing so. Committing
 * such a table is refused by `check:root:synstate-benchmark-runner`.
 */
assertEveryLibraryHasAColour();

if (recordedEnvironment() === undefined) {
  throw new Error(
    '❌ a results file records no environment; every runner writes one (`readBenchmarkEnvironment` in scripts/benchmark/environment.mts)',
  );
}

console.info(
  '✅ the measurement has a colour for every library and one environment',
);
