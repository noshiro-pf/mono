import { computed, effect, signal } from '@preact/signals';
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

  test('does not emit again when a signal read by a subscriber changes', () => {
    const mut_input = signal('a');

    const mut_other = signal(0);

    const [input$, dispose] = fromSignal(mut_input);

    const mut_seen: string[] = [];

    input$.subscribe((value) => {
      mut_seen.push(`${value}:${mut_other.value}`);
    });

    mut_input.value = 'b';

    mut_other.value = 1;

    mut_other.value = 2;

    assert.deepStrictEqual(mut_seen, ['a:0', 'b:0']);

    dispose();
  });

  test('does not emit again when a signal read by a projection changes', () => {
    const mut_input = signal(1);

    const mut_factor = signal(10);

    const [input$, dispose] = fromSignal(mut_input);

    const mut_seen: number[] = [];

    input$.pipe(map((n) => n * mut_factor.value)).subscribe((value) => {
      mut_seen.push(value);
    });

    mut_input.value = 2;

    mut_factor.value = 100;

    mut_input.value = 3;

    assert.deepStrictEqual(mut_seen, [10, 20, 300]);

    dispose();
  });

  test('does not make an effect that calls it depend on the signal', () => {
    const mut_input = signal(1);

    const mut_runs = { count: 0 };

    const mut_seen: number[] = [];

    const stop = effect(() => {
      mut_runs.count += 1;

      const [input$, dispose] = fromSignal(mut_input);

      input$.subscribe((value) => {
        mut_seen.push(value);
      });

      return dispose;
    });

    mut_input.value = 2;

    assert.strictEqual(mut_runs.count, 1);

    assert.deepStrictEqual(mut_seen, [1, 2]);

    stop();
  });

  // The computed creates a bridge only to show what it comes to depend on. A
  // computed that runs again leaves the bridge its last run made undisposed, so
  // code that needs a bridge makes it in an effect and returns `dispose`, as
  // the effect test does. A run that fails leaves a bridge on this test's own
  // signal, which no other test writes.
  test('does not make a computed that calls it depend on the signal', () => {
    const mut_input = signal(1);

    const mut_runs = { count: 0 };

    const bridged = computed(() => {
      mut_runs.count += 1;

      return fromSignal(mut_input);
    });

    const [input$, dispose] = bridged.value;

    mut_input.value = 2;

    // A computed runs again only when it is read, so read it before counting.
    assert.strictEqual(bridged.value[0], input$);

    assert.strictEqual(mut_runs.count, 1);

    dispose();
  });

  test('follows a signal that has no subscribe method, as core 1.0 makes', () => {
    const mut_input = signal(1);

    const mut_legacy = computed(() => mut_input.value);

    Object.defineProperty(mut_legacy, 'subscribe', { value: undefined });

    const [input$, dispose] = fromSignal(mut_legacy);

    const mut_seen: number[] = [];

    input$.subscribe((value) => {
      mut_seen.push(value);
    });

    mut_input.value = 2;

    dispose();

    mut_input.value = 3;

    assert.deepStrictEqual(mut_seen, [1, 2]);
  });
});
