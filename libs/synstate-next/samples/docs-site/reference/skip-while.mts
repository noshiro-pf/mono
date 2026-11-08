import { createValueEmitter, skipWhile } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('skip-while', () => {
    // embed-sample-code-ignore-above
    const [temperature, read] = createValueEmitter<number>();

    // Ignore the readings until the sensor has warmed up.
    const warm = temperature.pipe(skipWhile((t) => t < 20));

    const mut_seen: number[] = [];

    warm.subscribe((t) => {
      mut_seen.push(t);
    });

    read(5);

    read(21);

    read(18);

    assert.deepStrictEqual(mut_seen, [21, 18]);

    // embed-sample-code-ignore-below
  });
}
