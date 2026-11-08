import { createEventEmitter, throttle } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('a throttled refresh button', async () => {
    vi.useFakeTimers();

    try {
      const mut_refreshed: number[] = [];

      const refresh = (): void => {
        mut_refreshed.push(Date.now());
      };

      // embed-sample-code-ignore-above
      // `refreshClicked: Observable<void>`, `onRefreshClick: () => void`.
      const [refreshClicked, onRefreshClick] = createEventEmitter();

      // `refresh` stands for the work the button does.
      // At most one refresh every 2 seconds, however fast the clicks come.
      refreshClicked.pipe(throttle(2000)).subscribe(() => {
        refresh();
      });

      // <button onClick={onRefreshClick}>Refresh</button>

      // embed-sample-code-ignore-below

      onRefreshClick();

      await vi.advanceTimersByTimeAsync(500);

      onRefreshClick();

      await vi.advanceTimersByTimeAsync(2000);

      onRefreshClick();

      assert.strictEqual(mut_refreshed.length, 2);
    } finally {
      vi.useRealTimers();
    }
  });
}
