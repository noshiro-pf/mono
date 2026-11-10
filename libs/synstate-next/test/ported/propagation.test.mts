/**
 * Ported from synstate's propagation tests: `propagation-order`,
 * `unobserved-write`, `update-loop`, `write-during-propagation`,
 * `graph-structure`, the valid graphs of `circular-dependency`, and the
 * `dispose` cases of `complete-propagation` and `remove-completed`.
 *
 * Subscribers run after an update has settled, and a write made by one starts
 * the next round (DESIGN.md), so the cases that wrote from inside an update see
 * whole rounds here, and synstate's warning for such a write is gone with the
 * nesting it warned of.
 */
import {
  debounce,
  derive,
  map,
  merge,
  state,
  switchMap,
  throttle,
  withBufferedFrom,
  withCurrentValueFrom,
  type Observable,
} from 'synstate-next';
import { toNode } from 'synstate-next/internal';
import { Optional } from 'ts-std-forge';

describe('the nodes an update visits', () => {
  test('a write made by a subscriber is a round of its own, after the one that reached it', () => {
    const a = state(0);

    const other = state(0);

    const seen = collect(
      derive(
        [a.pipe(map((x) => x)), a.pipe(map((x) => x)), other],
        (...values) => values,
      ),
    );

    a.pipe(map((x) => x)).subscribe((x) => {
      if (x === 1) {
        other.set(1);
      }
    });

    a.set(1);

    // synstate nested the second update inside the first and passed on
    // `[1, 1, 1]` twice.
    assert.deepStrictEqual(seen, [
      [0, 0, 0],
      [1, 1, 0],
      [1, 1, 1],
    ]);
  });

  test('a node a subscriber creates starts from the settled graph', () => {
    const count = state(0);

    const late = count.pipe(map((x) => x)).pipe(map((x) => x));

    const mut_received: number[] = [];

    const mut_created = { done: false };

    count.pipe(map((x) => x)).subscribe((x) => {
      if (x !== 1 || mut_created.done) {
        return;
      }

      mut_created.done = true;

      late.pipe(map((y) => y * 10)).subscribe((v) => {
        mut_received.push(v);
      });
    });

    count.set(1);

    count.set(2);

    // synstate gave it `late`'s value from before the update, then the new one.
    assert.deepStrictEqual(mut_received, [10, 20]);
  });

  test.each([1, 3])(
    'a node of depth %i a subscriber creates is not computed again by the update that ran it',
    (depth) => {
      const count = state(0);

      const mut_calls = { count: 0 };

      const countCall = (x: number): number => {
        mut_calls.count += 1;

        return x;
      };

      const mut_created = { done: false };

      count.subscribe((x) => {
        if (x !== 1 || mut_created.done) {
          return;
        }

        mut_created.done = true;

        const parent =
          depth === 1
            ? count
            : count.pipe(map((y) => y + 0)).pipe(map((y) => y + 0));

        parent.pipe(map(countCall)).subscribe(() => {});
      });

      count.pipe(map((x) => x)).subscribe(() => {});

      count.set(1);

      // Once, for the value it was created with.
      assert.strictEqual(mut_calls.count, 1);

      count.set(2);

      assert.strictEqual(mut_calls.count, 2);
    },
  );

  test('a node disposed while an update propagates is not visited by it', () => {
    const count = state(0);

    const mut_calls = { count: 0 };

    const late = count.pipe(map((x) => x + 1)).pipe(
      map((x) => {
        mut_calls.count += 1;

        return x;
      }),
    );

    late.subscribe(() => {});

    // Depth 1, so the drain reaches it before `late`.
    count
      .pipe(
        map((x) => {
          if (x === 1) {
            late.dispose();
          }

          return x;
        }),
      )
      .subscribe(() => {});

    mut_calls.count = 0;

    count.set(1);

    assert.strictEqual(mut_calls.count, 0);
  });

  test('descendants that skip depths are updated in order', () => {
    const a = state(0);

    const b = state(10);

    const seen = collect(
      derive(
        [a, b.pipe(map((x) => x)).pipe(map((x) => x))],
        (...values) => values,
      ).pipe(map(([x, y]) => x + y)),
    );

    a.set(1);

    a.set(2);

    assert.deepStrictEqual(seen, [10, 11, 12]);
  });
});

describe('the depth of a node', () => {
  test('is one more than its deepest parent', () => {
    const s = state(0);

    const double = s.pipe(map((x) => x * 2));

    const quad = s.pipe(map((x) => x * 2)).pipe(map((x) => x * 2));

    assert.deepStrictEqual(
      [s, double, quad, derive([s, double, quad], (...values) => values)].map(
        depthOf,
      ),
      [0, 1, 2, 3],
    );

    assert.strictEqual(depthOf(double.pipe(withCurrentValueFrom(s))), 2);

    assert.strictEqual(
      depthOf(
        double.pipe(withCurrentValueFrom(s)).pipe(withCurrentValueFrom(quad)),
      ),
      3,
    );
  });
});

describe('graphs that are not cycles', () => {
  test('a diamond, a chain, and several roots converging', () => {
    const a = state(1);

    const b = state(2);

    const left = a.pipe(map((x) => x + 1));

    const right = a.pipe(map((x) => x * 2));

    const chain = left.pipe(map((x) => x + 1)).pipe(map((x) => x + 1));

    const seen = collect(
      derive([left, right, chain, b], (l, r, c, y) => l + r + c + y),
    );

    const merged = collect(merge([left, b]));

    a.set(2);

    b.set(3);

    assert.deepStrictEqual(seen, [10, 14, 15]);

    assert.deepStrictEqual(merged, [3, 3]);
  });
});

describe('a write nothing observes', () => {
  test('is held, and a later subscriber receives the last one', () => {
    const s = state(0);

    s.set(1);

    s.set(2);

    assert.deepStrictEqual(collect(s), [2]);
  });

  test('is held after the last subscriber leaves', () => {
    const s = state(0);

    const unsubscribe = s.subscribe(() => {});

    unsubscribe();

    s.set(5);

    assert.deepStrictEqual(collect(s), [5]);
  });

  test('is where a child created later starts, and later writes reach it', () => {
    const s = state(0);

    s.set(3);

    const seen = collect(s.pipe(map((x) => x * 10)));

    s.set(4);

    assert.deepStrictEqual(seen, [30, 40]);
  });

  test('is not taken for an emission of an update another parent starts', () => {
    const a = state(0);

    const b = state(0);

    a.set(5);

    const merged = collect(merge([a, b]));

    const derived = collect(derive([a, b], (x, y) => [x, y] as const));

    b.set(1);

    a.set(6);

    // `merge` passes on the parent that emitted in each update, never the value
    // `a` was given while nothing observed it.
    assert.deepStrictEqual(merged, [1, 6]);

    assert.deepStrictEqual(derived, [
      [5, 0],
      [5, 1],
      [6, 1],
    ]);
  });

  test('by a debounce with no observer is held, as a root write is', () => {
    vi.useFakeTimers();

    try {
      const s = state(0);

      const debounced = s.pipe(debounce(100));

      const unsubscribe = debounced.subscribe(() => {});

      unsubscribe();

      s.set(1);

      vi.runAllTimers();

      const seen = collect(debounced);

      s.set(2);

      vi.runAllTimers();

      assert.deepStrictEqual(seen, [1, 2]);
    } finally {
      vi.useRealTimers();
    }
  });

  test('by a switchMap inner after the switchMap lost its observers is held', () => {
    const selector = state(0);

    const branch = state(10);

    const switched = selector.pipe(switchMap(() => branch));

    const unsubscribe = switched.subscribe(() => {});

    selector.set(1);

    unsubscribe();

    branch.set(11);

    const seen = collect(switched.pipe(map((x) => x * 2)));

    branch.set(12);

    assert.deepStrictEqual(seen, [22, 24]);
  });
});

describe('an update that keeps starting another', () => {
  const loop = /more than 100 updates in a row/u;

  test('a subscriber that writes back to its own state is stopped with an error', () => {
    const a = state(0);

    a.subscribe((x) => {
      if (x > 0) {
        a.set(x + 1);
      }
    });

    assert.throws(() => {
      a.set(1);
    }, loop);
  });

  test('two subscribers writing to each other’s states are stopped the same way', () => {
    const a = state(0);

    const b = state(0);

    a.subscribe((x) => {
      if (x > 0) {
        b.set(x + 1);
      }
    });

    b.subscribe((y) => {
      if (y > 0) {
        a.set(y + 1);
      }
    });

    assert.throws(() => {
      a.set(1);
    }, loop);
  });

  test('updates work as before once the loop has thrown', () => {
    const a = state(0);

    a.subscribe((x) => {
      if (x > 0) {
        a.set(x + 1);
      }
    });

    assert.throws(() => {
      a.set(1);
    }, loop);

    const b = state(0);

    const seen = collect(b.pipe(map((x) => x * 10)));

    b.set(1);

    b.set(2);

    assert.deepStrictEqual(seen, [0, 10, 20]);
  });

  test('writes that converge may go on up to the limit', () => {
    const a = state(0);

    a.subscribe((x) => {
      if (0 < x && x < 50) {
        a.set(x + 1);
      }
    });

    a.set(1);

    assert.strictEqual(a.value, 50);
  });
});

describe('a write made by a subscriber', () => {
  test('reaches the other nodes in a round of its own, with no mix of old and new', () => {
    const a = state(0);

    const b = state(0);

    const doubled = a.pipe(map((x) => x * 10));

    a.subscribe((x) => {
      b.set(x * 2);
    });

    const seen = collect(derive([doubled, b], (...values) => values));

    a.set(1);

    // synstate propagated `b` inside the update of `a` and passed on the mix
    // `[0, 2]`.
    assert.deepStrictEqual(seen, [
      [0, 0],
      [10, 0],
      [10, 2],
    ]);
  });

  test('a subscriber that throws leaves the next write working', () => {
    const a = state(0);

    a.subscribe((x) => {
      if (x > 0) {
        throw new Error('boom');
      }
    });

    assert.throws(() => {
      a.set(1);
    }, /boom/u);

    const b = state(0);

    const seen = collect(b);

    b.set(1);

    assert.deepStrictEqual(seen, [0, 1]);
  });

  test('withBufferedFrom keeps a value written to the buffered observable for the next one', () => {
    const data = state('a');

    const trigger = state(0);

    const mut_seen: (readonly [number, readonly string[]])[] = [];

    trigger.pipe(withBufferedFrom(data)).subscribe((v) => {
      mut_seen.push(v);

      if (v[0] === 1) {
        data.set('b');
      }
    });

    trigger.set(1);

    trigger.set(2);

    assert.deepStrictEqual(mut_seen, [
      [0, []],
      [1, []],
      [2, ['b']],
    ]);
  });

  test('throttle drops a value written to its source inside the window, and keeps one timer', () => {
    vi.useFakeTimers();

    try {
      const src = state(0);

      const throttled = src.pipe(throttle(1000));

      const mut_seen: number[] = [];

      throttled.subscribe((v) => {
        mut_seen.push(v);

        if (v === 1) {
          src.set(2);
        }
      });

      src.set(1);

      assert.deepStrictEqual(mut_seen, [0, 1]);

      assert.strictEqual(vi.getTimerCount(), 1);

      throttled.dispose();

      assert.strictEqual(vi.getTimerCount(), 0);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('dispose', () => {
  test('takes the node out of the graph, and leaves its parent', () => {
    const s = state(0);

    const mut_calls = { count: 0 };

    const derived = s.pipe(
      map((x) => {
        mut_calls.count += 1;

        return x;
      }),
    );

    derived.dispose();

    assert.isFalse(toNode(s).hasObserver);

    mut_calls.count = 0;

    s.set(1);

    assert.strictEqual(mut_calls.count, 0);
  });

  test('a descendant of a disposed node is reached by nothing more, and keeps its value', () => {
    const s = state(1);

    const derived = s.pipe(map((x) => x * 2));

    const onlyChild = derived.pipe(map((x) => x + 1));

    const seen = collect(onlyChild);

    derived.dispose();

    s.set(2);

    assert.deepStrictEqual(seen, [3]);

    assert.deepStrictEqual(onlyChild.getSnapshot(), Optional.some(3));
  });

  test('cancels what it was waiting to emit', () => {
    vi.useFakeTimers();

    try {
      const s = state(0);

      const debounced = s.pipe(debounce(10));

      const seen = collect(debounced);

      s.set(1);

      debounced.dispose();

      vi.runAllTimers();

      assert.deepStrictEqual(seen, [0]);
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

const depthOf = (observable: Observable<unknown>): number =>
  toNode(observable).depth;
