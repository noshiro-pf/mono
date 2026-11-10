/**
 * Ported from synstate's completion tests: `take-complete`, `zip-complete`,
 * `complete-after-last-value`, `complete-propagation` (#2248), and the sources'
 * `counter`, `timer`, `empty`, `source` and `from-subscribable`. Completion is
 * `settled` here: asked, not announced, and a node that is settled keeps its
 * value and its subscribers. A finished `take` also leaves its parents.
 * `is-observable` is at the end.
 */
import {
  batch,
  counter,
  createOwner,
  createState,
  derive,
  empty,
  fromSubscribable,
  isObservable,
  just,
  map,
  source,
  state,
  switchMap,
  take,
  timer,
  withInitialValue,
  zip,
  type Observable,
} from 'synstate-next';
import { toNode } from 'synstate-next/internal';
import { Arr } from 'ts-data-forge';
import { Optional } from 'ts-std-forge';

describe(take, () => {
  test('settles, and leaves its parent, in the update of its nth value', () => {
    const num = source<number>();

    const taken = num.pipe(take(3));

    const seen = collect(taken);

    num.emit(1);

    num.emit(2);

    assert.isFalse(isSettled(taken));

    num.emit(3);

    assert.isTrue(isSettled(taken));

    assert.isFalse(toNode(num).hasObserver);

    num.emit(4);

    assert.deepStrictEqual(seen, [1, 2, 3]);
  });

  test('passes the nth value on to its descendants, one reading another parent included', () => {
    const num = source<number>();

    const taken = num.pipe(take(2));

    const doubled = collect(taken.pipe(map((x) => x * 2)));

    const pairs = collect(derive([taken, num], (...values) => values));

    num.emit(1);

    num.emit(2);

    num.emit(3);

    assert.deepStrictEqual(doubled, [2, 4]);

    assert.deepStrictEqual(pairs, [
      [1, 1],
      [2, 2],
      [2, 3],
    ]);
  });

  test('counts an initial value given by withInitialValue', () => {
    const num = source<number>();

    const taken = num.pipe(withInitialValue(0)).pipe(take(2));

    const seen = collect(taken);

    num.emit(1);

    num.emit(2);

    // synstate did not count the initial value, and passed `[0, 1, 2]`; see
    // DESIGN.md.
    assert.deepStrictEqual(seen, [0, 1]);

    assert.isTrue(isSettled(taken));
  });

  test('settles after the nth value an inner observable emits', () => {
    const trigger = source<number>();

    const inner = source<number>();

    const taken = trigger.pipe(switchMap(() => inner)).pipe(take(2));

    const seen = collect(taken);

    trigger.emit(0);

    inner.emit(1);

    inner.emit(2);

    assert.isTrue(isSettled(taken));

    assert.deepStrictEqual(seen, [1, 2]);
  });
});

describe(zip, () => {
  test('settles when a parent is settled with nothing queued', () => {
    const a = source<number>();

    const b = source<string>();

    const zipped = zip([a, b]);

    a.dispose();

    assert.isTrue(isSettled(zipped));
  });

  test('zips the values a settled parent queued, then settles', () => {
    const a = source<number>();

    const b = source<string>();

    const zipped = zip([a, b]);

    const seen = collect(zipped);

    a.emit(1);

    a.emit(2);

    a.dispose();

    assert.isFalse(isSettled(zipped));

    b.emit('x');

    assert.isFalse(isSettled(zipped));

    b.emit('y');

    assert.isTrue(isSettled(zipped));

    assert.deepStrictEqual(seen, [
      [1, 'x'],
      [2, 'y'],
    ]);
  });

  test('settles on the last value of a settled parent that runs out first', () => {
    const a = source<number>();

    const b = source<string>();

    const c = source<boolean>();

    const zipped = zip([a, b, c]);

    const seen = collect(zipped);

    a.emit(1);

    a.emit(2);

    a.emit(3);

    a.dispose();

    c.emit(true);

    c.emit(false);

    b.emit('x');

    c.dispose();

    assert.isFalse(isSettled(zipped));

    b.emit('y');

    assert.isTrue(isSettled(zipped));

    assert.deepStrictEqual(seen, [
      [1, 'x', true],
      [2, 'y', false],
    ]);
  });

  test('settles once the first row took what a settled parent held', () => {
    const letters = just('A');

    const numbers = state(1);

    const zipped = zip([letters, numbers]);

    assert.isTrue(isSettled(zipped));

    assert.deepStrictEqual(zipped.value, ['A', 1]);
  });

  test('passes the last row to what is derived from it', () => {
    const a = source<number>();

    const b = source<string>();

    const seen = collect(
      zip([a, b])
        .pipe(map(([n, s]) => `${n.toString()}${s}`))
        .pipe(map((v) => `derived ${v}`)),
    );

    a.emit(1);

    a.dispose();

    b.emit('x');

    assert.deepStrictEqual(seen, ['derived 1x']);
  });
});

describe(counter, () => {
  test.each([
    { emitInitial: true, expected: [0, 1, 2] },
    { emitInitial: false, expected: [1, 2, 3] },
  ] as const)(
    'times: 3, emitInitial: $emitInitial settles right after the third value',
    ({ emitInitial, expected }) => {
      useFakeTimers();

      const c = counter(100, { times: 3, emitInitial });

      const seen = collect(c);

      vi.advanceTimersToNextTimer().advanceTimersToNextTimer();

      assert.deepStrictEqual(seen, Arr.take(expected, 2));

      assert.isFalse(isSettled(c));

      vi.advanceTimersToNextTimer();

      assert.deepStrictEqual(seen, expected);

      assert.isTrue(isSettled(c));

      assert.strictEqual(vi.getTimerCount(), 0);
    },
  );

  test('disposing it before the first value cancels the pending 0', () => {
    useFakeTimers();

    const c = counter(100);

    const seen = collect(c);

    c.dispose();

    assert.strictEqual(vi.getTimerCount(), 0);

    vi.runAllTimers();

    assert.deepStrictEqual(seen, []);
  });

  test('what is derived from it settles once the last value has reached it', () => {
    useFakeTimers();

    const doubled = counter(100, { times: 2 }).pipe(map((n) => n * 2));

    const seen = collect(doubled);

    vi.advanceTimersToNextTimer().advanceTimersToNextTimer();

    assert.deepStrictEqual(seen, [0, 2]);

    assert.isTrue(isSettled(doubled));
  });

  test('timer: disposing it before it fires clears its timer', () => {
    useFakeTimers();

    const t = timer(10);

    t.dispose();

    assert.strictEqual(vi.getTimerCount(), 0);
  });
});

describe(empty, () => {
  test('holds no value, is settled, and passes nothing to a subscriber', () => {
    const nothing = empty<number>();

    assert.isTrue(Optional.isNone(nothing.getSnapshot()));

    assert.isTrue(isSettled(nothing));

    assert.deepStrictEqual(collect(nothing), []);
  });

  test('switched to, it passes nothing on, and switchMap goes on', () => {
    const [on, setOn] = createState(true);

    const [count, setCount] = createState(0);

    const followed = on.pipe(
      switchMap((isOn) => (isOn ? count : empty<number>())),
    );

    const seen = collect(followed);

    setOn(false);

    const before = seen.length;

    setCount(1);

    assert.strictEqual(seen.length, before);

    setOn(true);

    assert.strictEqual(seen.at(-1), 1);

    assert.isFalse(isSettled(followed));
  });
});

describe(source, () => {
  test('a disposed source passes nothing on, and keeps the value it held', () => {
    const s = source<number>();

    const seen = collect(s);

    s.emit(1);

    s.dispose();

    s.emit(2);

    assert.deepStrictEqual(seen, [1]);

    assert.deepStrictEqual(s.getSnapshot(), Optional.some(1));
  });

  test('what is derived from a disposed source is settled at once, and holds the value it computed (#2248)', () => {
    const s = source<number>();

    s.emit(5);

    s.dispose();

    const d = s.pipe(map((x) => x * 100));

    assert.isTrue(isSettled(d));

    assert.isFalse(toNode(s).hasObserver);

    assert.deepStrictEqual(collect(d), [500]);
  });

  test('a disposed source lets go of its children', () => {
    const s = source<number>();

    const d = s.pipe(map((x) => x));

    d.subscribe(() => {});

    s.dispose();

    assert.isFalse(toNode(s).hasObserver);

    assert.isUndefined(toNode(s).children);
  });

  test('a value written in a batch before the source is disposed still reaches its subscribers', () => {
    const s = source<number>();

    const seen = collect(s.pipe(map((x) => x * 2)));

    batch(() => {
      s.emit(1);

      s.dispose();

      assert.isFalse(isSettled(s));
    });

    assert.deepStrictEqual(seen, [2]);

    assert.isTrue(isSettled(s));

    assert.isFalse(toNode(s).hasObserver);
  });
});

describe(fromSubscribable, () => {
  test('disposing it unsubscribes once', () => {
    const { subscribable, unsubscribe } = manualSubscribable();

    const observable = fromSubscribable(subscribable);

    observable.dispose();

    observable.dispose();

    expect(unsubscribe).toHaveBeenCalledExactlyOnceWith();
  });

  test('does not unsubscribe when the subscribable completes first', () => {
    const { subscribable, emit, complete, unsubscribe } = manualSubscribable();

    const owner = createOwner();

    const observable = owner.run(() => fromSubscribable(subscribable));

    const seen = collect(observable);

    emit(1);

    complete();

    assert.isTrue(isSettled(observable));

    owner.dispose();

    expect(unsubscribe).not.toHaveBeenCalled();

    assert.strictEqual(seen.length, 1);
  });

  test('does not unsubscribe when the subscribable completes during subscribe', () => {
    const unsubscribe = vi.fn<() => void>();

    const observable = fromSubscribable<number>({
      subscribe: (observer) => {
        observer.complete();

        return { unsubscribe };
      },
    });

    assert.isTrue(isSettled(observable));

    observable.dispose();

    expect(unsubscribe).not.toHaveBeenCalled();
  });

  test('disposed while a value waits for its round, it is not settled until the value is delivered', () => {
    const { subscribable, emit } = manualSubscribable();

    const observable = fromSubscribable(subscribable);

    const seen = collect(observable);

    batch(() => {
      emit(1);

      observable.dispose();

      assert.isFalse(isSettled(observable));
    });

    assert.strictEqual(seen.length, 1);

    assert.isTrue(isSettled(observable));
  });

  test('a finished take below it leaves it subscribed until it is disposed', () => {
    const { subscribable, emit, unsubscribe } = manualSubscribable();

    const observable = fromSubscribable(subscribable);

    const taken = observable.pipe(take(1));

    collect(taken);

    emit(1);

    emit(2);

    assert.isTrue(isSettled(taken));

    assert.isFalse(isSettled(observable));

    expect(unsubscribe).not.toHaveBeenCalled();

    observable.dispose();

    expect(unsubscribe).toHaveBeenCalledExactlyOnceWith();
  });
});

describe(isObservable, () => {
  test('accepts states, sources, settled sources and derived nodes, disposed or not', () => {
    const count = state(0);

    const doubled = count.pipe(map((n) => n * 2));

    for (const o of [count, source<number>(), just(1), doubled]) {
      assert.isTrue(isObservable(o));
    }

    doubled.dispose();

    assert.isTrue(isObservable(doubled));

    const owner = createOwner();

    const created = owner.run(() => source<number>());

    owner.dispose();

    assert.isTrue(isObservable(created));
  });

  test('rejects values that only look like an observable, and primitives', () => {
    for (const value of [
      { subscribe: () => {} },
      { subscribe: () => {}, pipe: () => {}, getSnapshot: () => {} },
      () => {},
      0,
      'a',
      null,
      undefined,
    ]) {
      assert.isFalse(isObservable(value));
    }
  });
});

const isSettled = (observable: Observable<unknown>): boolean =>
  toNode(observable).settled;

/** A subscribable whose values and completion the test gives by hand. */
const manualSubscribable = (): Readonly<{
  subscribable: Parameters<typeof fromSubscribable<number>>[0];
  emit: (value: number) => void;
  complete: () => void;
  unsubscribe: () => void;
}> => {
  const mut_observer: {
    current: Readonly<{
      next?: (value: number) => void;
      complete?: () => void;
    }>;
  } = { current: {} };

  const unsubscribe = vi.fn<() => void>(() => {
    mut_observer.current = {};
  });

  return {
    subscribable: {
      subscribe: (observer) => {
        mut_observer.current = observer;

        return { unsubscribe };
      },
    },
    emit: (value) => {
      mut_observer.current.next?.(value);
    },
    complete: () => {
      mut_observer.current.complete?.();
    },
    unsubscribe,
  };
};

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
