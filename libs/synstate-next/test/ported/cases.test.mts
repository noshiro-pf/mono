/**
 * Ported from synstate's `test/cases/`: one scenario per operator, driven by
 * counters and timers. synstate ran them on real timers and collected the
 * values until completion; here the timers are fake and the values are those a
 * subscriber saw while the scenario ran. `mapTo` and `pluck` are gone (see
 * DESIGN.md); `withIndex` is the `scan` written out in its case.
 */
import {
  audit,
  combine,
  counter,
  createOwner,
  debounce,
  filter,
  fromPromise,
  map,
  merge,
  mergeMap,
  pairwise,
  scan,
  skip,
  skipIfNoChange,
  skipUntil,
  skipWhile,
  switchMap,
  take,
  takeUntil,
  takeWhile,
  throttle,
  timer,
  withBufferedFrom,
  withCurrentValueFrom,
  withInitialValue,
  zip,
  type Observable,
} from 'synstate-next';
import { isNotUndefined } from 'ts-data-forge';
import { Result } from 'ts-std-forge';
import type { FixedLengthTuple } from 'ts-type-forge';

const tick = 100;

describe(counter, () => {
  test('counter case 1', async () => {
    assert.deepStrictEqual(
      await record(() => counter(tick).pipe(take(10))),
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    );
  });
});

describe(map, () => {
  test('map with an index', async () => {
    assert.deepStrictEqual(
      await record(() =>
        counter(tick)
          .pipe(take(11))
          .pipe(map((x) => x * 2))
          .pipe(withIndex()),
      ),
      [
        [0, 0],
        [1, 2],
        [2, 4],
        [3, 6],
        [4, 8],
        [5, 10],
        [6, 12],
        [7, 14],
        [8, 16],
        [9, 18],
        [10, 20],
      ],
    );
  });

  test('map case 2 and 3: two chains of maps', async () => {
    const quad = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40] as const;

    assert.deepStrictEqual(
      await record(() =>
        counter(tick)
          .pipe(take(11))
          .pipe(withIndex())
          .pipe(map(([, x]) => x * 4)),
      ),
      quad,
    );

    assert.deepStrictEqual(
      await record(() =>
        counter(tick)
          .pipe(take(11))
          .pipe(map((x) => x * 2))
          .pipe(map((x) => x * 2)),
      ),
      quad,
    );
  });
});

describe(filter, () => {
  test('filter case 1', async () => {
    assert.deepStrictEqual(
      await record(() =>
        counter(tick)
          .pipe(take(20))
          .pipe(filter((n) => n % 10 < 5)),
      ),
      [0, 1, 2, 3, 4, 10, 11, 12, 13, 14],
    );
  });
});

describe(combine, () => {
  test('combine case 1: five nodes of one source', async () => {
    assert.deepStrictEqual(
      await record(() => {
        const counter10 = counter(tick).pipe(take(10));

        const square = counter10.pipe(map((x) => x ** 2));

        return combine([
          counter10,
          counter10.pipe(map((x) => x * 2)),
          counter10.pipe(map((x) => x * 2)).pipe(map((x) => x * 2)),
          square,
          square.pipe(filter((x) => x % 2 === 0)),
        ]);
      }),
      [
        [0, 0, 0, 0, 0],
        [1, 2, 4, 1, 0],
        [2, 4, 8, 4, 4],
        [3, 6, 12, 9, 4],
        [4, 8, 16, 16, 16],
        [5, 10, 20, 25, 16],
        [6, 12, 24, 36, 36],
        [7, 14, 28, 49, 36],
        [8, 16, 32, 64, 64],
        [9, 18, 36, 81, 64],
      ],
    );
  });

  test('combine case 2: a diamond', async () => {
    assert.deepStrictEqual(
      await record(() => {
        const counter5 = counter(tick).pipe(take(5));

        return combine([counter5, counter5.pipe(map((x) => 1000 * x))]).pipe(
          map(([a, b]) => a + b),
        );
      }),
      [0, 1001, 2002, 3003, 4004],
    );
  });
});

describe(merge, () => {
  test('merge case 1', async () => {
    assert.deepStrictEqual(
      await record(() => {
        const counter6 = counter(tick).pipe(take(6));

        return merge([
          counter6.pipe(filter((n) => n % 2 === 0)),
          counter6
            .pipe(filter((n) => n % 2 === 1))
            .pipe(map((a) => a.toString())),
        ]);
      }),
      [0, '1', 2, '3', 4, '5'],
    );
  });
});

describe('scan and pairwise', () => {
  test('scan case 1', async () => {
    assert.deepStrictEqual(
      await record(() =>
        counter(tick)
          .pipe(take(10))
          .pipe(scan((acc, curr) => acc + curr, 0)),
      ),
      [0, 0, 1, 3, 6, 10, 15, 21, 28, 36, 45],
    );
  });

  test('pairwise case 1', async () => {
    assert.deepStrictEqual(
      await record(() => counter(tick).pipe(take(6)).pipe(pairwise())),
      [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
      ],
    );
  });

  test('pairwise case 2: after an initial value', async () => {
    assert.deepStrictEqual(
      await record(() =>
        counter(tick).pipe(take(6)).pipe(withInitialValue(-1)).pipe(pairwise()),
      ),
      [
        [-1, 0],
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
      ],
    );
  });
});

describe('take and skip', () => {
  test('take case 1', async () => {
    assert.deepStrictEqual(
      await record(() => counter(tick).pipe(take(10)).pipe(take(5))),
      [0, 1, 2, 3, 4],
    );
  });

  test('skip case 1', async () => {
    assert.deepStrictEqual(
      await record(() => counter(tick).pipe(take(10)).pipe(skip(5))),
      [5, 6, 7, 8, 9],
    );
  });

  test('takeWhile case 1', async () => {
    assert.deepStrictEqual(
      await record(() =>
        counter(tick)
          .pipe(take(10))
          .pipe(takeWhile((i) => i < 5)),
      ),
      [0, 1, 2, 3, 4],
    );
  });

  test('skipWhile case 1', async () => {
    assert.deepStrictEqual(
      await record(() =>
        counter(tick)
          .pipe(take(10))
          .pipe(skipWhile((i) => i < 5)),
      ),
      [5, 6, 7, 8, 9],
    );
  });

  test('takeUntil case 1', async () => {
    assert.deepStrictEqual(
      await record(() =>
        counter(tick * 2)
          .pipe(take(10))
          .pipe(takeUntil(timer(tick * 9))),
      ),
      [0, 1, 2, 3, 4],
    );
  });

  test('skipUntil case 1', async () => {
    assert.deepStrictEqual(
      await record(() =>
        counter(tick * 2)
          .pipe(take(10))
          .pipe(skipUntil(timer(tick * 9))),
      ),
      [5, 6, 7, 8, 9],
    );
  });
});

describe(skipIfNoChange, () => {
  test('skipIfNoChange case 1', async () => {
    assert.deepStrictEqual(
      await record(() => {
        const counter10 = counter(tick).pipe(take(10));

        return counter10
          .pipe(
            map((i) => Math.floor(i / 3), {
              // So that `skipIfNoChange` is what cuts the repeats off.
              equals: () => false,
            }),
          )
          .pipe(skipIfNoChange())
          .pipe(withCurrentValueFrom(counter10));
      }),
      [
        [0, 0],
        [1, 3],
        [2, 6],
        [3, 9],
      ],
    );
  });
});

describe('with…From', () => {
  test('withCurrentValueFrom case 1', async () => {
    assert.deepStrictEqual(
      await record(() => {
        const counter11 = counter(tick).pipe(take(11));

        return counter11.pipe(
          withCurrentValueFrom(counter11.pipe(map((x) => x * 2))),
        );
      }),
      [
        [0, 0],
        [1, 2],
        [2, 4],
        [3, 6],
        [4, 8],
        [5, 10],
        [6, 12],
        [7, 14],
        [8, 16],
        [9, 18],
        [10, 20],
      ],
    );
  });

  test('withBufferedFrom case 1', async () => {
    assert.deepStrictEqual(
      await record(() => {
        const filtered = counter(tick)
          .pipe(take(11))
          .pipe(filter((x) => x % 3 !== 0));

        return counter(tick * 3)
          .pipe(take(5))
          .pipe(withBufferedFrom(filtered));
      }),
      [
        [0, []],
        [1, [1, 2]],
        [2, [4, 5]],
        [3, [7, 8]],
        [4, [10]],
      ],
    );
  });

  test('withInitialValue case 1 and 2', async () => {
    assert.deepStrictEqual(await record(() => withInitialValueCase(false)), [
      [3, 0],
      [4, 0],
      [5, 0],
    ]);

    assert.deepStrictEqual(await record(() => withInitialValueCase(true)), [
      [0, -1],
      [1, -1],
      [2, -1],
      [3, -1],
      [3, 0],
      [4, 0],
      [5, 0],
    ]);
  });
});

describe(zip, () => {
  test('zip case 1', async () => {
    assert.deepStrictEqual(
      await record(() => {
        const counter23 = counter(tick).pipe(take(23));

        return zip([
          counter23.pipe(filter((n) => n % 2 === 0)),
          counter23.pipe(filter((n) => n % 3 === 0)),
        ]);
      }),
      [
        [0, 0],
        [2, 3],
        [4, 6],
        [6, 9],
        [8, 12],
        [10, 15],
        [12, 18],
        [14, 21],
      ],
    );
  });
});

describe(timer, () => {
  test('timer case 1', async () => {
    assert.deepStrictEqual(await record(() => timer(tick * 3)), [0]);
  });

  test('timer case 2', async () => {
    assert.deepStrictEqual(
      await record(() =>
        combine([
          timer(tick * 3),
          timer(tick * 5),
          counter(tick * 2).pipe(take(7)),
        ]),
      ),
      [
        [0, 0, 2],
        [0, 0, 3],
        [0, 0, 4],
        [0, 0, 5],
        [0, 0, 6],
      ],
    );
  });
});

describe('time operators', () => {
  test('audit case 1 and 2', async () => {
    assert.deepStrictEqual(
      await record(() => filteredCounter().pipe(audit(tick * 5))),
      [2, 3, 11, 13],
    );

    assert.deepStrictEqual(
      await record(() => {
        const filtered = filteredCounter();

        return merge([filtered, filtered.pipe(audit(tick * 5))]);
      }),
      [0, 2, 2, 3, 3, 9, 10, 11, 11, 12, 13, 13],
    );
  });

  test('debounce case 1 and 2', async () => {
    assert.deepStrictEqual(
      await record(() => filteredCounter().pipe(debounce(tick * 5))),
      [3, 13],
    );

    assert.deepStrictEqual(
      await record(() => {
        const filtered = filteredCounter();

        return merge([filtered, filtered.pipe(debounce(tick * 5))]);
      }),
      [0, 2, 3, 3, 9, 10, 11, 12, 13, 13],
    );
  });

  test('throttle case 1 and 2', async () => {
    assert.deepStrictEqual(
      await record(() => filteredCounter().pipe(throttle(tick * 5))),
      [0, 3, 9, 12],
    );

    assert.deepStrictEqual(
      await record(() => {
        const filtered = filteredCounter();

        return merge([filtered, filtered.pipe(throttle(tick * 5))]);
      }),
      [0, 2, 3, 9, 10, 11, 12, 13],
    );
  });
});

describe('mergeMap and switchMap', () => {
  const sourceValues: ReadonlySet<number> = new Set<number>([0, 4, 5]);

  const source = (): Observable<number> =>
    counter(tick * 5)
      .pipe(take(8))
      .pipe(filter((n) => sourceValues.has(n)));

  test('mergeMap case 1', async () => {
    assert.deepStrictEqual(
      await record(() => source().pipe(mergeMap(innerCounter))),
      [
        [0, 0],
        [0, 1],
        [0, 2],
        [4, 0],
        [4, 1],
        [5, 0],
        [4, 2],
        [5, 1],
        [5, 2],
      ],
    );
  });

  test('switchMap case 1', async () => {
    assert.deepStrictEqual(
      await record(() => source().pipe(switchMap(innerCounter))),
      [
        [0, 0],
        [0, 1],
        [0, 2],
        [4, 0],
        [4, 1],
        [5, 0],
        [5, 1],
        [5, 2],
      ],
    );
  });
});

describe(fromPromise, () => {
  test('fromPromise case 1', async () => {
    vi.useFakeTimers();

    try {
      const owner = createOwner();

      const seen = owner.run(() =>
        collect(
          fromPromise(
            new Promise<number>((resolve) => {
              setTimeout(() => {
                resolve(1);
              }, tick);
            }),
          ),
        ),
      );

      await vi.advanceTimersByTimeAsync(tick);

      assert.deepStrictEqual(seen, [Result.ok(1)]);

      owner.dispose();
    } finally {
      vi.useRealTimers();
    }
  });
});

/** Every value `observable` gives a subscriber, the current one first. */
const collect = <A,>(observable: Observable<A>): readonly A[] => {
  const mut_seen: A[] = [];

  observable.subscribe((v) => {
    mut_seen.push(v);
  });

  return mut_seen;
};

/** synstate's withInitialValue case 1, or case 2 with `initial`. */
const withInitialValueCase = (
  initial: boolean,
): Observable<FixedLengthTuple<2, number>> => {
  const t = timer(tick * 7);

  const counter6 = counter(tick * 2).pipe(take(6));

  return combine([counter6, initial ? t.pipe(withInitialValue(-1)) : t]);
};

/** synstate's audit, debounce and throttle scenario. */
const filteredCounter = (): Observable<number> => {
  const emitValues: ReadonlySet<number> = new Set<number>([
    0, 2, 3, 9, 10, 11, 12, 13,
  ]);

  return counter(tick * 2)
    .pipe(take(23))
    .pipe(filter((n) => emitValues.has(n)));
};

/** synstate's inner observable for mergeMap and switchMap. */
const innerCounter = (s: number): Observable<FixedLengthTuple<2, number>> =>
  counter(tick * 3)
    .pipe(take(3))
    .pipe(map((x) => [s, x] as const));

/**
 * What a subscriber sees of the observable `build` makes, over a time long
 * enough for every scenario here to run out. Everything is made in an owner of
 * its own, disposed afterwards, which clears the timers left.
 */
const record = async <A,>(
  build: () => Observable<A>,
): Promise<readonly A[]> => {
  vi.useFakeTimers();

  try {
    const owner = createOwner();

    const seen = owner.run(() => collect(build()));

    await vi.advanceTimersByTimeAsync(tick * 100);

    owner.dispose();

    return seen;
  } finally {
    vi.useRealTimers();
  }
};

/** synstate's `withIndex`: each value with its index among them. */
const withIndex =
  <A,>() =>
  (observable: Observable<A>): Observable<readonly [number, A]> =>
    observable
      .pipe(
        scan<A, readonly [number, A] | undefined>(
          (acc, curr) => [acc === undefined ? 0 : acc[0] + 1, curr] as const,
          undefined,
        ),
      )
      .pipe(filter(isNotUndefined));
