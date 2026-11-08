import {
  createEventEmitter,
  createValueEmitter,
  withBufferedFrom,
} from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('with-buffered-from', () => {
    // embed-sample-code-ignore-above
    const [logged, log] = createValueEmitter<string>();

    const [flushed, flush] = createEventEmitter();

    const mut_batches: (readonly string[])[] = [];

    flushed.pipe(withBufferedFrom(logged)).subscribe(([, lines]) => {
      mut_batches.push(lines);
    });

    log('a');

    log('b');

    flush();

    log('c');

    flush();

    assert.deepStrictEqual(mut_batches, [['a', 'b'], ['c']]);

    // embed-sample-code-ignore-below
  });
}
