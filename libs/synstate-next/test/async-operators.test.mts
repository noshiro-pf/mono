import { debounce, map, source, state, switchMap } from 'synstate-next';

describe(switchMap, () => {
  test('follows the latest inner observable and disposes the previous one', () => {
    const which = state<'a' | 'b'>('a');

    const a = state(1);

    const b = state(100);

    const followed = which.pipe(
      switchMap((w) => (w === 'a' ? a : b).pipe(map((x) => x + 1))),
    );

    const mut_seen: number[] = [];

    followed.subscribe((v) => {
      mut_seen.push(v);
    });

    a.set(2);

    which.set('b');

    a.set(3);

    b.set(200);

    assert.deepStrictEqual(mut_seen, [2, 3, 101, 201]);
  });
});

describe(debounce, () => {
  test('emits the latest value once the source has been quiet', () => {
    vi.useFakeTimers();

    try {
      const e = source<number>();

      const quiet = e.pipe(debounce(100));

      const mut_seen: number[] = [];

      quiet.subscribe((v) => {
        mut_seen.push(v);
      });

      e.next(1);

      e.next(2);

      assert.deepStrictEqual(mut_seen, []);

      vi.runAllTimers();

      // Only the last value of the burst.
      assert.deepStrictEqual(mut_seen, [2]);

      e.next(3);

      quiet.dispose();

      vi.runAllTimers();

      // Disposing drops the value still waiting.
      assert.deepStrictEqual(mut_seen, [2]);
    } finally {
      vi.useRealTimers();
    }
  });
});
