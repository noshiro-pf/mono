import { source } from 'synstate-next';
import { Optional } from 'ts-std-forge';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('source', () => {
    // embed-sample-code-ignore-above
    const ticks = source<number>();

    // An event source holds no value until its first `emit`.
    assert.isTrue(Optional.isNone(ticks.getSnapshot()));

    const mut_seen: number[] = [];

    ticks.subscribe((n) => {
      mut_seen.push(n);
    });

    ticks.emit(1);

    ticks.emit(1);

    assert.deepStrictEqual(mut_seen, [1, 1]);

    // embed-sample-code-ignore-below
  });
}
