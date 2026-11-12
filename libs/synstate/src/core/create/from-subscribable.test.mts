import { Optional, Result } from 'ts-data-forge';
import { combine } from '../combine/index.mjs';
import { take } from '../operators/index.mjs';
import type { Subscribable } from '../types/index.mjs';
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
  completeSource: () => void;
  unsubscribe: () => void;
}> => {
  let mut_onNext: ((value: number) => void) | undefined = undefined;

  let mut_onComplete: (() => void) | undefined = undefined;

  const unsubscribe = vi.fn<() => void>(() => {
    mut_onNext = undefined;

    mut_onComplete = undefined;
  });

  return {
    subscribable: {
      subscribe: (onNext, _onError, onComplete) => {
        mut_onNext = onNext;

        mut_onComplete = onComplete;

        return { unsubscribe };
      },
    },
    emit: (value) => {
      mut_onNext?.(value);
    },
    completeSource: () => {
      mut_onComplete?.();
    },
    unsubscribe,
  };
};
