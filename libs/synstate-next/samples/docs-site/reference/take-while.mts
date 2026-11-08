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

    // embed-sample-code-ignore-below
  });
}
