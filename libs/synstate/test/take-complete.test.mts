import type { FixedLengthTuple } from 'ts-type-forge';
import {
  combine,
  createState,
  map,
  source,
  switchMap,
  take,
  withInitialValue,
} from '../src/index.mjs';

describe('take completion', () => {
  test('completes in the same update as its nth emission', () => {
    const num$ = source<number>();

    const taken$ = num$.pipe(take(3));

    const mut_events: string[] = [];

    taken$.subscribe(
      (x) => {
        mut_events.push(`next ${x}`);
      },
      () => {
        mut_events.push('complete');
      },
    );

    num$.next(1);

    num$.next(2);

    assert.isFalse(taken$.isCompleted);

    num$.next(3);

    assert.isTrue(taken$.isCompleted);

    assert.deepStrictEqual(mut_events, [
      'next 1',
      'next 2',
      'next 3',
      'complete',
    ]);

    num$.next(4);

    assert.deepStrictEqual(mut_events, [
      'next 1',
      'next 2',
      'next 3',
      'complete',
    ]);
  });

  test('take(1) completes on the first emission', () => {
    const num$ = source<number>();

    const taken$ = num$.pipe(take(1));

    const mut_history: number[] = [];

    taken$.subscribe((x) => {
      mut_history.push(x);
    });

    num$.next(10);

    assert.isTrue(taken$.isCompleted);

    assert.deepStrictEqual(mut_history, [10]);
  });

  test('passes the nth value on to its descendants before completing', () => {
    const num$ = source<number>();

    const taken$ = num$.pipe(take(2));

    const doubled$ = taken$.pipe(map((x) => x * 2));

    const mut_events: string[] = [];

    doubled$.subscribe(
      (x) => {
        mut_events.push(`next ${x}`);
      },
      () => {
        mut_events.push('complete');
      },
    );

    num$.next(1);

    num$.next(2);

    assert.isTrue(doubled$.isCompleted);

    assert.deepStrictEqual(mut_events, ['next 2', 'next 4', 'complete']);
  });

  test('a descendant that also reads another parent sees the nth value', () => {
    const num$ = source<number>();

    const taken$ = num$.pipe(take(2));

    const pair$ = combine([taken$, num$]);

    const mut_history: FixedLengthTuple<2, number>[] = [];

    pair$.subscribe((v) => {
      mut_history.push(v);
    });

    num$.next(1);

    num$.next(2);

    assert.isTrue(taken$.isCompleted);

    assert.deepStrictEqual(mut_history, [
      [1, 1],
      [2, 2],
    ]);
  });

  test('does not count the initial value', () => {
    const num$ = source<number>();

    const taken$ = num$.pipe(withInitialValue(0)).pipe(take(2));

    const mut_history: number[] = [];

    taken$.subscribe((x) => {
      mut_history.push(x);
    });

    num$.next(1);

    assert.isFalse(taken$.isCompleted);

    num$.next(2);

    assert.isTrue(taken$.isCompleted);

    assert.deepStrictEqual(mut_history, [0, 1, 2]);
  });

  test('completes over a source that emits exactly n times without waiting for it', () => {
    const [state, setState] = createState(0);

    const taken$ = state.pipe(take(2));

    const mut_completed: boolean[] = [];

    taken$.subscribe(
      () => {},
      () => {
        mut_completed.push(true);
      },
    );

    setState(1);

    setState(2);

    assert.deepStrictEqual(mut_completed, [true]);
  });

  test('completes after the nth value an inner observable emits', () => {
    const trigger$ = source<number>();

    const inner$ = source<number>();

    const taken$ = trigger$.pipe(switchMap(() => inner$)).pipe(take(2));

    const mut_events: string[] = [];

    taken$.subscribe(
      (x) => {
        mut_events.push(`next ${x}`);
      },
      () => {
        mut_events.push('complete');
      },
    );

    trigger$.next(0);

    inner$.next(1);

    inner$.next(2);

    assert.isTrue(taken$.isCompleted);

    assert.deepStrictEqual(mut_events, ['next 1', 'next 2', 'complete']);
  });
});
