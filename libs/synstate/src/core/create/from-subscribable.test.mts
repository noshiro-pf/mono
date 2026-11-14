import { Optional, Result } from 'ts-data-forge';
import { panic } from 'ts-std-forge';
import { collectToArray } from '../../utils/index.mjs';
import { combine } from '../combine/index.mjs';
import { mergeMap, take } from '../operators/index.mjs';
import type { Observable, Subscribable } from '../types/index.mjs';
import { fromSubscribable } from './from-subscribable.mjs';
import { source } from './source.mjs';

describe(fromSubscribable, () => {
  test('complete() unsubscribes from the subscribable once', () => {
    const { subscribable, emit, unsubscribe } = createManualSubscribable();

    const observable$ = fromSubscribable(subscribable);

    observable$.complete();

    observable$.complete();

    expect(unsubscribe).toHaveBeenCalledExactlyOnceWith();

    emit(1);

    assert.isTrue(observable$.isCompleted);
  });

  test('a value the subscribable emits after complete() is neither stored nor propagated', () => {
    // A subscribable whose `unsubscribe` does not stop it, as one calling back
    // from a task queued before `unsubscribe` was called does.
    let mut_onNext: ((value: number) => void) | undefined = undefined;

    const emit = (value: number): void => {
      mut_onNext?.(value);
    };

    const observable$ = fromSubscribable<number>({
      subscribe: (onNext) => {
        mut_onNext = onNext;

        return { unsubscribe: () => {} };
      },
    });

    // `combine` stays live after `observable$` completes: it has another
    // parent.
    const combined$ = combine([observable$, source('x')]);

    const mut_history: (readonly [Result<number, unknown>, string])[] = [];

    combined$.subscribe((value) => {
      mut_history.push(value);
    });

    emit(1);

    observable$.complete();

    emit(2);

    assert.isTrue(observable$.isCompleted);

    assert.isFalse(combined$.isCompleted);

    assert.deepStrictEqual(
      observable$.getSnapshot(),
      Optional.some(Result.ok(1)),
    );

    assert.deepStrictEqual(mut_history, [[Result.ok(1), 'x']]);
  });

  test('an error the subscribable reports after complete() is neither stored nor propagated', () => {
    let mut_onError: ((error?: unknown) => void) | undefined = undefined;

    const fail = (error: unknown): void => {
      mut_onError?.(error);
    };

    const observable$ = fromSubscribable<number>({
      subscribe: (_onNext, onError) => {
        mut_onError = onError;

        return { unsubscribe: () => {} };
      },
    });

    const mut_history: Result<number, unknown>[] = [];

    combine([observable$, source('x')]).subscribe(([result]) => {
      mut_history.push(result);
    });

    observable$.complete();

    fail('late');

    assert.deepStrictEqual(observable$.getSnapshot(), Optional.none);

    assert.deepStrictEqual(mut_history, []);
  });

  test('a value delivered from inside unsubscribe reaches subscribers and children before the completion', () => {
    let mut_onNext: ((value: number) => void) | undefined = undefined;

    const observable$ = fromSubscribable<number>({
      subscribe: (onNext) => {
        mut_onNext = onNext;

        return {
          unsubscribe: () => {
            mut_onNext?.(9);
          },
        };
      },
    });

    // `combine` stays live, so the completion of `observable$`, which the
    // subscriber hears, is recorded in both lists.
    const mut_subscriberEvents: (Result<number, unknown> | 'complete')[] = [];

    const mut_combineEvents: (Result<number, unknown> | 'complete')[] = [];

    observable$.subscribe(
      (result) => {
        mut_subscriberEvents.push(result);
      },
      () => {
        mut_subscriberEvents.push('complete');

        mut_combineEvents.push('complete');
      },
    );

    combine([observable$, source('x')]).subscribe(([result]) => {
      mut_combineEvents.push(result);
    });

    observable$.complete();

    assert.isTrue(observable$.isCompleted);

    assert.deepStrictEqual(mut_subscriberEvents, [Result.ok(9), 'complete']);

    assert.deepStrictEqual(mut_combineEvents, [Result.ok(9), 'complete']);
  });

  test('dispose() unsubscribes from the subscribable', () => {
    const { subscribable, unsubscribe } = createManualSubscribable();

    fromSubscribable(subscribable).dispose();

    expect(unsubscribe).toHaveBeenCalledExactlyOnceWith();
  });

  test('does not unsubscribe when the subscribable completes first', () => {
    const { subscribable, emit, completeSource, unsubscribe } =
      createManualSubscribable();

    const observable$ = fromSubscribable(subscribable);

    const mut_history: number[] = [];

    observable$.subscribe((result) => {
      if (Result.isOk(result)) {
        mut_history.push(result.value);
      }
    });

    emit(1);

    completeSource();

    assert.isTrue(observable$.isCompleted);

    observable$.complete();

    expect(unsubscribe).not.toHaveBeenCalled();

    assert.deepStrictEqual(mut_history, [1]);
  });

  test('does not unsubscribe when the subscribable completes synchronously during subscribe', () => {
    const unsubscribe = vi.fn<() => void>();

    const observable$ = fromSubscribable<number>({
      subscribe: (_onNext, _onError, onComplete) => {
        onComplete?.();

        return { unsubscribe };
      },
    });

    assert.isTrue(observable$.isCompleted);

    expect(unsubscribe).not.toHaveBeenCalled();
  });

  test('an error is passed on as an Err and completes the observable', () => {
    const { subscribable, fail, unsubscribe } = createManualSubscribable();

    const observable$ = fromSubscribable<number, string>(subscribable);

    const mut_events: (Result<number, string> | 'complete')[] = [];

    observable$.subscribe(
      (result) => {
        mut_events.push(result);
      },
      () => {
        mut_events.push('complete');
      },
    );

    fail('boom');

    assert.isTrue(observable$.isCompleted);

    assert.deepStrictEqual(
      observable$.getSnapshot(),
      Optional.some(Result.err('boom')),
    );

    assert.deepStrictEqual(mut_events, [Result.err('boom'), 'complete']);

    expect(unsubscribe).toHaveBeenCalledExactlyOnceWith();
  });

  test('a value the subscribable emits after an error has completed the observable is neither stored nor propagated', () => {
    // A subscribable that goes on calling `onNext` after `onError`, and whose
    // `unsubscribe` does not stop it.
    let mut_onNext: ((value: number) => void) | undefined = undefined;

    let mut_onError: ((error?: unknown) => void) | undefined = undefined;

    const emit = (value: number): void => {
      mut_onNext?.(value);
    };

    const fail = (error: unknown): void => {
      mut_onError?.(error);
    };

    const unsubscribe = vi.fn<() => void>();

    const observable$ = fromSubscribable<number, string>({
      subscribe: (onNext, onError) => {
        mut_onNext = onNext;

        mut_onError = onError;

        return { unsubscribe };
      },
    });

    // `combine` stays live after `observable$` completes: it has another
    // parent.
    const combined$ = combine([observable$, source('x')]);

    const mut_history: (readonly [Result<number, string>, string])[] = [];

    combined$.subscribe((value) => {
      mut_history.push(value);
    });

    fail('boom');

    emit(1);

    assert.isTrue(observable$.isCompleted);

    assert.isFalse(combined$.isCompleted);

    assert.deepStrictEqual(
      observable$.getSnapshot(),
      Optional.some(Result.err('boom')),
    );

    assert.deepStrictEqual(mut_history, [[Result.err('boom'), 'x']]);

    expect(unsubscribe).toHaveBeenCalledExactlyOnceWith();
  });

  test('an error reported synchronously during subscribe completes the observable and unsubscribes once', () => {
    const unsubscribe = vi.fn<() => void>();

    const observable$ = fromSubscribable<number, string>({
      subscribe: (_onNext, onError) => {
        onError?.('boom');

        return { unsubscribe };
      },
    });

    assert.isTrue(observable$.isCompleted);

    assert.deepStrictEqual(
      observable$.getSnapshot(),
      Optional.some(Result.err('boom')),
    );

    expect(unsubscribe).toHaveBeenCalledExactlyOnceWith();
  });

  test('an error reported from inside unsubscribe is passed on once and completes the observable once', () => {
    let mut_onError: ((error?: unknown) => void) | undefined = undefined;

    // As a subscribable that aborts its work and reports the abort does.
    const unsubscribe = vi.fn<() => void>(() => {
      mut_onError?.('aborted');
    });

    const observable$ = fromSubscribable<number, string>({
      subscribe: (_onNext, onError) => {
        mut_onError = onError;

        return { unsubscribe };
      },
    });

    const mut_events: (Result<number, string> | 'complete')[] = [];

    observable$.subscribe(
      (result) => {
        mut_events.push(result);
      },
      () => {
        mut_events.push('complete');
      },
    );

    observable$.complete();

    assert.isTrue(observable$.isCompleted);

    assert.deepStrictEqual(mut_events, [Result.err('aborted'), 'complete']);

    expect(unsubscribe).toHaveBeenCalledExactlyOnceWith();
  });

  test('what the subscribable passes on from inside unsubscribe after an error is ignored', () => {
    let mut_onNext: ((value: number) => void) | undefined = undefined;

    let mut_onError: ((error?: unknown) => void) | undefined = undefined;

    let mut_onComplete: (() => void) | undefined = undefined;

    const fail = (error: unknown): void => {
      mut_onError?.(error);
    };

    // As a subscribable that flushes, reports the abort and completes when
    // unsubscribed does.
    const unsubscribe = vi.fn<() => void>(() => {
      mut_onNext?.(1);

      mut_onError?.('aborted');

      mut_onComplete?.();
    });

    const observable$ = fromSubscribable<number, string>({
      subscribe: (onNext, onError, onComplete) => {
        mut_onNext = onNext;

        mut_onError = onError;

        mut_onComplete = onComplete;

        return { unsubscribe };
      },
    });

    const mut_events: (Result<number, string> | 'complete')[] = [];

    observable$.subscribe(
      (result) => {
        mut_events.push(result);
      },
      () => {
        mut_events.push('complete');
      },
    );

    fail('boom');

    assert.isTrue(observable$.isCompleted);

    assert.deepStrictEqual(
      observable$.getSnapshot(),
      Optional.some(Result.err('boom')),
    );

    assert.deepStrictEqual(mut_events, [Result.err('boom'), 'complete']);

    expect(unsubscribe).toHaveBeenCalledExactlyOnceWith();
  });

  test('a subscriber that completes the observable on the Err leaves one completion and one unsubscribe', () => {
    const { subscribable, fail, unsubscribe } = createManualSubscribable();

    const observable$ = fromSubscribable<number, string>(subscribable);

    const onComplete = vi.fn<() => void>();

    observable$.subscribe((result) => {
      if (Result.isErr(result)) {
        observable$.complete();
      }
    }, onComplete);

    fail('boom');

    assert.isTrue(observable$.isCompleted);

    expect(onComplete).toHaveBeenCalledExactlyOnceWith();

    expect(unsubscribe).toHaveBeenCalledExactlyOnceWith();
  });

  test('completion reported from inside unsubscribe completes the observable once', () => {
    let mut_onComplete: (() => void) | undefined = undefined;

    const unsubscribe = vi.fn<() => void>(() => {
      mut_onComplete?.();
    });

    const observable$ = fromSubscribable<number>({
      subscribe: (_onNext, _onError, onComplete) => {
        mut_onComplete = onComplete;

        return { unsubscribe };
      },
    });

    const subscriberOnComplete = vi.fn<() => void>();

    observable$.subscribe(() => {}, subscriberOnComplete);

    observable$.complete();

    assert.isTrue(observable$.isCompleted);

    expect(subscriberOnComplete).toHaveBeenCalledExactlyOnceWith();

    expect(unsubscribe).toHaveBeenCalledExactlyOnceWith();
  });

  test('an error after an unsubscribe that threw still completes the observable', () => {
    let mut_onError: ((error?: unknown) => void) | undefined = undefined;

    const fail = (error: unknown): void => {
      mut_onError?.(error);
    };

    let mut_unsubscribeCount = 0;

    // Throws the first time only.
    const unsubscribe = vi.fn<() => void>(() => {
      mut_unsubscribeCount += 1;

      if (mut_unsubscribeCount === 1) {
        panic('unsubscribe failed');
      }
    });

    const observable$ = fromSubscribable<number, string>({
      subscribe: (_onNext, onError) => {
        mut_onError = onError;

        return { unsubscribe };
      },
    });

    expect(() => {
      observable$.complete();
    }).toThrow('unsubscribe failed');

    assert.isFalse(observable$.isCompleted);

    fail('boom');

    assert.isTrue(observable$.isCompleted);

    assert.deepStrictEqual(
      observable$.getSnapshot(),
      Optional.some(Result.err('boom')),
    );

    expect(unsubscribe).toHaveBeenCalledTimes(2);
  });

  test('nothing is taken after an error reported from inside an unsubscribe that throws', () => {
    let mut_onNext: ((value: number) => void) | undefined = undefined;

    let mut_onError: ((error?: unknown) => void) | undefined = undefined;

    const emit = (value: number): void => {
      mut_onNext?.(value);
    };

    const fail = (error: unknown): void => {
      mut_onError?.(error);
    };

    const unsubscribe = vi.fn<() => void>(() => {
      fail('aborted');
    });

    const observable$ = fromSubscribable<number, string>({
      subscribe: (onNext, onError) => {
        mut_onNext = onNext;

        mut_onError = onError;

        return { unsubscribe };
      },
    });

    const mut_history: Result<number, string>[] = [];

    observable$.subscribe((result) => {
      mut_history.push(result);

      if (Result.isErr(result)) {
        panic('thrown by the subscriber');
      }
    });

    expect(() => {
      observable$.complete();
    }).toThrow('thrown by the subscriber');

    emit(5);

    fail('again');

    // The error ended the subscribable's stream, so it ended the observable
    // too, although the completion that called `unsubscribe` threw.
    assert.isTrue(observable$.isCompleted);

    assert.deepStrictEqual(mut_history, [Result.err('aborted')]);

    expect(unsubscribe).toHaveBeenCalledExactlyOnceWith();
  });

  test('a completion reported from inside an unsubscribe that throws completes the observable once', () => {
    let mut_onComplete: (() => void) | undefined = undefined;

    const unsubscribe = vi.fn<() => void>(() => {
      mut_onComplete?.();

      panic('unsubscribe failed');
    });

    const observable$ = fromSubscribable<number>({
      subscribe: (_onNext, _onError, onComplete) => {
        mut_onComplete = onComplete;

        return { unsubscribe };
      },
    });

    expect(() => {
      observable$.complete();
    }).toThrow('unsubscribe failed');

    // The subscribable completed, so the observable did too, although
    // `unsubscribe` threw.
    assert.isTrue(observable$.isCompleted);

    observable$.complete();

    expect(unsubscribe).toHaveBeenCalledExactlyOnceWith();
  });

  test('a subscriber that completes the observable on an Err reported from inside unsubscribe leaves one unsubscribe', () => {
    let mut_onError: ((error?: unknown) => void) | undefined = undefined;

    const unsubscribe = vi.fn<() => void>(() => {
      mut_onError?.('aborted');
    });

    const observable$ = fromSubscribable<number, string>({
      subscribe: (_onNext, onError) => {
        mut_onError = onError;

        return { unsubscribe };
      },
    });

    observable$.subscribe((result) => {
      if (Result.isErr(result)) {
        observable$.complete();
      }
    });

    observable$.complete();

    assert.isTrue(observable$.isCompleted);

    expect(unsubscribe).toHaveBeenCalledExactlyOnceWith();
  });

  test('an error completes the observable even when a subscriber throws on the Err', () => {
    const { subscribable, fail, unsubscribe } = createManualSubscribable();

    const observable$ = fromSubscribable<number, string>(subscribable);

    observable$.subscribe((result) => {
      if (Result.isErr(result)) {
        panic('thrown by the subscriber');
      }
    });

    expect(() => {
      fail('boom');
    }).toThrow('thrown by the subscriber');

    assert.isTrue(observable$.isCompleted);

    expect(unsubscribe).toHaveBeenCalledExactlyOnceWith();
  });

  test('collectToArray resolves once the subscribable reports an error', async () => {
    const { subscribable, emit, fail } = createManualSubscribable();

    const collected = collectToArray(
      fromSubscribable<number, string>(subscribable),
    );

    emit(1);

    fail('boom');

    assert.deepStrictEqual(await collected, [Result.ok(1), Result.err('boom')]);
  });

  test('mergeMap releases an inner observable that errored during subscribe', () => {
    const trigger$ = source<number>();

    // Made in the projection, so it lives as long as the projection's scope,
    // which `mergeMap` disposes when it releases the inner observable.
    const mut_companions: Observable<number>[] = [];

    const merged$ = trigger$.pipe(
      mergeMap(() => {
        mut_companions.push(source<number>());

        return fromSubscribable<never, string>({
          subscribe: (_onNext, onError) => {
            onError?.('boom');

            return { unsubscribe: () => {} };
          },
        });
      }),
    );

    const mut_history: Result<never, string>[] = [];

    merged$.subscribe((result) => {
      mut_history.push(result);
    });

    trigger$.next(0);

    trigger$.next(1);

    assert.deepStrictEqual(mut_history, [
      Result.err('boom'),
      Result.err('boom'),
    ]);

    assert.isTrue(mut_companions.every((c) => c.isCompleted));
  });

  test('mergeMap releases an inner observable that errors while mergeMap holds it', () => {
    const trigger$ = source<number>();

    const mut_manuals: ReturnType<typeof createManualSubscribable>[] = [];

    // Made in the projection, so it lives as long as the projection's scope,
    // which `mergeMap` disposes when it releases the inner observable.
    const mut_companions: Observable<number>[] = [];

    const merged$ = trigger$.pipe(
      mergeMap(() => {
        const manual = createManualSubscribable();

        mut_manuals.push(manual);

        mut_companions.push(source<number>());

        return fromSubscribable<number, string>(manual.subscribable);
      }),
    );

    const mut_history: Result<number, string>[] = [];

    merged$.subscribe((result) => {
      mut_history.push(result);
    });

    trigger$.next(0);

    trigger$.next(1);

    mut_manuals[0]?.emit(10);

    mut_manuals[0]?.fail('boom');

    assert.deepStrictEqual(
      mut_companions.map((c) => c.isCompleted),
      [true, false],
    );

    expect(mut_manuals[1]?.unsubscribe).not.toHaveBeenCalled();

    mut_manuals[1]?.fail('bang');

    assert.deepStrictEqual(mut_history, [
      Result.ok(10),
      Result.err('boom'),
      Result.err('bang'),
    ]);

    assert.isTrue(mut_companions.every((c) => c.isCompleted));

    for (const manual of mut_manuals) {
      expect(manual.unsubscribe).toHaveBeenCalledExactlyOnceWith();
    }
  });

  test('a child that completes leaves the subscribable subscribed until the observable is completed', () => {
    const { subscribable, emit, unsubscribe } = createManualSubscribable();

    const observable$ = fromSubscribable(subscribable);

    const taken$ = observable$.pipe(take(1));

    taken$.subscribe(() => {});

    emit(1);

    emit(2);

    assert.isTrue(taken$.isCompleted);

    // Completion flows only downstream.
    assert.isFalse(observable$.isCompleted);

    expect(unsubscribe).not.toHaveBeenCalled();

    observable$.complete();

    expect(unsubscribe).toHaveBeenCalledExactlyOnceWith();
  });
});

const createManualSubscribable = (): Readonly<{
  subscribable: Subscribable<number>;
  emit: (value: number) => void;
  fail: (error: unknown) => void;
  completeSource: () => void;
  unsubscribe: () => void;
}> => {
  let mut_onNext: ((value: number) => void) | undefined = undefined;

  let mut_onError: ((error?: unknown) => void) | undefined = undefined;

  let mut_onComplete: (() => void) | undefined = undefined;

  const unsubscribe = vi.fn<() => void>(() => {
    mut_onNext = undefined;

    mut_onError = undefined;

    mut_onComplete = undefined;
  });

  return {
    subscribable: {
      subscribe: (onNext, onError, onComplete) => {
        mut_onNext = onNext;

        mut_onError = onError;

        mut_onComplete = onComplete;

        return { unsubscribe };
      },
    },
    emit: (value) => {
      mut_onNext?.(value);
    },
    fail: (error) => {
      mut_onError?.(error);
    },
    completeSource: () => {
      mut_onComplete?.();
    },
    unsubscribe,
  };
};
