import { createState, debounce } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('debounce', async () => {
    vi.useFakeTimers();

    try {
      // embed-sample-code-ignore-above
      const [query, setQuery] = createState('');

      const settled = query.pipe(debounce(300));

      setQuery('s');

      await vi.advanceTimersByTimeAsync(100);

      setQuery('sy');

      await vi.advanceTimersByTimeAsync(100);

      setQuery('syn');

      // Still the value it held at the start.
      assert.strictEqual(settled.value, '');

      await vi.advanceTimersByTimeAsync(300);

      assert.strictEqual(settled.value, 'syn');

      // embed-sample-code-ignore-below
    } finally {
      vi.useRealTimers();
    }
  });
}
