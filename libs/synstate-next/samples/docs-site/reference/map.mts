import { createState, map } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('map', () => {
    // embed-sample-code-ignore-above
    const [celsius, setCelsius] = createState(0);

    const fahrenheit = celsius.pipe(map((c) => (c * 9) / 5 + 32));

    setCelsius(100);

    assert.strictEqual(fahrenheit.value, 212);

    // embed-sample-code-ignore-below
  });
}
