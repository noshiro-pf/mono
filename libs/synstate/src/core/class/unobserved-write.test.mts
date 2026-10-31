import type { FixedLengthTuple } from 'ts-type-forge';
import { createState } from '../../utils/index.mjs';
import { derive, merge } from '../combine/index.mjs';
import { source } from '../create/index.mjs';
import { debounce, map, switchMap } from '../operators/index.mjs';
import { writeDuringPropagationWarning } from './root-observable-class.mjs';

// A write to an observable with no child and no subscriber stores the value
// without opening an update (`ManagerObservableClass.startUpdate`). These pin
// what that must not change.
describe('a write nothing observes', () => {
  test('is held, and a later subscriber receives the last one', () => {
    const s$ = source<number>(0);

    s$.next(1);

    s$.next(2);

    const mut_history: number[] = [];

    s$.subscribe((v) => {
      mut_history.push(v);
    });

    assert.deepStrictEqual(mut_history, [2]);
  });

  test('gets a token of its own each time', () => {
    const s$ = source<number>(0);

    const before = s$.updateToken;

    s$.next(1);

    const first = s$.updateToken;

    s$.next(2);

    assert.notStrictEqual(first, before);

    assert.notStrictEqual(s$.updateToken, first);
  });

  test('is held after the last subscriber leaves', () => {
    const [s$, setS] = createState(0);

    const subscription = s$.subscribe(() => {});

    subscription.unsubscribe();

    assert.strictEqual(setS(5), 5);

    const mut_history: number[] = [];

    s$.subscribe((v) => {
      mut_history.push(v);
    });

    assert.deepStrictEqual(mut_history, [5]);
  });

  test('is where a child created later starts, and later writes reach it', () => {
    const s$ = source<number>(0);

    s$.next(3);

    const mut_history: number[] = [];

    s$.pipe(map((x) => x * 10)).subscribe((v) => {
      mut_history.push(v);
    });

    s$.next(4);

    assert.deepStrictEqual(mut_history, [30, 40]);
  });

  test('is not taken for an emission of an update another parent starts', () => {
    const a$ = source<number>(0);

    const b$ = source<number>(0);

    a$.next(5);

    const mut_merged: number[] = [];

    merge([a$, b$]).subscribe((v) => {
      mut_merged.push(v);
    });

    const mut_derived: FixedLengthTuple<2, number>[] = [];

    derive([a$, b$], (a, b) => [a, b] as const).subscribe((v) => {
      mut_derived.push(v);
    });

    b$.next(1);

    a$.next(6);

    // merge passes on the parents that emitted in an update: only b$, then only
    // a$, never the value a$ was given while nothing observed it.
    assert.deepStrictEqual(mut_merged, [1, 6]);

    assert.deepStrictEqual(mut_derived, [
      [5, 0],
      [5, 1],
      [6, 1],
    ]);
  });

  test('by an async child is held, as a root write is', () => {
    vi.useFakeTimers();

    const s$ = source<number>(0);

    const debounced$ = s$.pipe(debounce(100));

    const subscription = debounced$.subscribe(() => {});

    subscription.unsubscribe();

    // debounced$ keeps its parent, but has no observer of its own when the
    // timer fires.
    s$.next(1);

    vi.runAllTimers();

    const mut_history: number[] = [];

    debounced$.subscribe((v) => {
      mut_history.push(v);
    });

    s$.next(2);

    vi.runAllTimers();

    assert.deepStrictEqual(mut_history, [1, 2]);

    vi.useRealTimers();
  });

  test('by a switchMap inner after the switchMap lost its observers is held', () => {
    const selector$ = source<number>(0);

    const branch$ = source<number>(10);

    const switched$ = selector$.pipe(switchMap(() => branch$));

    const subscription = switched$.subscribe(() => {});

    // switchMap follows an inner once the selector emits.
    selector$.next(1);

    subscription.unsubscribe();

    branch$.next(11);

    const mut_history: number[] = [];

    switched$.pipe(map((x) => x * 2)).subscribe((v) => {
      mut_history.push(v);
    });

    branch$.next(12);

    assert.deepStrictEqual(mut_history, [22, 24]);
  });

  test('from a subscriber still warns as a write during propagation', () => {
    const [a$, setA] = createState(0);

    const [, setB] = createState(0);

    a$.subscribe((a) => {
      setB(a);
    });

    const warn = vi.fn();

    vi.stubGlobal('console', { ...console, warn });

    setA(1);

    // cspell:disable-next-line
    vi.unstubAllGlobals();

    assert.deepStrictEqual(
      warn.mock.calls.map((args: readonly unknown[]) => args[0]),
      [writeDuringPropagationWarning],
    );
  });
});
