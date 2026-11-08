import { createValueEmitter, map, mergeMap, timer } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('merge-map', async () => {
    vi.useFakeTimers();

    try {
      // embed-sample-code-ignore-above
      const [uploaded, upload] = createValueEmitter<string>();

      // Every upload runs to the end, the slow one included.
      const done = uploaded.pipe(
        mergeMap((name) =>
          timer(name === 'big' ? 300 : 100).pipe(map(() => `${name} done`)),
        ),
      );

      const mut_seen: string[] = [];

      done.subscribe((message) => {
        mut_seen.push(message);
      });

      upload('big');

      upload('small');

      await vi.advanceTimersByTimeAsync(300);

      assert.deepStrictEqual(mut_seen, ['small done', 'big done']);

      // embed-sample-code-ignore-below
    } finally {
      vi.useRealTimers();
    }
  });
}
