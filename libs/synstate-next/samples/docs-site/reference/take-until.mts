import {
  createEventEmitter,
  createValueEmitter,
  takeUntil,
} from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('take-until', () => {
    // embed-sample-code-ignore-above
    const [moved, move] = createValueEmitter<number>();

    const [released, release] = createEventEmitter();

    const drag = moved.pipe(takeUntil(released));

    const mut_seen: number[] = [];

    drag.subscribe((x) => {
      mut_seen.push(x);
    });

    move(1);

    move(2);

    release();

    move(3);

    assert.deepStrictEqual(mut_seen, [1, 2]);

    // embed-sample-code-ignore-below
  });
}
