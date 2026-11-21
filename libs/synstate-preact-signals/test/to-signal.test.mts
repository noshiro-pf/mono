import { effect } from '@preact/signals';
import { map, source, state } from 'synstate';
import { toSignal } from '../src/index.mjs';

describe(toSignal, () => {
  test('starts at the observable value and follows every emission', () => {
    const count$ = state<number>(0);

    const countSignal = toSignal(count$);

    assert.strictEqual(countSignal.value, 0);

    count$.set(1);

    assert.strictEqual(countSignal.value, 1);

    count$.set(42);

    assert.strictEqual(countSignal.value, 42);
  });

  test('holds the fallback until an observable without an initial value emits', () => {
    const count$ = source<number>();

    const countSignal = toSignal(count$, -1);

    assert.strictEqual(countSignal.value, -1);

    count$.emit(7);

    assert.strictEqual(countSignal.value, 7);
  });

  test('starts at a held undefined rather than the fallback', () => {
    const value$ = state<number | undefined>(undefined);

    const valueSignal = toSignal(value$, -1);

    assert.strictEqual(valueSignal.value, undefined);
  });

  test('holds undefined until an observable without an initial value emits', () => {
    const count$ = source<number>();

    const countSignal = toSignal(count$);

    assert.strictEqual(countSignal.value, undefined);

    count$.emit(7);

    assert.strictEqual(countSignal.value, 7);
  });

  test('notifies the signal subscribers of the observable emissions', () => {
    const count$ = state<number>(0);

    const doubledSignal = toSignal(count$.pipe(map((n) => n * 2)));

    const mut_seen: number[] = [];

    const dispose = effect(() => {
      mut_seen.push(doubledSignal.value);
    });

    count$.set(1);

    count$.set(2);

    dispose();

    count$.set(3);

    assert.deepStrictEqual(mut_seen, [0, 2, 4]);
  });
});
