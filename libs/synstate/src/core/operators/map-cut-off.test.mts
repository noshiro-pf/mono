import { expectType } from 'ts-data-forge';
import { combine } from '../combine/index.mjs';
import { source } from '../create/index.mjs';
import { mapTo, withIndex } from '../predefined/index.mjs';
import type { Observable } from '../types/index.mjs';
import { map } from './map.mjs';

describe('map stops a result equal to the one it holds', () => {
  test('a result equal by Object.is is not emitted', () => {
    const a$ = source<number>();

    const parity$ = a$.pipe(map((x) => x % 2));

    const mut_history: number[] = [];

    parity$.subscribe((p) => {
      mut_history.push(p);
    });

    a$.next(1);

    a$.next(3);

    a$.next(4);

    a$.next(6);

    a$.next(7);

    assert.deepStrictEqual(mut_history, [1, 0, 1]);
  });

  test('the value computed from an initial value counts as the one held', () => {
    const a$ = source<number>(1);

    const parity$ = a$.pipe(map((x) => x % 2));

    const mut_history: number[] = [];

    parity$.subscribe((p) => {
      mut_history.push(p);
    });

    a$.next(3);

    a$.next(4);

    assert.deepStrictEqual(mut_history, [1, 0]);
  });

  test('a node below is not woken when the result is equal', () => {
    const a$ = source<number>(1);

    const parity$ = a$.pipe(map((x) => x % 2));

    let mut_calls = 0;

    const label$ = parity$.pipe(
      map((p) => {
        mut_calls += 1;

        return p === 0 ? 'even' : 'odd';
      }),
    );

    label$.subscribe(() => {});

    const callsAfterSetup = mut_calls;

    a$.next(3);

    a$.next(5);

    assert.strictEqual(mut_calls, callsAfterSetup);

    a$.next(6);

    assert.strictEqual(mut_calls, callsAfterSetup + 1);
  });

  test('a node reading a stopped map and another parent still updates once', () => {
    const a$ = source<number>(1);

    const parity$ = a$.pipe(map((x) => x % 2));

    const mut_history: string[] = [];

    combine([a$, parity$]).subscribe(([a, p]) => {
      mut_history.push(`${a.toString()},${p.toString()}`);
    });

    a$.next(3);

    a$.next(4);

    assert.deepStrictEqual(mut_history, ['1,1', '3,1', '4,0']);
  });

  test('NaN equals NaN, and 0 differs from -0, as Object.is says', () => {
    const a$ = source<number>();

    const r$ = a$.pipe(map((x) => x));

    const mut_history: number[] = [];

    r$.subscribe((v) => {
      mut_history.push(v);
    });

    a$.next(Number.NaN);

    a$.next(Number.NaN);

    a$.next(0);

    a$.next(-0);

    assert.deepStrictEqual(mut_history, [Number.NaN, 0, -0]);
  });

  test('`equals` replaces Object.is', () => {
    const a$ = source<Readonly<{ id: number; name: string }>>();

    const id$ = a$.pipe(
      map((x) => ({ id: x.id }), { equals: (p, q) => p.id === q.id }),
    );

    const mut_history: number[] = [];

    id$.subscribe(({ id }) => {
      mut_history.push(id);
    });

    a$.next({ id: 1, name: 'a' });

    a$.next({ id: 1, name: 'b' });

    a$.next({ id: 2, name: 'b' });

    assert.deepStrictEqual(mut_history, [1, 2]);
  });

  test('`equals: () => false` emits every result', () => {
    const click$ = source<undefined>();

    const one$ = click$.pipe(map(() => 1, { equals: () => false }));

    const mut_history: number[] = [];

    one$.subscribe((v) => {
      mut_history.push(v);
    });

    click$.next(undefined);

    click$.next(undefined);

    assert.deepStrictEqual(mut_history, [1, 1]);
  });

  test('the mapping function no longer receives an index', () => {
    const a$ = source<number>();

    // @ts-expect-error `map` passes the value alone; use `withIndex`.
    const r$ = a$.pipe(map((x: number, i: number) => x + i));

    expect(r$).toBeDefined();
  });
});

describe('operators that turn events into values emit every event', () => {
  test('mapTo emits its value on every event', () => {
    const reset$ = source<undefined>();

    const action$ = reset$.pipe(mapTo('reset'));

    expectType<typeof action$, Observable<'reset'>>('=');

    const mut_history: string[] = [];

    action$.subscribe((v) => {
      mut_history.push(v);
    });

    reset$.next(undefined);

    reset$.next(undefined);

    assert.deepStrictEqual(mut_history, ['reset', 'reset']);
  });

  test('withIndex counts from 0, and gives -1 to an initial value', () => {
    const a$ = source<string>('init');

    const indexed$ = a$.pipe(withIndex());

    assert.deepStrictEqual(indexed$.getSnapshot().value, [-1, 'init']);

    const mut_history: (readonly [number, string])[] = [];

    indexed$.subscribe((v) => {
      mut_history.push(v);
    });

    a$.next('x');

    a$.next('x');

    assert.deepStrictEqual(mut_history, [
      [-1, 'init'],
      [0, 'x'],
      [1, 'x'],
    ]);
  });
});
