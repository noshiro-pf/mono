import { STATS_RUNS_PER_ROW } from './benchmark/time-entry.mjs';
import { formatRatio, miscountedRow } from './embed-benchmark.mjs';

describe(formatRatio, () => {
  test('one decimal from 0.1 to 10, whole numbers above', () => {
    assert.strictEqual(formatRatio(0.5, false), '0.5×');

    assert.strictEqual(formatRatio(2.34, false), '2.3×');

    assert.strictEqual(formatRatio(12.4, false), '12×');

    assert.strictEqual(formatRatio(1234, false), '1,234×');
  });

  test('one significant figure below 0.1, never in exponent notation', () => {
    assert.strictEqual(formatRatio(0.05, false), '0.05×');

    assert.strictEqual(formatRatio(0.0123, false), '0.01×');

    assert.strictEqual(formatRatio(1.2e-7, false), '0.0000001×');
  });

  test('marks a ratio whose dividend timed out', () => {
    assert.strictEqual(formatRatio(3, true), '> 3.0×');
  });
});

/** A `stats` result whose rows were measured `counts` times. */
const stats = (counts: readonly number[]) =>
  ({
    kind: 'stats',
    rows: counts.map((count, i) => ({
      label: `library ${i.toString()}`,
      times: Array.from({ length: count }, () => 1),
    })),
  }) as const;

describe(miscountedRow, () => {
  test('passes rows measured ROUNDS × STATS_RUNS times', () => {
    assert.isUndefined(
      miscountedRow(stats([STATS_RUNS_PER_ROW, STATS_RUNS_PER_ROW])),
    );
  });

  test('names the first row measured another number of times', () => {
    assert.strictEqual(
      miscountedRow(stats([STATS_RUNS_PER_ROW, STATS_RUNS_PER_ROW - 20, 1]))
        ?.label,
      'library 1',
    );
  });

  test('leaves sweeps alone', () => {
    assert.isUndefined(
      miscountedRow({
        kind: 'series',
        xLabels: ['a'],
        rows: [{ label: 'x', values: [1] }],
      }),
    );
  });
});
