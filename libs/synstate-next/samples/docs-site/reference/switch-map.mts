import { createState, map, switchMap, timer } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('switch-map', async () => {
    vi.useFakeTimers();

    try {
      // embed-sample-code-ignore-above
      const [selected, select] = createState('a');

      // Loading takes 200 ms; only the latest selection is followed.
      const loaded = selected.pipe(
        switchMap((id) => timer(200).pipe(map(() => `item ${id}`))),
      );

      const mut_seen: string[] = [];

      loaded.subscribe((item) => {
        mut_seen.push(item);
      });

      await vi.advanceTimersByTimeAsync(100);

      select('b');

      await vi.advanceTimersByTimeAsync(300);

      assert.deepStrictEqual(mut_seen, ['item b']);

      // embed-sample-code-ignore-below
    } finally {
      vi.useRealTimers();
    }
  });
}
