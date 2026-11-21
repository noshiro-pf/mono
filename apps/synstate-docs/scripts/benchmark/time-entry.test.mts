import {
  deepChainCovers,
  deepChainLabels,
  measurePoints,
  medianOverRounds,
  TIMEOUT_MS,
} from './time-entry.mjs';

const entry = { label: 'test', file: 'test.mts' } as const;

const quiet = (): void => {
  vi.spyOn(console, 'info').mockImplementation(() => {});
};

describe(measurePoints, () => {
  test('a timeout ends the sweep: later points are not run', () => {
    quiet();

    const mut_prepared: number[] = [];

    const result = measurePoints(entry, ['a', 'b', 'c'], (index) => {
      mut_prepared.push(index);

      return () => (index === 1 ? TIMEOUT_MS + 1 : 10);
    });

    assert.deepStrictEqual(result, {
      kind: 'series',
      xLabels: ['a', 'b', 'c'],
      values: [10, null, null],
    });

    assert.deepStrictEqual(mut_prepared, [0, 1]);
  });

  test('in the deep chain, a timeout skips only points at least as large in both K and M', () => {
    quiet();

    const timedOut = deepChainLabels.indexOf('K=1000, M=50');

    const mut_prepared: string[] = [];

    const result = measurePoints(
      entry,
      deepChainLabels,
      (index) => {
        mut_prepared.push(deepChainLabels[index] ?? '');

        return () => (index === timedOut ? TIMEOUT_MS + 1 : 10);
      },
      deepChainCovers,
    );

    assert.deepStrictEqual(
      deepChainLabels.filter(
        (_, index) => result.kind === 'series' && result.values[index] === null,
      ),
      ['K=1000, M=50', 'K=1000, M=100', 'K=1000, M=200'],
    );

    assert.isTrue(mut_prepared.includes('K=100, M=100'));

    assert.isFalse(mut_prepared.includes('K=1000, M=100'));
  });

  test('a slow warm-up does not time a point out', () => {
    quiet();

    let mut_calls = 0;

    // The first call is the first warm-up.
    const run = (): number => {
      mut_calls += 1;

      return mut_calls === 1 ? TIMEOUT_MS + 1 : 10;
    };

    const result = measurePoints(entry, ['a'], () => run);

    assert.deepStrictEqual(result.kind === 'series' ? result.values : [], [10]);
  });
});

describe(medianOverRounds, () => {
  test('a point times out when most rounds did not finish it', () => {
    assert.deepStrictEqual(
      medianOverRounds([
        [1, 2, 3],
        [1, null, null],
        [1, 4, null],
      ]),
      [1, 4, null],
    );
  });

  test('with an even number of rounds, the two middle times are averaged', () => {
    assert.deepStrictEqual(medianOverRounds([[1], [2], [3], [4]]), [2.5]);
  });

  test('with an even number of rounds, half of them unfinished is not a timeout', () => {
    assert.deepStrictEqual(
      medianOverRounds([
        [1, 2],
        [3, null],
      ]),
      [2, 2],
    );
  });

  test('a round shorter than the first does not cut the others short', () => {
    assert.deepStrictEqual(medianOverRounds([[1], [1, 2], [1, 2]]), [1, 2]);
  });
});
