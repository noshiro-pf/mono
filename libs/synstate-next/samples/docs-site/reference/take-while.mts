import { createValueEmitter, takeWhile } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('take-while', () => {
    // embed-sample-code-ignore-above
    const [progress, report] = createValueEmitter<number>();

    const running = progress.pipe(takeWhile((p) => p < 100));

    const mut_seen: number[] = [];

    running.subscribe((p) => {
      mut_seen.push(p);
    });

    report(30);

    report(80);

    report(100);

    report(40);

    assert.deepStrictEqual(mut_seen, [30, 80]);

    // `inclusive` passes the value that ends it too, and is settled by the time
    // a subscriber receives it.
    const [step, advance] = createValueEmitter<number>();

    const steps = step.pipe(takeWhile((p) => p < 3, { inclusive: true }));

    const mut_steps: (readonly [number, boolean])[] = [];

    steps.subscribe((p) => {
      mut_steps.push([p, steps.settled]);
    });

    advance(1);

    advance(3);

    advance(1);

    assert.deepStrictEqual(mut_steps, [
      [1, false],
      [3, true],
    ]);

    // embed-sample-code-ignore-below
  });
}
