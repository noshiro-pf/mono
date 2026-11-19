import { source } from '../create/index.mjs';
import { skipUntil } from './skip-until.mjs';
import { takeUntil } from './take-until.mjs';

describe('a notifier that completes without emitting', () => {
  test('completes takeUntil', () => {
    const num$ = source<number>();

    const notifier = source<undefined>();

    const limited$ = num$.pipe(takeUntil(notifier));

    const mut_seen: number[] = [];

    limited$.subscribe((x) => {
      mut_seen.push(x);
    });

    num$.next(1);

    notifier.complete();

    num$.next(2);

    assert.isTrue(limited$.isCompleted);

    assert.deepStrictEqual(mut_seen, [1]);
  });

  test('completes takeUntil at once when it has completed already', () => {
    const notifier = source<undefined>();

    notifier.complete();

    const limited$ = source<number>().pipe(takeUntil(notifier));

    assert.isTrue(limited$.isCompleted);
  });

  test("ends skipUntil's skipping", () => {
    const num$ = source<number>();

    const notifier = source<undefined>();

    const skipped$ = num$.pipe(skipUntil(notifier));

    const mut_seen: number[] = [];

    skipped$.subscribe((x) => {
      mut_seen.push(x);
    });

    num$.next(1);

    notifier.complete();

    num$.next(2);

    num$.next(3);

    assert.deepStrictEqual(mut_seen, [2, 3]);
  });

  test('leaves skipUntil not skipping when it has completed already', () => {
    const notifier = source<undefined>();

    notifier.complete();

    const num$ = source<number>();

    const skipped$ = num$.pipe(skipUntil(notifier));

    const mut_seen: number[] = [];

    skipped$.subscribe((x) => {
      mut_seen.push(x);
    });

    num$.next(1);

    assert.deepStrictEqual(mut_seen, [1]);
  });
});
