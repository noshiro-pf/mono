import { createState, derive, map } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('a write from a subscriber starts the next round', () => {
    // embed-sample-code-ignore-above
    // Kept in step by a subscriber (avoid this):
    const [celsius, setCelsius] = createState(0);

    const [fahrenheit, setFahrenheit] = createState(32);

    celsius.subscribe((c) => {
      setFahrenheit((c * 9) / 5 + 32);
    });

    const label = derive([celsius, fahrenheit], (c, f) => `${c}°C = ${f}°F`);

    const mut_labels: string[] = [];

    label.subscribe((text) => {
      mut_labels.push(text);
    });

    setCelsius(100);

    // The subscriber's write is an update of its own, so `label` showed the
    // update half done.
    assert.deepStrictEqual(mut_labels, [
      '0°C = 32°F',
      '100°C = 32°F',
      '100°C = 212°F',
    ]);

    // Derived instead: one update, nothing half done.
    const [celsius2, setCelsius2] = createState(0);

    const fahrenheit2 = celsius2.pipe(map((c) => (c * 9) / 5 + 32));

    const label2 = derive([celsius2, fahrenheit2], (c, f) => `${c}°C = ${f}°F`);

    const mut_labels2: string[] = [];

    label2.subscribe((text) => {
      mut_labels2.push(text);
    });

    setCelsius2(100);

    assert.deepStrictEqual(mut_labels2, ['0°C = 32°F', '100°C = 212°F']);

    // embed-sample-code-ignore-below
  });
}
