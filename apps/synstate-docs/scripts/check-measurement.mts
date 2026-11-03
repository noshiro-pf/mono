import {
  assertEveryLibraryHasAColour,
  recordedEnvironment,
} from './measurement-checks.mjs';

/**
 * The checks of `measurement-checks.mts`, on whatever `src/data` holds — in the
 * benchmark workflow, the measurement it has just taken, before it is uploaded
 * or saved as a baseline. Committing a table measured locally is refused by
 * `check:root:synstate-benchmark-runner`.
 */
assertEveryLibraryHasAColour();

recordedEnvironment();

console.info(
  '✅ the measurement has a colour for every library and one environment',
);
