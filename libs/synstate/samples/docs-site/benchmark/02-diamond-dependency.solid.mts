import {
  createEffect,
  createMemo,
  createRoot,
  createSignal,
} from './solid-js-client.mjs';

// embed-sample-code-ignore-above
export const runBenchmark = (n: number): number => {
  let mut_lastValue = 0;

  const { setCounter, dispose } = createRoot((disposeRoot) => {
    const [counter, setCounterValue] = createSignal(0);

    const doubled = createMemo(() => counter() * 2);

    const tripled = createMemo(() => counter() * 3);

    const sum = createMemo(() => doubled() + tripled());

    createEffect(() => {
      mut_lastValue = sum();
    });

    return { setCounter: setCounterValue, dispose: disposeRoot };
  });

  for (let mut_i = 1; mut_i <= n; mut_i++) {
    setCounter(mut_i);
  }

  dispose();

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('diamond-dependency benchmark (Solid)', () => {
    const result = runBenchmark(1000);

    assert.strictEqual(result, 1000 * 5);
  });
}
