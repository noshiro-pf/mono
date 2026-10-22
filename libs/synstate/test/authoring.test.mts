import { expectType, isRecord, Optional } from 'ts-data-forge';
import type { FixedLengthTuple } from 'ts-type-forge';
import {
  combine,
  createAsyncChildObservable,
  createRootObservable,
  createSyncChildObservable,
  source,
  type Observable,
  type RootObservable,
  type SyncChildObservable,
} from '../src/index.mjs';

// Written only with what the `synstate` entry exports, as a user would (#2117).

const double = (src: Observable<number>): SyncChildObservable<number> =>
  createSyncChildObservable(
    { parents: [src], initialValue: Optional.none },
    ({ setNext }) =>
      (updateToken) => {
        const sn = src.getSnapshot();

        if (src.updateToken !== updateToken || Optional.isNone(sn)) {
          return; // skip update
        }

        setNext(sn.value * 2, updateToken);
      },
  );

const delay = (src: Observable<number>, ms: number): Observable<number> =>
  createAsyncChildObservable(
    { parents: [src], initialValue: Optional.none },
    ({ startUpdate, onComplete }) => {
      const mut_timers = new Set<ReturnType<typeof setTimeout>>();

      onComplete(() => {
        for (const t of mut_timers) {
          clearTimeout(t);
        }

        mut_timers.clear();
      });

      return (updateToken) => {
        const sn = src.getSnapshot();

        if (src.updateToken !== updateToken || Optional.isNone(sn)) {
          return; // skip update
        }

        const t = setTimeout(() => {
          mut_timers.delete(t);

          startUpdate(sn.value);
        }, ms);

        mut_timers.add(t);
      };
    },
  );

/** Passes on the latest value once `ms` pass without a new one. */
const debounceTime = (
  src: Observable<number>,
  ms: number,
): Observable<number> =>
  createAsyncChildObservable(
    { parents: [src], initialValue: Optional.none },
    ({ startUpdate, onComplete }) => {
      let mut_timer: ReturnType<typeof setTimeout> | undefined = undefined;

      let mut_pending: Optional<number> = Optional.none;

      const reset = (): void => {
        clearTimeout(mut_timer);

        mut_timer = undefined;

        mut_pending = Optional.none;
      };

      onComplete(reset);

      return {
        tryUpdate: (updateToken) => {
          const sn = src.getSnapshot();

          if (src.updateToken !== updateToken || Optional.isNone(sn)) {
            return; // skip update
          }

          reset();

          mut_pending = sn;

          mut_timer = setTimeout(() => {
            mut_pending = Optional.none;

            startUpdate(sn.value);
          }, ms);
        },
        flush: () => {
          const pending = mut_pending;

          reset();

          if (Optional.isSome(pending)) {
            startUpdate(pending.value);
          }
        },
      };
    },
  );

/** Passes on `main`'s values, and completes once `main` does. */
const followMain = (
  main: Observable<number>,
  other: Observable<number>,
): Observable<number> =>
  createSyncChildObservable(
    { parents: [main, other], initialValue: Optional.none },
    ({ setNext }) => ({
      tryUpdate: (updateToken) => {
        const sn = main.getSnapshot();

        if (main.updateToken !== updateToken || Optional.isNone(sn)) {
          return; // skip update
        }

        setNext(sn.value, updateToken);
      },
      canEmitNoMore: () => main.isCompleted,
    }),
  );

/** A minimal event source, standing in for `EventTarget` or a Node emitter. */
type Emitter = Readonly<{
  addListener: (listener: (type: string) => void) => void;
  removeListener: (listener: (type: string) => void) => void;
}>;

const createEmitter = (): Emitter &
  Readonly<{ emit: (type: string) => void; listenerCount: () => number }> => {
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

const fromEvent = (emitter: Emitter): RootObservable<string> =>
  createRootObservable<string>(
    { initialValue: Optional.none },
    ({ startUpdate, onComplete }) => {
      emitter.addListener(startUpdate);

      onComplete(() => {
        emitter.removeListener(startUpdate);
      });

      return {};
    },
  );

describe('custom operators and creators', () => {
  test('a custom sync operator updates in the same update as its parent', () => {
    const num$ = source<number>();

    const doubled$ = double(num$);

    const pair$ = combine([num$, doubled$]);

    const mut_values: FixedLengthTuple<2, number>[] = [];

    pair$.subscribe((v) => {
      mut_values.push(v);
    });

    num$.next(1);

    num$.next(2);

    // No intermediate `[2, 2]`: the custom operator joins the same update.
    assert.deepStrictEqual(mut_values, [
      [1, 2],
      [2, 4],
    ]);
  });

  test('a custom sync operator skips an update its parent did not emit in', () => {
    const a$ = source<number>();

    const b$ = source<number>();

    const doubled$ = double(a$);

    const mut_values: number[] = [];

    combine([doubled$, b$]).subscribe(([d]) => {
      mut_values.push(d);
    });

    a$.next(1);

    b$.next(10);

    b$.next(20);

    assert.deepStrictEqual(mut_values, [2, 2]);
  });

  test('a custom async operator emits in an update of its own', () => {
    vi.useFakeTimers();

    const num$ = source<number>();

    const delayed$ = delay(num$, 100);

    const mut_values: number[] = [];

    delayed$.subscribe((v) => {
      mut_values.push(v);
    });

    num$.next(1);

    assert.deepStrictEqual(mut_values, []);

    vi.runAllTimers();

    assert.deepStrictEqual(mut_values, [1]);

    num$.next(2);

    delayed$.complete();

    vi.runAllTimers();

    assert.deepStrictEqual(mut_values, [1]);

    vi.useRealTimers();
  });

  test('a custom creator emits events and removes its listener on complete', () => {
    const emitter = createEmitter();

    const click$ = fromEvent(emitter);

    const mut_types: string[] = [];

    click$.subscribe((type) => {
      mut_types.push(type);
    });

    assert.strictEqual(emitter.listenerCount(), 1);

    emitter.emit('click');

    click$.complete();

    assert.strictEqual(emitter.listenerCount(), 0);

    emitter.emit('click');

    assert.deepStrictEqual(mut_types, ['click']);
  });

  test('teardowns registered in init run once, in the order registered', () => {
    const mut_calls: string[] = [];

    const obs$ = createRootObservable<number>(
      { initialValue: Optional.none },
      ({ onComplete }) => {
        onComplete(() => {
          mut_calls.push('first');
        });

        onComplete(() => {
          mut_calls.push('second');
        });

        return {};
      },
    );

    assert.deepStrictEqual(mut_calls, []);

    obs$.complete();

    obs$.complete();

    obs$.dispose();

    assert.deepStrictEqual(mut_calls, ['first', 'second']);
  });

  test('a teardown registered after completion runs at once', () => {
    const mut_calls: string[] = [];

    const obs$ = createRootObservable<number>(
      { initialValue: Optional.none },
      ({ complete, onComplete }) => {
        // As a synchronous source does: it completes before `init` gets to
        // register the teardown.
        complete();

        onComplete(() => {
          mut_calls.push('teardown');
        });

        return {};
      },
    );

    assert.deepStrictEqual(mut_calls, ['teardown']);

    assert.isTrue(obs$.isCompleted);
  });

  test('a custom async operator passes on what it holds on complete, not on dispose', () => {
    vi.useFakeTimers();

    const num$ = source<number>();

    const completed$ = debounceTime(num$, 100);

    const disposed$ = debounceTime(num$, 100);

    const mut_completed: number[] = [];

    const mut_disposed: number[] = [];

    completed$.subscribe((v) => {
      mut_completed.push(v);
    });

    disposed$.subscribe((v) => {
      mut_disposed.push(v);
    });

    num$.next(1);

    completed$.complete();

    disposed$.dispose();

    vi.runAllTimers();

    assert.deepStrictEqual(mut_completed, [1]);

    assert.deepStrictEqual(mut_disposed, []);

    vi.useRealTimers();
  });

  test('a custom operator returning canEmitNoMore is asked when a parent completes', () => {
    const main$ = source<number>();

    const other$ = source<number>();

    const followed$ = followMain(main$, other$);

    other$.next(0);

    assert.isFalse(followed$.isCompleted);

    main$.complete();

    // `other$` is still live, but `canEmitNoMore` says nothing more can come.
    assert.isTrue(followed$.isCompleted);
  });

  test('an operator that completes itself in init is never registered to its parents', () => {
    const num$ = source<number>();

    let mut_tryUpdateCalls = 0;

    const mut_teardowns: string[] = [];

    const obs$ = createSyncChildObservable(
      { parents: [num$], initialValue: Optional.none },
      ({ complete, onComplete }) => {
        complete();

        onComplete(() => {
          mut_teardowns.push('teardown');
        });

        return () => {
          mut_tryUpdateCalls += 1;
        };
      },
    );

    assert.isTrue(obs$.isCompleted);

    assert.deepStrictEqual(mut_teardowns, ['teardown']);

    num$.next(1);

    assert.strictEqual(mut_tryUpdateCalls, 0);
  });

  test('the public types carry only the members meant for users', () => {
    const num$ = source<number>();

    expectType<'updateToken', keyof typeof num$>('<=');

    expectType<'tryUpdate', keyof typeof num$>('!<=');

    expectType<'addChild', keyof typeof num$>('!<=');

    expectType<'depth', keyof typeof num$>('<=');

    expectType<'parents', keyof SyncChildObservable<number>>('<=');

    // The members are still there at run time, on the observable's class;
    // only the types hide them.
    assert.isTrue(isRecord(num$) && Reflect.has(num$, 'tryUpdate'));
  });
});
