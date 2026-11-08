import { createValueEmitter, takeWhile } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('the last value, without completion', () => {
    // embed-sample-code-ignore-above
    const [progress, report] = createValueEmitter<number>();

    // `inclusive` passes the value that ends it, so `settled` is already true
    // when the subscriber receives that value.
    const upload = progress.pipe(
      takeWhile((p) => p < 100, { inclusive: true }),
    );

    const mut_log: string[] = [];

    upload.subscribe((p) => {
      mut_log.push(upload.settled ? `done at ${p}` : `${p}%`);
    });

    report(30);

    report(100);

    report(40);

    assert.deepStrictEqual(mut_log, ['30%', 'done at 100']);

    // Or the producer sends the end as a value.
    const [transfer, send] =
      createValueEmitter<
        Readonly<{ done: false; percent: number } | { done: true }>
      >();

    const mut_transferLog: string[] = [];

    transfer.subscribe((t) => {
      mut_transferLog.push(t.done ? 'done' : `${t.percent}%`);
    });

    send({ done: false, percent: 30 });

    send({ done: true });

    assert.deepStrictEqual(mut_transferLog, ['30%', 'done']);
    // embed-sample-code-ignore-below
  });
}
