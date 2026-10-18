import { Result } from 'ts-data-forge';
import { take } from '../predefined/index.mjs';
import type { Subscribable } from '../types/index.mjs';
import { fromSubscribable } from './from-subscribable.mjs';

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
