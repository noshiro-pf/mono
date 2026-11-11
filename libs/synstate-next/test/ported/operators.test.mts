/**
 * Ported from synstate's operator tests: `map-cut-off`, `keep-equal-parts`,
 * `skip-while`, `take-while`, `with-buffered-from`, `derive`,
 * `debounce-audit-complete`, `audit-throttle-teardown` and
 * `take-until-skip-until-teardown`. Completion is disposal here, and a finished
 * `takeWhile` is one that passes nothing more.
 * `mapTo` and `withIndex` are gone (DESIGN.md).
 */
import {
  audit,
  batch,
  debounce,
  derive,
  just,
  keepEqualParts,
  map,
  skipIfNoChange,
  skipUntil,
  skipWhile,
  source,
  state,
  take,
  takeUntil,
  takeWhile,
  throttle,
  withBufferedFrom,
  type InitializedObservable,
  type Observable,
} from 'synstate-next';
import { toNode } from 'synstate-next/internal';
import { expectType } from 'ts-data-forge';
import { hasKey, isRecord, Optional } from 'ts-std-forge';

describe('map stops a result equal to the one it holds', () => {
  test('a result equal by Object.is is not emitted', () => {
    const a = source<number>();

    const seen = collect(a.pipe(map((x) => x % 2)));

    for (const x of [1, 3, 4, 6, 7]) {
      a.emit(x);
    }

    assert.deepStrictEqual(seen, [1, 0, 1]);
  });

  test('the value computed from an initial value counts as the one held', () => {
    const a = state(1);

    const seen = collect(a.pipe(map((x) => x % 2)));

    a.set(3);

    a.set(4);

    assert.deepStrictEqual(seen, [1, 0]);
  });

  test('a node below is not woken when the result is equal', () => {
    const a = state(1);

    const mut_calls = { count: 0 };

    a.pipe(map((x) => x % 2))
      .pipe(
        map((p) => {
          mut_calls.count += 1;

          return p === 0 ? 'even' : 'odd';
        }),
      )
      .subscribe(() => {});

    const callsAfterSetup = mut_calls.count;

    a.set(3);

    a.set(5);

    assert.strictEqual(mut_calls.count, callsAfterSetup);

    a.set(6);

    assert.strictEqual(mut_calls.count, callsAfterSetup + 1);
  });

  test('a node reading a stopped map and another parent still updates once', () => {
    const a = state(1);

    const seen = collect(
      derive([a, a.pipe(map((x) => x % 2))], (...values) => values).pipe(
        map(([x, p]) => `${x.toString()},${p.toString()}`),
      ),
    );

    a.set(3);

    a.set(4);

    assert.deepStrictEqual(seen, ['1,1', '3,1', '4,0']);
  });

  test('NaN equals NaN, and 0 differs from -0, as Object.is says', () => {
    const a = source<number>();

    const seen = collect(a.pipe(map((x) => x)));

    for (const x of [Number.NaN, Number.NaN, 0, -0]) {
      a.emit(x);
    }

    assert.deepStrictEqual(seen, [Number.NaN, 0, -0]);
  });

  test('`equals` replaces Object.is', () => {
    const a = source<Readonly<{ id: number; name: string }>>();

    const seen = collect(
      a.pipe(
        map((x) => ({ id: x.id }) as const, {
          equals: (p, q) => p.id === q.id,
        }),
      ),
    );

    a.emit({ id: 1, name: 'a' });

    a.emit({ id: 1, name: 'b' });

    a.emit({ id: 2, name: 'b' });

    assert.deepStrictEqual(
      seen.map(({ id }) => id),
      [1, 2],
    );
  });

  test('`equals: () => false` emits every result', () => {
    const click = source<undefined>();

    const seen = collect(click.pipe(map(() => 1, { equals: () => false })));

    click.emit(undefined);

    click.emit(undefined);

    assert.deepStrictEqual(seen, [1, 1]);
  });
});

describe(keepEqualParts, () => {
  type Fetched = Readonly<{
    readAt: number;
    summary: Readonly<{ open: number }>;
    entries: readonly Readonly<{ number: number; title: string }>[];
  }>;

  const entry = (
    number: number,
    title: string,
  ): Readonly<{ number: number; title: string }> =>
    ({ number, title }) as const;

  const report = (readAt: number, entries: Fetched['entries']): Fetched =>
    ({
      readAt,
      summary: { open: entries.length },
      entries,
    }) as const;

  test('passes on nothing when the next value is deeply equal to the last one', () => {
    const r = source<Fetched>();

    const seen = collect(r.pipe(keepEqualParts()));

    r.emit(report(1, [entry(1, 'a')]));

    r.emit(report(1, [entry(1, 'a')]));

    assert.strictEqual(seen.length, 1);
  });

  test('passes on a new root whose unchanged branches are the ones passed on before', () => {
    const r = source<Fetched>();

    const seen = collect(r.pipe(keepEqualParts()));

    r.emit(report(1, [entry(1, 'a'), entry(2, 'b')]));

    r.emit(report(2, [entry(1, 'a'), entry(2, 'b (edited)')]));

    assert.strictEqual(seen.length, 2);

    const [first, second] = seen;

    assert.notStrictEqual(second, first);

    assert.strictEqual(second?.summary, first?.summary);

    assert.strictEqual(second?.entries[0], first?.entries[0]);

    assert.notStrictEqual(second?.entries[1], first?.entries[1]);

    assert.strictEqual(second?.readAt, 2);
  });

  test('matches array items by `key`', () => {
    const r = source<Fetched>();

    const seen = collect(
      r.pipe(
        keepEqualParts({
          key: (item) =>
            isRecord(item) && hasKey(item, 'number') ? item.number : undefined,
        }),
      ),
    );

    r.emit(report(1, [entry(1, 'a')]));

    r.emit(report(1, [entry(0, 'new'), entry(1, 'a')]));

    const [first, second] = seen;

    assert.strictEqual(second?.entries[1], first?.entries[0]);
  });

  test('keeps the initial value of an initialized parent', () => {
    const initial = report(1, []);

    const r = state(initial);

    const kept = r.pipe(keepEqualParts());

    assert.strictEqual(kept.value, initial);

    const seen = collect(kept);

    r.set(report(1, []));

    assert.deepStrictEqual(seen, [initial]);
  });

  test('lets `skipIfNoChange()` stop a part that did not change', () => {
    const r = state(report(1, [entry(1, 'a')]));

    const summaries = collect(
      r
        .pipe(keepEqualParts())
        .pipe(map((held) => held.summary, { equals: () => false }))
        .pipe(skipIfNoChange()),
    );

    r.set(report(2, [entry(1, 'a')]));

    assert.strictEqual(summaries.length, 1);
  });
});

describe(skipWhile, () => {
  // Widened so the predicate is not statically decidable.
  const seed: number = 1;

  test('keeps an initialized parent value the predicate does not skip', () => {
    assert.deepStrictEqual(
      just(seed)
        .pipe(skipWhile((x) => x > 10))
        .getSnapshot(),
      Optional.some(1),
    );
  });

  test('drops an initialized parent value the predicate skips', () => {
    assert.isTrue(
      Optional.isNone(
        just(seed)
          .pipe(skipWhile((x) => x < 10))
          .getSnapshot(),
      ),
    );
  });

  test('passes every later value once the initial value has ended the skipping', () => {
    const s = state(5);

    const seen = collect(s.pipe(skipWhile((x) => x < 3)));

    s.set(1);

    s.set(2);

    assert.deepStrictEqual(seen, [5, 1, 2]);
  });

  test('keeps skipping after an initial value the predicate skips', () => {
    const s = state(1);

    const seen = collect(s.pipe(skipWhile((x) => x < 3)));

    s.set(2);

    s.set(5);

    s.set(1);

    assert.deepStrictEqual(seen, [5, 1]);
  });

  test('asks the predicate no more once the initial value has ended the skipping', () => {
    const s = state(5);

    const mut_calls = { count: 0 };

    s.pipe(
      skipWhile((x) => {
        mut_calls.count += 1;

        return x < 3;
      }),
    ).subscribe(() => {});

    s.set(1);

    s.set(2);

    assert.strictEqual(mut_calls.count, 1);
  });
});

describe(takeWhile, () => {
  test('passes nothing, and leaves its parent, when the initial value fails the predicate', () => {
    const s = state(5);

    const taken = s.pipe(takeWhile((x) => x < 3));

    const seen = collect(taken);

    assert.isFalse(toNode(s).hasObserver);

    s.set(1);

    assert.deepStrictEqual(seen, []);
  });

  test('keeps taking after an initial value that passes the predicate', () => {
    const s = state(1);

    const seen = collect(s.pipe(takeWhile((x) => x < 3)));

    s.set(2);

    assert.isTrue(toNode(s).hasObserver);

    s.set(5);

    assert.isFalse(toNode(s).hasObserver);

    s.set(1);

    assert.deepStrictEqual(seen, [1, 2]);
  });
});

describe('takeUntil and skipUntil leave the notifier', () => {
  test('takeUntil: when it is disposed before the notifier emits', () => {
    const notifier = source<undefined>();

    const result = source<number>().pipe(takeUntil(notifier));

    assert.isTrue(toNode(notifier).hasObserver);

    result.dispose();

    assert.isFalse(toNode(notifier).hasObserver);
  });

  test('takeUntil: when the notifier emits', () => {
    const notifier = source<undefined>();

    const result = source<number>().pipe(takeUntil(notifier));

    notifier.emit(undefined);

    assert.isTrue(toNode(result).settled);

    assert.isFalse(toNode(notifier).hasObserver);
  });

  test('takeUntil: not when a take below it is done', () => {
    const notifier = source<undefined>();

    const num = source<number>();

    const result = num.pipe(takeUntil(notifier));

    const taken = result.pipe(take(1));

    taken.subscribe(() => {});

    num.emit(1);

    assert.isTrue(toNode(taken).settled);

    assert.isFalse(toNode(result).settled);

    assert.isTrue(toNode(notifier).hasObserver);
  });

  test('takeUntil: settled once its source is, the notifier live or not', () => {
    const num = source<number>();

    const result = num.pipe(takeUntil(state(0)));

    num.dispose();

    assert.isTrue(toNode(result).settled);
  });

  test('skipUntil: settled once the notifier is without having emitted', () => {
    const notifier = source<undefined>();

    const result = state(0).pipe(skipUntil(notifier));

    assert.isFalse(toNode(result).settled);

    notifier.dispose();

    assert.isTrue(toNode(result).settled);
  });

  test('skipUntil: not settled by a notifier written and disposed in one batch', () => {
    const notifier = source<undefined>();

    const num = source<number>();

    const seen = collect(num.pipe(skipUntil(notifier)));

    const result = num.pipe(skipUntil(notifier));

    batch(() => {
      notifier.emit(undefined);

      notifier.dispose();

      assert.isFalse(toNode(result).settled);
    });

    assert.isFalse(toNode(result).settled);

    num.emit(1);

    assert.deepStrictEqual(seen, [1]);
  });

  test('skipUntil: not settled by a notifier that emitted and was disposed', () => {
    const notifier = source<undefined>();

    const num = source<number>();

    const result = num.pipe(skipUntil(notifier));

    notifier.emit(undefined);

    notifier.dispose();

    assert.isFalse(toNode(result).settled);

    num.dispose();

    assert.isTrue(toNode(result).settled);
  });

  test('skipUntil: when the notifier emits', () => {
    const notifier = source<undefined>();

    const num = source<number>();

    const seen = collect(num.pipe(skipUntil(notifier)));

    num.emit(1);

    notifier.emit(undefined);

    assert.isFalse(toNode(notifier).hasObserver);

    num.emit(2);

    assert.deepStrictEqual(seen, [2]);
  });

  test('skipUntil: when it is disposed before the notifier emits', () => {
    const notifier = source<undefined>();

    const result = source<number>().pipe(skipUntil(notifier));

    result.dispose();

    assert.isFalse(toNode(notifier).hasObserver);
  });
});

describe(withBufferedFrom, () => {
  test('settled once its source is, what it buffers live or not', () => {
    const num = source<number>();

    const buffered = num.pipe(withBufferedFrom(state(0)));

    assert.isFalse(toNode(buffered).settled);

    num.dispose();

    assert.isTrue(toNode(buffered).settled);
  });

  test('leaves the buffered observable when it is disposed', () => {
    const data = source<string>();

    const result = source<number>().pipe(withBufferedFrom(data));

    assert.isTrue(toNode(data).hasObserver);

    result.dispose();

    assert.isFalse(toNode(data).hasObserver);
  });

  test('keeps buffering while subscribed', () => {
    const data = source<string>();

    const trigger = source<number>();

    const seen = collect(trigger.pipe(withBufferedFrom(data)));

    data.emit('A');

    data.emit('B');

    trigger.emit(1);

    assert.deepStrictEqual(seen, [[1, ['A', 'B']]]);
  });

  test('does not buffer the value the other held before it was created', () => {
    const data = state('x');

    const trigger = state(0);

    const seen = collect(trigger.pipe(withBufferedFrom(data)));

    trigger.set(1);

    trigger.set(2);

    // synstate gave the first value `['x']` (#2767); see DESIGN.md.
    assert.deepStrictEqual(seen, [
      [0, []],
      [1, []],
      [2, []],
    ]);
  });
});

describe(derive, () => {
  test('emits the projection of the latest values, once every parent has one', () => {
    const a = source<number>();

    const b = source<string>();

    const seen = collect(derive([a, b], (x, y) => `${y}${x.toString()}`));

    a.emit(1);

    assert.deepStrictEqual(seen, []);

    b.emit('x');

    a.emit(2);

    b.emit('y');

    assert.deepStrictEqual(seen, ['x1', 'x2', 'y2']);
  });

  test('a diamond updates it once per write', () => {
    const counter = state(0);

    const mut_calls = { count: 0 };

    const seen = collect(
      derive(
        [counter.pipe(map((x) => x * 2)), counter.pipe(map((x) => x * 3))],
        (d, t) => {
          mut_calls.count += 1;

          return d + t;
        },
      ),
    );

    counter.set(1);

    counter.set(2);

    assert.deepStrictEqual(seen, [0, 5, 10]);

    assert.strictEqual(mut_calls.count, 3);
  });

  test('computes the initial value when every parent has one', () => {
    const a = state(1);

    const sum = derive([a, state(2)], (x, y) => x + y);

    assert.strictEqual(sum.value, 3);

    assert.isTrue(
      Optional.isNone(
        derive([a, source<number>()], (x, y) => x + y).getSnapshot(),
      ),
    );
  });

  test('a result equal by Object.is to the one held is not emitted', () => {
    const a = state(1);

    const b = state(2);

    const seen = collect(derive([a, b], (x, y) => (x + y) % 2));

    a.set(3);

    b.set(4);

    a.set(4);

    assert.deepStrictEqual(seen, [1, 0]);
  });

  test('`equals` replaces Object.is', () => {
    const a = source<number>();

    const b = state(2);

    const seen = collect(
      derive([a, b], (x, y) => ({ total: x + y }) as const, {
        equals: (x, y) => x.total === y.total,
      }),
    );

    a.emit(1);

    a.emit(2);

    // A new object with the same total: equal by `equals`, not by Object.is.
    a.emit(2);

    b.set(1);

    b.set(5);

    assert.deepStrictEqual(
      seen.map(({ total }) => total),
      [3, 4, 3, 7],
    );
  });

  test('each emission is an array of its own', () => {
    const a = state(1);

    const b = state(10);

    const seen = collect(derive([a, b], (...values) => values));

    a.set(2);

    b.set(20);

    assert.deepStrictEqual(seen, [
      [1, 10],
      [2, 10],
      [2, 20],
    ]);

    assert.notStrictEqual(seen[0], seen[1]);
  });

  test('types, and the value of initialized parents', () => {
    const s1: Observable<1> = source<1>();

    const s2: InitializedObservable<2> = state<2>(2);

    const _p = derive([s1, s2], (a, b) => {
      expectType<typeof a, 1>('=');

      expectType<typeof b, 2>('=');

      return 'x' as const;
    });

    expectType<typeof _p, Observable<'x'>>('=');

    const q = derive([s2, state<3>(3)], (a, b) => a + b);

    expectType<typeof q, InitializedObservable<number>>('=');

    assert.deepStrictEqual(q.getSnapshot(), Optional.some(5));
  });
});

describe.each([
  ['debounce', debounce],
  ['audit', audit],
] as const)('%s', (_name, operator) => {
  const setup = (): Readonly<{
    s: ReturnType<typeof source<number>>;
    operated: Observable<number>;
    seen: readonly number[];
  }> => {
    useFakeTimers();

    const s = source<number>();

    const operated = s.pipe(operator(100));

    return { s, operated, seen: collect(operated) };
  };

  test('passes on the pending value when its window ends, even after its source is disposed', () => {
    const { s, seen } = setup();

    s.emit(1);

    s.emit(2);

    s.dispose();

    vi.runAllTimers();

    assert.deepStrictEqual(seen, [2]);
  });

  test('drops the pending value when it is disposed', () => {
    const { s, operated, seen } = setup();

    s.emit(1);

    operated.dispose();

    vi.runAllTimers();

    assert.deepStrictEqual(seen, []);

    // Its source is not disposed with it.
    const later = collect(s);

    s.emit(3);

    // The value it holds first.
    assert.deepStrictEqual(later, [1, 3]);
  });
});

describe('disposing before any emission', () => {
  test.each([
    ['audit', audit],
    ['throttle', throttle],
    ['debounce', debounce],
  ] as const)('%s leaves no timer', (_name, operator) => {
    vi.useFakeTimers();

    try {
      const operated = source<number>().pipe(operator(10));

      operated.dispose();

      assert.strictEqual(vi.getTimerCount(), 0);
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

/** Fake timers until the end of the test. */
const useFakeTimers = (): void => {
  vi.useFakeTimers();

  onTestFinished(() => {
    vi.useRealTimers();
  });
};
