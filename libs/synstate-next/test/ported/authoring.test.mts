/**
 * Ported from synstate's `test/authoring.test.mts` (#2117) and the type tests of
 * `observable-base.test.mts`: operators and sources written outside the
 * package, with what its entry exports alone, as a user would. synstate's
 * `createSyncChildObservable` and `createAsyncChildObservable` are one
 * `createDerived` here, and `createRootObservable` is `createSource`. There is
 * no completion: cleanups run when the observable is disposed, and `settled`
 * says when it can emit no more.
 */
import {
  batch,
  createDerived,
  createOwner,
  createSource,
  derive,
  map,
  onCleanup,
  source,
  state,
  timer,
  type DerivedBehavior,
  type DerivedContext,
  type InitializedObservable,
  type Observable,
} from 'synstate-next';
import { toNode } from 'synstate-next/internal';
import { expectType } from 'ts-data-forge';
import { Optional } from 'ts-std-forge';

describe('custom operators and sources', () => {
  test('a custom operator updates in the same update as its parent', () => {
    const num = source<number>();

    const seen = collect(derive([num, double(num)], (...values) => values));

    num.emit(1);

    num.emit(2);

    // No intermediate `[2, 2]`: the custom operator joins the same update.
    assert.deepStrictEqual(seen, [
      [1, 2],
      [2, 4],
    ]);
  });

  test('a custom operator skips an update its parent did not emit in', () => {
    const a = source<number>();

    const b = source<number>();

    const mut_calls: number[] = [];

    const doubled = createDerived<number>([a, b], (ctx) => () => {
      mut_calls.push(1);

      if (ctx.emitted(a)) {
        ctx.set(Optional.unwrapOr(a.getSnapshot(), 0) * 2);
      }
    });

    const seen = collect(doubled);

    a.emit(1);

    b.emit(10);

    b.emit(20);

    assert.deepStrictEqual(seen, [2]);

    assert.strictEqual(mut_calls.length, 3);
  });

  test('a custom operator given an initial value holds it, and is typed so', () => {
    const num = state(1);

    const doubled = createDerived(
      [num],
      (ctx) => () => {
        ctx.set(num.value * 2);
      },
      { initialValue: num.value * 2 },
    );

    expectType<typeof doubled, InitializedObservable<number>>('=');

    assert.strictEqual(doubled.value, 2);

    num.set(2);

    assert.strictEqual(doubled.value, 4);
  });

  test('a custom async operator emits in an update of its own, and disposing it drops what waits', () => {
    vi.useFakeTimers();

    onTestFinished(() => {
      vi.useRealTimers();
    });

    const num = source<number>();

    const delayed = delay(num, 100);

    const seen = collect(delayed);

    num.emit(1);

    assert.deepStrictEqual(seen, []);

    vi.runAllTimers();

    assert.deepStrictEqual(seen, [1]);

    num.emit(2);

    delayed.dispose();

    assert.strictEqual(vi.getTimerCount(), 0);

    assert.deepStrictEqual(seen, [1]);
  });

  test('set outside update throws, naming emit', () => {
    const num = source<number>();

    const mut_ctx: { set?: (v: number) => void } = {};

    createDerived<number>([num], (ctx) => {
      mut_ctx.set = ctx.set;

      return noUpdate;
    });

    assert.throws(() => mut_ctx.set?.(1), Error, 'emit');
  });

  test('a setup that throws leaves nothing on the parents', () => {
    const num = source<number>();

    assert.throws(() => {
      createDerived<number>([num], () => {
        throw new SyntaxError('setup');
      });
    }, SyntaxError);

    assert.isFalse(toNode(num).hasObserver);
  });

  test('a setup that throws disposes what it made and runs its cleanups', () => {
    const num = source<number>();

    const mut_calls: string[] = [];

    assert.throws(() => {
      createDerived<number>([num], (ctx) => {
        num.subscribe(() => {});

        ctx.onCleanup(() => {
          mut_calls.push('cleanup');
        });

        throw new SyntaxError('setup');
      });
    }, SyntaxError);

    assert.deepStrictEqual(mut_calls, ['cleanup']);

    assert.isFalse(toNode(num).hasObserver);
  });

  test('the setup runs with the observable as the owner, not the one around it', () => {
    const mut_calls: string[] = [];

    const outer = createOwner();

    const op = outer.run(() =>
      createDerived<number>([source<number>()], () => {
        onCleanup(() => {
          mut_calls.push('cleanup');
        });

        return noUpdate;
      }),
    );

    op.dispose();

    assert.deepStrictEqual(mut_calls, ['cleanup']);

    assert.isFalse(outer.disposed);
  });

  test('a setup that writes to a parent is updated from the next write on', () => {
    const num = state(0);

    const seen = collect(
      createDerived<number>([num], (ctx) => {
        num.set(1);

        return () => {
          ctx.set(num.value * 10);
        };
      }),
    );

    num.set(2);

    assert.deepStrictEqual(seen, [20]);
  });

  test('a custom async operator that says so is not settled while a value is due', () => {
    vi.useFakeTimers();

    onTestFinished(() => {
      vi.useRealTimers();
    });

    const delayed = delay(timer(10), 100);

    const seen = collect(delayed);

    vi.advanceTimersToNextTimer();

    // The timer fired and settled; the delayed value waits 100 ms more.
    assert.isFalse(toNode(delayed).settled);

    vi.advanceTimersToNextTimer();

    assert.deepStrictEqual(seen, [0]);

    assert.isTrue(toNode(delayed).settled);
  });

  test('what setup creates is disposed with the operator', () => {
    const num = source<number>();

    const op = createDerived<number>([num], (ctx) => {
      num.pipe(map((x) => x)).subscribe(() => {});

      return () => {
        ctx.set(0);
      };
    });

    assert.isTrue(toNode(num).hasObserver);

    op.dispose();

    assert.isFalse(toNode(num).hasObserver);
  });

  test('a value emitted and one set in the same round are both passed on', () => {
    const num = source<number>();

    const mut_emit: { current?: (v: number) => void } = {};

    const op = createDerived<number>([num], (ctx) => {
      mut_emit.current = ctx.emit;

      return () => {
        ctx.set(Optional.unwrapOr(num.getSnapshot(), 0) * 10);
      };
    });

    const seen = collect(op);

    batch(() => {
      mut_emit.current?.(1);

      num.emit(5);
    });

    assert.deepStrictEqual(seen, [1, 50]);
  });

  test('an update that throws after set passes nothing on and holds nothing new', () => {
    const num = state(0);

    const op = createDerived<number>(
      [num],
      (ctx) => () => {
        ctx.set(num.value);

        if (num.value === 1) {
          throw new RangeError('update');
        }
      },
      { initialValue: 0 },
    );

    assert.throws(() => {
      num.set(1);
    }, RangeError);

    assert.strictEqual(op.value, 0);
  });

  test('no parent is refused, naming createSource', () => {
    assert.throws(
      () => createDerived<number>([], () => noUpdate),
      RangeError,
      'createSource',
    );
  });

  test('a source whose setup throws runs the cleanups it registered', () => {
    const mut_calls: string[] = [];

    assert.throws(() => {
      createSource<number>((ctx) => {
        ctx.onCleanup(() => {
          mut_calls.push('cleanup');
        });

        throw new SyntaxError('setup');
      });
    }, SyntaxError);

    assert.deepStrictEqual(mut_calls, ['cleanup']);
  });

  test('a cleanup registered after the source was disposed runs at once', () => {
    const mut_ctx: { onCleanup?: (cleanup: () => void) => void } = {};

    const obs = createSource<number>((ctx) => {
      mut_ctx.onCleanup = ctx.onCleanup;
    });

    obs.dispose();

    const mut_calls: string[] = [];

    mut_ctx.onCleanup?.(() => {
      mut_calls.push('late');
    });

    assert.deepStrictEqual(mut_calls, ['late']);
  });

  test('a custom source emits events and removes its listener when disposed', () => {
    const emitter = createEmitter();

    const click = fromEvent(emitter);

    const seen = collect(click);

    assert.strictEqual(emitter.listenerCount(), 1);

    emitter.emit('click');

    click.dispose();

    assert.strictEqual(emitter.listenerCount(), 0);

    emitter.emit('click');

    assert.deepStrictEqual(seen, ['click']);
  });

  test('cleanups run once, newest first, all of them when one throws', () => {
    const mut_calls: string[] = [];

    const obs = createSource<number>((ctx) => {
      ctx.onCleanup(() => {
        mut_calls.push('first');
      });

      ctx.onCleanup(() => {
        mut_calls.push('second');

        throw new RangeError('cleanup');
      });
    });

    assert.deepStrictEqual(mut_calls, []);

    assert.throws(() => {
      obs.dispose();
    }, RangeError);

    obs.dispose();

    // synstate ran them in the order registered; an owner runs its cleanups
    // newest first, and so does every observable here.
    assert.deepStrictEqual(mut_calls, ['second', 'first']);
  });

  test('a source that ends in its setup is settled at once and keeps its value', () => {
    const obs = createSource<number>((ctx) => {
      ctx.emit(1);

      ctx.end();
    });

    assert.isTrue(toNode(obs).settled);

    assert.deepStrictEqual(collect(obs), [1]);
  });

  test('a custom operator with a settled handler settles when it says', () => {
    const main = source<number>();

    const other = source<number>();

    const followed = createDerived<number>([main, other], (ctx) => ({
      update: () => {
        if (ctx.emitted(main)) {
          ctx.set(Optional.unwrapOr(main.getSnapshot(), 0));
        }
      },
      settled: () => main.settled,
    }));

    other.emit(0);

    assert.isFalse(toNode(followed).settled);

    main.dispose();

    // `other` is still live, but nothing more can come.
    assert.isTrue(toNode(followed).settled);
  });

  test('the functions of a behavior are called on it, and a function alone with no this', () => {
    const main = source<number>();

    class Following implements DerivedBehavior {
      readonly #ctx: DerivedContext<number>;

      #mut_done: boolean;

      constructor(ctx: DerivedContext<number>) {
        this.#ctx = ctx;

        this.#mut_done = false;
      }

      update(): void {
        this.#ctx.set(Optional.unwrapOr(main.getSnapshot(), 0));

        this.#mut_done = true;
      }

      settled(): boolean {
        return this.#mut_done;
      }
    }

    const followed = createDerived<number>([main], (ctx) => new Following(ctx));

    assert.isFalse(toNode(followed).settled);

    main.emit(1);

    assert.isTrue(toNode(followed).settled);

    const mut_thisValues: unknown[] = [];

    // A function expression, since an arrow function has no `this` to record.
    const record = function record(this: unknown): void {
      mut_thisValues.push(this);
    };

    createDerived<number>([main], () => record);

    main.emit(2);

    assert.deepStrictEqual(mut_thisValues, [undefined]);
  });

  test('without a settled handler it settles once every parent has', () => {
    const a = source<number>();

    const b = source<number>();

    const both = createDerived<number>([a, b], (ctx) => () => {
      ctx.set(0);
    });

    a.dispose();

    assert.isFalse(toNode(both).settled);

    b.dispose();

    assert.isTrue(toNode(both).settled);
  });

  test('the public types carry only the members meant for users', () => {
    const num = source<number>();

    expectType<'getSnapshot', keyof typeof num>('<=');

    expectType<'recompute', keyof typeof num>('!<=');

    expectType<'addChild', keyof typeof num>('!<=');

    expectType<'children', keyof typeof num>('!<=');

    // Observable is covariant, and an initialized one is an observable.
    expectType<Observable<1>, Observable<number>>('<=');

    expectType<Observable<number>, Observable<1>>('!<=');

    expectType<InitializedObservable<number>, Observable<number>>('<=');

    expectType<Observable<number>, InitializedObservable<number>>('!<=');

    // The members are still there at run time; only the types hide them.
    assert.isTrue(
      Reflect.has(num, 'recompute') || Reflect.has(num, 'addChild'),
    );
  });
});

const double = (src: Observable<number>): Observable<number> =>
  createDerived([src], (ctx) => () => {
    const v = src.getSnapshot();

    if (Optional.isSome(v) && ctx.emitted(src)) {
      ctx.set(Optional.unwrap(v) * 2);
    }
  });

const delay = (src: Observable<number>, ms: number): Observable<number> =>
  createDerived([src], (ctx) => {
    const mut_timers = new Set<ReturnType<typeof setTimeout>>();

    ctx.onCleanup(() => {
      for (const t of mut_timers) {
        clearTimeout(t);
      }

      mut_timers.clear();
    });

    return {
      // A value is still due while a timer runs.
      settled: () => mut_timers.size === 0 && src.settled,
      update: () => {
        const v = src.getSnapshot();

        if (Optional.isNone(v) || !ctx.emitted(src)) {
          return;
        }

        const t = setTimeout(() => {
          mut_timers.delete(t);

          ctx.emit(Optional.unwrap(v));
        }, ms);

        mut_timers.add(t);
      },
    };
  });

const noUpdate = (): void => {};

/** A minimal event source, standing in for `EventTarget` or a Node emitter. */
type Emitter = Readonly<{
  addListener: (listener: (type: string) => void) => void;
  removeListener: (listener: (type: string) => void) => void;
  emit: (type: string) => void;
  listenerCount: () => number;
}>;

const createEmitter = (): Emitter => {
  const mut_listeners = new Set<(type: string) => void>();

  return {
    addListener: (listener) => {
      mut_listeners.add(listener);
    },
    removeListener: (listener) => {
      mut_listeners.delete(listener);
    },
    emit: (type) => {
      for (const listener of mut_listeners) {
        listener(type);
      }
    },
    listenerCount: () => mut_listeners.size,
  };
};

const fromEvent = (emitter: Emitter): Observable<string> =>
  createSource<string>((ctx) => {
    emitter.addListener(ctx.emit);

    ctx.onCleanup(() => {
      emitter.removeListener(ctx.emit);
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
