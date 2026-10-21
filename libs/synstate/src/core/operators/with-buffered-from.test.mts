import { toNode } from '../class/index.mjs';
import { source } from '../create/index.mjs';
import { withBufferedFrom } from './with-buffered-from.mjs';

describe('withBufferedFrom teardown', () => {
  test('unsubscribes from the buffered observable on complete', () => {
    const data$ = source<string>();

    const trigger$ = source<number>();

    const result$ = trigger$.pipe(withBufferedFrom(data$));

    assert.isTrue(toNode(data$).hasSubscriber);

    result$.complete();

    assert.isTrue(result$.isCompleted);

    assert.isFalse(toNode(data$).hasSubscriber);
  });

  test('unsubscribes from the buffered observable when the parent completes', () => {
    const data$ = source<string>();

    const trigger$ = source<number>();

    const result$ = trigger$.pipe(withBufferedFrom(data$));

    trigger$.complete();

    assert.isTrue(result$.isCompleted);

    assert.isFalse(toNode(data$).hasSubscriber);
  });

  test('keeps buffering while subscribed', () => {
    const data$ = source<string>();

    const trigger$ = source<number>();

    const result$ = trigger$.pipe(withBufferedFrom(data$));

    const mut_history: (readonly [number, readonly string[]])[] = [];

    result$.subscribe((v) => {
      mut_history.push(v);
    });

    data$.next('A');

    data$.next('B');

    trigger$.next(1);

    assert.deepStrictEqual(mut_history, [[1, ['A', 'B']]]);
  });
});
