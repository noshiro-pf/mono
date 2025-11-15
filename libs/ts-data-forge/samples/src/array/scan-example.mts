// Example: src/array/array-utils.mts (scan)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const changes = [5, -2, 3] as const;

const runningTotals = Arr.scan(changes, (total, change) => total + change, 0);

const runningTotalsFromCurried = Arr.scan(
  (total: number, change: number) => total + change,
  10,
)([-5, 15]);

const expectedTotals = [0, 5, 3, 6] as const;

const expectedCurriedTotals = [10, 5, 20] as const;

assert.deepStrictEqual(runningTotals, expectedTotals);

assert.deepStrictEqual(runningTotalsFromCurried, expectedCurriedTotals);
