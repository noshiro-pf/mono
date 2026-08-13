import { computed, signal } from '@preact/signals';
import { map } from 'synstate';
import { fromSignal } from '../src/index.mjs';

describe(fromSignal, () => {
  test('emits the current value and then every assignment', () => {
    const mut_input = signal('hello');

    const [input$, dispose] = fromSignal(mut_input);

    const mut_seen: string[] = [];

    input$.subscribe((value) => {
      mut_seen.push(value);
    });

    assert.deepStrictEqual(mut_seen, ['hello']);

    mut_input.value = 'world';

    assert.deepStrictEqual(mut_seen, ['hello', 'world']);

    dispose();
  });

  test('stops tracking the signal once disposed', () => {
    const mut_input = signal(0);

    const [input$, dispose] = fromSignal(mut_input);

    const mut_seen: number[] = [];

    input$.subscribe((value) => {
      mut_seen.push(value);
    });

    mut_input.value = 1;

    dispose();

    mut_input.value = 2;

    assert.deepStrictEqual(mut_seen, [0, 1]);
  });

  test('accepts a ReadonlySignal and feeds the operator chain', () => {
    const mut_input = signal(1);

    const [doubled$, dispose] = fromSignal(computed(() => mut_input.value * 2));

    const mut_seen: number[] = [];

    doubled$.pipe(map((n) => n + 1)).subscribe((value) => {
      mut_seen.push(value);
    });

    mut_input.value = 5;

    dispose();

    assert.deepStrictEqual(mut_seen, [3, 11]);
  });
});
