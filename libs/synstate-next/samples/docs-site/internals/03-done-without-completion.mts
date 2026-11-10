import { createRootOwner, createState, take, timer } from 'synstate-next';
import { Optional } from 'ts-std-forge';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('done, without completion', async () => {
    vi.useFakeTimers();

    try {
      // embed-sample-code-ignore-above
      const [a, setA] = createState(0);

      // The value held at the start counts: 0, 1, 2.
      const firstThree = a.pipe(take(3));

      const mut_seen: number[] = [];

      firstThree.subscribe((x) => {
        mut_seen.push(x);
      });

      setA(1);

      setA(2);

      // Done: it has left `a`, keeps its value, and passes nothing more.
      setA(3);

      assert.deepStrictEqual(mut_seen, [0, 1, 2]);

      assert.strictEqual(firstThree.value, 2);

      // A source that is done keeps its value and its subscribers until its
      // owner disposes it.
      const owner = createRootOwner();

      const fired = owner.run(() => timer(100));

      await vi.advanceTimersByTimeAsync(100);

      assert.deepStrictEqual(fired.getSnapshot(), Optional.some(0));

      owner.dispose();

      // embed-sample-code-ignore-below
    } finally {
      vi.useRealTimers();
    }
  });
}
