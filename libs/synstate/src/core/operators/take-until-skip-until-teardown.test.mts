import { source } from '../create/index.mjs';
import { take } from '../predefined/index.mjs';
import { skipUntil } from './skip-until.mjs';
import { takeUntil } from './take-until.mjs';

describe('takeUntil releases the notifier', () => {
  test('when the result is completed before the notifier emits', () => {
    const notifier$ = source<undefined>();

    const result$ = source<number>().pipe(takeUntil(notifier$));

    assert.isTrue(notifier$.hasSubscriber);

    result$.complete();

    assert.isFalse(notifier$.hasSubscriber);
  });

  test('when the parent completes', () => {
    const notifier$ = source<undefined>();

    const num$ = source<number>();

    num$.pipe(takeUntil(notifier$));

    num$.complete();

    assert.isFalse(notifier$.hasSubscriber);
  });

  test('when the downstream completes', () => {
    const notifier$ = source<undefined>();

    const num$ = source<number>();

    const taken$ = num$.pipe(takeUntil(notifier$)).pipe(take(1));

    taken$.subscribe(() => {});

    // `take(n)` completes on the emission after its `n`th.
    num$.next(1);

    num$.next(2);

    assert.isTrue(taken$.isCompleted);

    assert.isFalse(notifier$.hasSubscriber);
  });

  test('when the notifier emits', () => {
    const notifier$ = source<undefined>();

    const result$ = source<number>().pipe(takeUntil(notifier$));

    notifier$.next(undefined);

    assert.isTrue(result$.isCompleted);

    assert.isFalse(notifier$.hasSubscriber);
  });

  test('when the notifier has already emitted', () => {
    const notifier$ = source<number>(0);

    const result$ = source<number>().pipe(takeUntil(notifier$));

    assert.isTrue(result$.isCompleted);

    assert.isFalse(notifier$.hasSubscriber);
  });
});

describe('skipUntil releases the notifier', () => {
  test('when the notifier emits', () => {
    const notifier$ = source<undefined>();

    const num$ = source<number>();

    const result$ = num$.pipe(skipUntil(notifier$));

    const mut_history: number[] = [];

    result$.subscribe((x) => {
      mut_history.push(x);
    });

    num$.next(1);

    notifier$.next(undefined);

    assert.isFalse(notifier$.hasSubscriber);

    num$.next(2);

    assert.deepStrictEqual(mut_history, [2]);
  });

  test('when the notifier has already emitted', () => {
    const notifier$ = source<number>(0);

    const num$ = source<number>();

    const result$ = num$.pipe(skipUntil(notifier$));

    const mut_history: number[] = [];

    result$.subscribe((x) => {
      mut_history.push(x);
    });

    assert.isFalse(notifier$.hasSubscriber);

    num$.next(1);

    assert.deepStrictEqual(mut_history, [1]);
  });

  test('when the result is completed before the notifier emits', () => {
    const notifier$ = source<undefined>();

    const result$ = source<number>().pipe(skipUntil(notifier$));

    result$.complete();

    assert.isFalse(notifier$.hasSubscriber);
  });
});
