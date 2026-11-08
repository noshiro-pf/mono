import {
  audit,
  batch,
  counter,
  debounce,
  empty,
  filter,
  fromAbortablePromise,
  fromPromise,
  fromSubscribable,
  just,
  map,
  mergeMap,
  source,
  state,
  switchMap,
  take,
  throttle,
  timer,
  type InitializedObservable,
  type Observable,
} from 'synstate-next';
import { toNode } from 'synstate-next/internal';
import { expectType, Result } from 'ts-std-forge';

describe(switchMap, () => {
  test('follows the latest inner observable and disposes the previous one', () => {
    const which = state<'a' | 'b'>('a');

    const a = state(1);

    const b = state(100);

    const followed = which.pipe(
      switchMap((w) => (w === 'a' ? a : b).pipe(map((x) => x + 1))),
    );

    const mut_seen: number[] = [];

    followed.subscribe((v) => {
      mut_seen.push(v);
    });

    a.set(2);

    which.set('b');

    a.set(3);

    b.set(200);

    assert.deepStrictEqual(mut_seen, [2, 3, 101, 201]);
  });
});

describe(debounce, () => {
  test('emits the latest value once the source has been quiet', () => {
    vi.useFakeTimers();

    try {
      const e = source<number>();

      const quiet = e.pipe(debounce(100));

      const mut_seen: number[] = [];

      quiet.subscribe((v) => {
        mut_seen.push(v);
      });

      e.next(1);

      e.next(2);

      assert.deepStrictEqual(mut_seen, []);

      vi.runAllTimers();

      // Only the last value of the burst.
      assert.deepStrictEqual(mut_seen, [2]);

      e.next(3);

      quiet.dispose();

      vi.runAllTimers();

      // Disposing drops the value still waiting.
      assert.deepStrictEqual(mut_seen, [2]);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('debounce on a state', () => {
  test('holds the value the source holds at the start', () => {
    const a = state(1);

    const quiet = a.pipe(debounce(100));

    expectType<typeof quiet, InitializedObservable<number>>('=');

    assert.strictEqual(quiet.value, 1);
  });
});

describe(throttle, () => {
  test('passes a value at once and drops the rest of its window', async () => {
    vi.useFakeTimers();

    try {
      const e = source<number>();

      const seen = collect(e.pipe(throttle(100)));

      e.next(1);

      e.next(2);

      await vi.advanceTimersByTimeAsync(100);

      e.next(3);

      e.next(4);

      assert.deepStrictEqual(seen, [1, 3]);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe(audit, () => {
  test('passes the latest value at the end of each window', async () => {
    vi.useFakeTimers();

    try {
      const e = source<number>();

      const seen = collect(e.pipe(audit(100)));

      e.next(1);

      e.next(2);

      assert.deepStrictEqual(seen, []);

      await vi.advanceTimersByTimeAsync(100);

      e.next(3);

      await vi.advanceTimersByTimeAsync(100);

      assert.deepStrictEqual(seen, [2, 3]);
    } finally {
      vi.useRealTimers();
    }
  });

  test('disposing it drops the value still waiting', () => {
    vi.useFakeTimers();

    try {
      const e = source<number>();

      const audited = e.pipe(audit(100));

      const seen = collect(audited);

      e.next(1);

      audited.dispose();

      vi.runAllTimers();

      assert.deepStrictEqual(seen, []);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe(mergeMap, () => {
  test('follows every inner observable at once', () => {
    const a = state(1);

    const b = state(10);

    const which = source<'a' | 'b'>();

    const merged = which.pipe(mergeMap((w) => (w === 'a' ? a : b)));

    const seen = collect(merged);

    which.next('a');

    which.next('b');

    a.set(2);

    b.set(20);

    assert.deepStrictEqual(seen, [1, 10, 2, 20]);
  });

  test('lets an inner observable go once it can emit no more', async () => {
    vi.useFakeTimers();

    try {
      const e = source<number>();

      const mut_inners: Observable<number>[] = [];

      const merged = e.pipe(
        mergeMap((x) => {
          const inner = timer(x).pipe(map(() => x));

          mut_inners.push(inner);

          return inner;
        }),
      );

      const seen = collect(merged);

      e.next(200);

      e.next(100);

      await vi.advanceTimersByTimeAsync(150);

      assert.deepStrictEqual(
        mut_inners.map((inner) => toNode(inner).disposed),
        [false, true],
      );

      await vi.advanceTimersByTimeAsync(150);

      assert.deepStrictEqual(seen, [100, 200]);

      assert.isTrue(mut_inners.every((inner) => toNode(inner).disposed));
    } finally {
      vi.useRealTimers();
    }
  });

  test('takes the value of an inner observable that holds one and is done', () => {
    const e = source<number>();

    const mut_inners: Observable<number>[] = [];

    const merged = e.pipe(
      mergeMap((x) => {
        const inner = just(x * 2);

        mut_inners.push(inner);

        return inner;
      }),
    );

    const seen = collect(merged);

    e.next(1);

    e.next(2);

    assert.deepStrictEqual(seen, [2, 4]);

    assert.isTrue(mut_inners.every((inner) => toNode(inner).disposed));
  });

  test('delivers each value of inner observables that emit in the same update', () => {
    const a = state(1);

    const e = source<number>();

    const merged = e.pipe(mergeMap((k) => a.pipe(map((x) => x * k))));

    const seen = collect(merged);

    e.next(10);

    e.next(100);

    a.set(2);

    assert.deepStrictEqual(seen, [10, 100, 20, 200]);
  });

  test('a projection does not overwrite a value its subscribers have yet to see', () => {
    const a = state(1);

    const e = source<number>();

    const merged = e.pipe(mergeMap((k) => a.pipe(map((x) => x * k))));

    const seen = collect(merged);

    e.next(10);

    e.next(100);

    batch(() => {
      a.set(2);

      e.next(1000);
    });

    // The projection joins the update; the inner values follow it.
    assert.deepStrictEqual(seen, [10, 100, 2000, 20, 200]);
  });

  test('an inner value waiting for its round is not overwritten by a projection', () => {
    const a = state(1);

    const e = source<number>();

    const merged = e.pipe(mergeMap((k) => a.pipe(map((x) => x * k))));

    const seen = collect(merged);

    e.next(10);

    e.next(100);

    a.subscribe((x) => {
      if (x === 2) {
        e.next(1);
      }
    });

    a.set(2);

    assert.deepStrictEqual(
      seen.toSorted((p, q) => p - q),
      [2, 10, 20, 100, 200],
    );
  });

  test('the sweep keeps an inner whose last value its follower has yet to read', () => {
    const e = source<number>();

    const mut_box: {
      next?: (value: number) => void;
      complete?: () => void;
    } = {};

    const merged = e.pipe(
      mergeMap((x) =>
        x === 0
          ? fromSubscribable<number>({
              subscribe: (observer) => {
                mut_box.next = observer.next;

                mut_box.complete = observer.complete;

                return { unsubscribe: () => {} };
              },
            })
              .pipe(filter(Result.isOk))
              .pipe(map((r) => r.value))
          : state(x),
      ),
    );

    const seen = collect(merged);

    // Up to one short of the sweep threshold of 8.
    for (const x of [0, 1, 2, 3, 4, 5, 6]) {
      e.next(x);
    }

    batch(() => {
      mut_box.next?.(42);

      mut_box.complete?.();

      // Reaches the threshold and sweeps in the drain that carries 42.
      e.next(7);
    });

    assert.deepStrictEqual(seen, [1, 2, 3, 4, 5, 6, 7, 42]);
  });

  test('lets go an inner observable that is done without emitting', () => {
    const e = source<number>();

    const mut_inners: Observable<number>[] = [];

    const merged = e.pipe(
      mergeMap((x) => {
        // Holds no value and settles while subscribing, so it never emits.
        const inner = fromSubscribable<number>({
          subscribe: (observer) => {
            observer.complete();

            return { unsubscribe: () => {} };
          },
        }).pipe(map(() => x));

        mut_inners.push(inner);

        return inner;
      }),
    );

    collect(merged);

    for (const x of [1, 2, 3]) {
      e.next(x);
    }

    // Each was settled when projected.
    assert.isTrue(mut_inners.every((inner) => toNode(inner).disposed));

    assert.isFalse(toNode(merged).settled);
  });

  test('sweeps away inner observables that settle later without emitting', async () => {
    vi.useFakeTimers();

    try {
      const e = source<number>();

      const mut_inners: Observable<number>[] = [];

      const merged = e.pipe(
        mergeMap((x) => {
          const inner = timer(x).pipe(filter(() => false));

          mut_inners.push(inner);

          return inner;
        }),
      );

      collect(merged);

      // One short of the threshold of 8.
      for (const x of [1, 2, 3, 4, 5, 6, 7]) {
        e.next(x);
      }

      await vi.advanceTimersByTimeAsync(100);

      // Settled, but nothing has asked yet.
      assert.isFalse(mut_inners.some((inner) => toNode(inner).disposed));

      e.next(1000);

      // The projection that reached the threshold swept the settled ones.
      assert.deepStrictEqual(
        mut_inners.map((inner) => toNode(inner).disposed),
        [true, true, true, true, true, true, true, false],
      );
    } finally {
      vi.useRealTimers();
    }
  });

  test('lets go an inner observable that is a finished `take`', () => {
    const a = state(1);

    const e = source<undefined>();

    const merged = e.pipe(mergeMap(() => a.pipe(take(1))));

    collect(merged);

    e.next(undefined);

    // `take(1)` passed the value held and is done: nothing follows `a`.
    assert.isFalse(toNode(a).hasObserver);
  });

  test('disposes the inner observables with itself', () => {
    const a = state(1);

    const e = source<undefined>();

    const merged = e.pipe(mergeMap(() => a.pipe(map((x) => x + 1))));

    e.next(undefined);

    assert.isTrue(toNode(a).hasObserver);

    merged.dispose();

    assert.isFalse(toNode(a).hasObserver);
  });
});

describe(timer, () => {
  test('emits 0 once, after the delay', async () => {
    vi.useFakeTimers();

    try {
      const t = timer(100);

      const seen = collect(t);

      await vi.advanceTimersByTimeAsync(99);

      assert.deepStrictEqual(seen, []);

      await vi.advanceTimersByTimeAsync(1);

      assert.deepStrictEqual(seen, [0]);

      assert.isTrue(toNode(t).settled);
    } finally {
      vi.useRealTimers();
    }
  });

  test('disposing it clears the timer', () => {
    vi.useFakeTimers();

    try {
      const t = timer(100);

      const seen = collect(t);

      t.dispose();

      vi.runAllTimers();

      assert.deepStrictEqual(seen, []);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('counter options', () => {
  test('`times` must be a positive integer or `Infinity`', () => {
    for (const times of [0, -1, 1.5, Number.NaN]) {
      assert.throws(() => counter(100, { times }), RangeError);
    }

    counter(100, { times: Number.POSITIVE_INFINITY }).dispose();

    counter(100, { times: Number.MAX_VALUE }).dispose();
  });
});

describe(counter, () => {
  test('emits 0 right away, then one more each interval', async () => {
    vi.useFakeTimers();

    try {
      const c = counter(100);

      const seen = collect(c);

      await vi.advanceTimersByTimeAsync(0);

      assert.deepStrictEqual(seen, [0]);

      await vi.advanceTimersByTimeAsync(250);

      assert.deepStrictEqual(seen, [0, 1, 2]);

      c.dispose();

      await vi.advanceTimersByTimeAsync(500);

      assert.deepStrictEqual(seen, [0, 1, 2]);
    } finally {
      vi.useRealTimers();
    }
  });

  test('starts at 1 after one interval without the initial 0, and stops after `times`', async () => {
    vi.useFakeTimers();

    try {
      const c = counter(100, { emitInitial: false, times: 2 });

      const seen = collect(c);

      await vi.advanceTimersByTimeAsync(1000);

      assert.deepStrictEqual(seen, [1, 2]);

      assert.isTrue(toNode(c).settled);

      assert.strictEqual(vi.getTimerCount(), 0);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe(fromPromise, () => {
  test('emits the outcome once, as a Result', async () => {
    const ok = fromPromise(Promise.resolve(1));

    const failed = fromPromise<number, string>(Promise.reject(new Error('x')));

    const seenOk = collect(ok);

    const seenErr = collect(failed);

    await Promise.resolve();

    await Promise.resolve();

    assert.deepStrictEqual(seenOk, [Result.ok(1)]);

    assert.strictEqual(seenErr.length, 1);

    assert.isTrue(seenErr.every(Result.isErr));

    assert.isTrue(toNode(ok).settled);
  });
});

describe(fromAbortablePromise, () => {
  test('aborts the request when disposed, and emits nothing for it', async () => {
    const mut_box: { signal?: AbortSignal } = {};

    const request = fromAbortablePromise(
      (signal) =>
        new Promise<number>((_resolve, reject) => {
          mut_box.signal = signal;

          signal.addEventListener('abort', () => {
            reject(new DOMException('aborted', 'AbortError'));
          });
        }),
    );

    const seen = collect(request);

    request.dispose();

    await Promise.resolve();

    assert.isTrue(mut_box.signal?.aborted ?? false);

    assert.deepStrictEqual(seen, []);
  });

  test('a factory that throws emits an `err`', async () => {
    const failure = new Error('no request');

    const request = fromAbortablePromise<number, Error>(() => {
      throw failure;
    });

    const seen = collect(request);

    await Promise.resolve();

    assert.deepStrictEqual(seen, [Result.err(failure)]);
  });

  test('the previous request of a switchMap is aborted', async () => {
    const mut_aborted: string[] = [];

    const query = source<string>();

    const results = query.pipe(
      switchMap((q) =>
        fromAbortablePromise(
          (signal) =>
            new Promise<string>((resolve) => {
              signal.addEventListener('abort', () => {
                mut_aborted.push(q);
              });

              setTimeout(() => {
                resolve(`result for ${q}`);
              }, 0);
            }),
        ),
      ),
    );

    const seen = collect(results);

    query.next('a');

    query.next('b');

    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });

    assert.deepStrictEqual(mut_aborted, ['a']);

    assert.deepStrictEqual(seen, [Result.ok('result for b')]);
  });

  test('disposing after the answer still aborts', async () => {
    const mut_box: { signal?: AbortSignal } = {};

    const request = fromAbortablePromise((signal) => {
      mut_box.signal = signal;

      return Promise.resolve(1);
    });

    const seen = collect(request);

    await Promise.resolve();

    assert.deepStrictEqual(seen, [Result.ok(1)]);

    assert.isFalse(mut_box.signal?.aborted ?? true);

    request.dispose();

    assert.isTrue(mut_box.signal?.aborted ?? false);
  });
});

describe('source written by its own subscriber', () => {
  test('every subscriber sees each value once', () => {
    const s = source<number>();

    const mut_first: number[] = [];

    s.subscribe((v) => {
      mut_first.push(v);

      if (v === 1) {
        s.next(2);
      }
    });

    const second = collect(s);

    s.next(1);

    assert.deepStrictEqual(mut_first, [1, 2]);

    assert.deepStrictEqual(second, [1, 2]);
  });

  test('a value written during the drain comes before one written by an effect later', () => {
    const s = source<string>();

    const t = state(0);

    const seen = collect(s);

    s.subscribe((v) => {
      if (v === 'start') {
        s.next('B');
      }
    });

    // A `map` that writes: the write is deferred until the round's effects ran.
    collect(
      t.pipe(
        map((x) => {
          if (x === 1) {
            s.next('A');
          }

          return x;
        }),
      ),
    );

    batch(() => {
      s.next('start');

      t.set(1);
    });

    assert.deepStrictEqual(seen, ['start', 'A', 'B']);
  });

  test('a subscriber that throws keeps the waiting values and leaves the source working', () => {
    const s = source<number>();

    s.subscribe((v) => {
      if (v === 1) {
        s.next(2);
      }
    });

    s.subscribe((v) => {
      if (v === 1) {
        throw new Error('subscriber failed');
      }
    });

    assert.throws(() => {
      s.next(1);
    }, 'subscriber failed');

    const seen = collect(s);

    s.next(3);

    s.next(4);

    // 2 waited, and was delivered after the exception: it is the value held.
    assert.deepStrictEqual(seen, [2, 3, 4]);
  });
});

describe(fromSubscribable, () => {
  test('wraps each value in a Result and unsubscribes when disposed', () => {
    const mut_box: { next?: (value: number) => void; unsubscribed?: true } = {};

    const wrapped = fromSubscribable<number>({
      subscribe: (observer) => {
        mut_box.next = observer.next;

        return {
          unsubscribe: () => {
            mut_box.unsubscribed = true;
          },
        };
      },
    });

    const seen = collect(wrapped);

    mut_box.next?.(1);

    mut_box.next?.(2);

    assert.deepStrictEqual(seen, [Result.ok(1), Result.ok(2)]);

    wrapped.dispose();

    assert.strictEqual(mut_box.unsubscribed, true);
  });

  test('a value given during subscribe is held from the start', () => {
    const wrapped = fromSubscribable<number>({
      subscribe: (observer) => {
        observer.next(1);

        observer.complete();

        return { unsubscribe: () => {} };
      },
    });

    assert.deepStrictEqual(wrapped.getSnapshot(), Result.ok(1));

    assert.isTrue(toNode(wrapped).settled);
  });

  test('delivers each value given in one batch', () => {
    const mut_box: { next?: (value: number) => void } = {};

    const wrapped = fromSubscribable<number>({
      subscribe: (observer) => {
        mut_box.next = observer.next;

        return { unsubscribe: () => {} };
      },
    });

    const seen = collect(wrapped);

    batch(() => {
      mut_box.next?.(1);

      mut_box.next?.(2);
    });

    assert.deepStrictEqual(seen, [Result.ok(1), Result.ok(2)]);
  });

  test('an error is an `err`, and settles it', () => {
    const mut_box: { error?: (error: unknown) => void } = {};

    const wrapped = fromSubscribable<number, string>({
      subscribe: (observer) => {
        mut_box.error = observer.error;

        return { unsubscribe: () => {} };
      },
    });

    const seen = collect(wrapped);

    mut_box.error?.('failed');

    assert.deepStrictEqual(seen, [Result.err('failed')]);

    assert.isTrue(toNode(wrapped).settled);
  });
});

describe(just, () => {
  test('holds its value and is done', () => {
    const j = just(3);

    expectType<typeof j, InitializedObservable<3>>('=');

    assert.strictEqual(j.value, 3);

    assert.isTrue(toNode(j).settled);
  });
});

describe(empty, () => {
  test('holds nothing and is done', () => {
    const e = empty<number>();

    assert.isFalse(e.hasValue);

    assert.isTrue(toNode(e).settled);
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
