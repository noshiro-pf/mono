import { Optional, expectType } from 'ts-data-forge';
import { source } from '../create/index.mjs';
import { map, withInitialValue } from '../operators/index.mjs';
import type {
  InitializedObservable,
  InitializedSyncChildObservable,
  Observable,
  SyncChildObservable,
} from '../types/index.mjs';
import { derive } from './derive.mjs';

describe(derive, () => {
  test('emits the projection of the latest values, once every parent has one', () => {
    const a$ = source<number>();

    const b$ = source<string>();

    const label$ = derive([a$, b$], (a, b) => `${b}${a.toString()}`);

    const mut_history: string[] = [];

    label$.subscribe((v) => {
      mut_history.push(v);
    });

    a$.next(1);

    assert.deepStrictEqual(mut_history, []);

    b$.next('x');

    a$.next(2);

    b$.next('y');

    assert.deepStrictEqual(mut_history, ['x1', 'x2', 'y2']);
  });

  test('is one observable: a diamond updates it once per write', () => {
    const counter$ = source<number>(0);

    const doubled$ = counter$.pipe(map((x) => x * 2));

    const tripled$ = counter$.pipe(map((x) => x * 3));

    let mut_calls = 0;

    const sum$ = derive([doubled$, tripled$], (d, t) => {
      mut_calls += 1;

      return d + t;
    });

    const mut_history: number[] = [];

    sum$.subscribe((v) => {
      mut_history.push(v);
    });

    counter$.next(1);

    counter$.next(2);

    assert.deepStrictEqual(mut_history, [0, 5, 10]);

    assert.strictEqual(mut_calls, 3);

    assert.deepStrictEqual(sum$.parents, [doubled$, tripled$]);
  });

  test('computes the initial value when every parent has one', () => {
    const a$ = source<number>(1);

    const b$ = source<number>(2);

    const sum$ = derive([a$, b$], (a, b) => a + b);

    assert.deepStrictEqual(sum$.getSnapshot(), Optional.some(3));

    const c$ = source<number>();

    const partial$ = derive([a$, c$], (a, c) => a + c);

    assert.isTrue(Optional.isNone(partial$.getSnapshot()));
  });

  test('a result equal by Object.is to the one held is not emitted', () => {
    const a$ = source<number>(1);

    const b$ = source<number>(2);

    const parity$ = derive([a$, b$], (a, b) => (a + b) % 2);

    const mut_history: number[] = [];

    parity$.subscribe((v) => {
      mut_history.push(v);
    });

    a$.next(3);

    b$.next(4);

    a$.next(4);

    assert.deepStrictEqual(mut_history, [1, 0]);
  });

  test('`equals` replaces Object.is', () => {
    const a$ = source<number>(1);

    const b$ = source<number>(2);

    const pair$ = derive([a$, b$], (a, b) => ({ total: a + b }), {
      equals: (x, y) => x.total === y.total,
    });

    const mut_history: number[] = [];

    pair$.subscribe(({ total }) => {
      mut_history.push(total);
    });

    a$.next(2);

    // A new object with the same total: equal by `equals`, not by Object.is.
    a$.next(2);

    b$.next(1);

    b$.next(5);

    assert.deepStrictEqual(mut_history, [3, 4, 3, 7]);
  });

  test('a write from one parent does not reuse a value another update left', () => {
    const a$ = source<number>(1);

    const b$ = source<number>(10);

    const xs$ = derive([a$, b$], (...values) => values);

    const mut_history: (readonly number[])[] = [];

    xs$.subscribe((v) => {
      mut_history.push(v);
    });

    a$.next(2);

    b$.next(20);

    assert.deepStrictEqual(mut_history, [
      [1, 10],
      [2, 10],
      [2, 20],
    ]);

    // Each emission is its own array, so a held value is never changed by a
    // later update.
    assert.notStrictEqual(mut_history[0], mut_history[1]);
  });

  test('types', () => {
    const s1: Observable<1> = source<1>();

    const s2: InitializedObservable<2> = source<2>().pipe(withInitialValue(2));

    const p = derive([s1, s2], (a, b) => {
      expectType<typeof a, 1>('=');

      expectType<typeof b, 2>('=');

      return 'x' as const;
    });

    expectType<typeof p, SyncChildObservable<'x', readonly [1, 2]>>('=');

    const s3: InitializedObservable<3> = source<3>().pipe(withInitialValue(3));

    const _q = derive([s2, s3], (a, b) => a + b);

    expectType<
      typeof _q,
      InitializedSyncChildObservable<number, readonly [2, 3]>
    >('=');

    expect(p).toBeDefined();
  });
});
