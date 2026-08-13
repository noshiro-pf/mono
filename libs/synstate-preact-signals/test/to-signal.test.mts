import { effect } from '@preact/signals';
import { map, source } from 'synstate';
import { toSignal } from '../src/index.mjs';

describe(toSignal, () => {
  test('starts at the observable value and follows every emission', () => {
    const count$ = source<number>(0);

    const countSignal = toSignal(count$);

    assert.strictEqual(countSignal.value, 0);

    count$.next(1);

    assert.strictEqual(countSignal.value, 1);

    count$.next(42);

    assert.strictEqual(countSignal.value, 42);
  });

  test('holds the fallback until an observable without an initial value emits', () => {
    const count$ = source<number>();

    const countSignal = toSignal(count$, -1);

    assert.strictEqual(countSignal.value, -1);

    count$.next(7);

    assert.strictEqual(countSignal.value, 7);
  });

  test('holds undefined until an observable without an initial value emits', () => {
    const count$ = source<number>();

    const countSignal = toSignal(count$);

    assert.strictEqual(countSignal.value, undefined);

    count$.next(7);

    assert.strictEqual(countSignal.value, 7);
  });

  test('notifies the signal subscribers of the observable emissions', () => {
    const count$ = source<number>(0);

    const doubledSignal = toSignal(count$.pipe(map((n) => n * 2)));

    const mut_seen: number[] = [];

    const dispose = effect(() => {
      mut_seen.push(doubledSignal.value);
    });

    count$.next(1);

    count$.next(2);

    dispose();

    count$.next(3);

    assert.deepStrictEqual(mut_seen, [0, 2, 4]);
  });
});
