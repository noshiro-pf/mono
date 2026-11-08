import {
  createDerived,
  source,
  type DropInitialValueOperator,
  type Observable,
} from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('an async operator', async () => {
    vi.useFakeTimers();

    try {
      // embed-sample-code-ignore-above
      // Passes each value on `milliseconds` later, in an update of its own.
      const delay =
        <A,>(milliseconds: number): DropInitialValueOperator<A, A> =>
        (parent: Observable<A>): Observable<A> =>
          createDerived<A>([parent], (ctx) => {
            const mut_timers = new Set<ReturnType<typeof setTimeout>>();

            ctx.onCleanup(() => {
              for (const id of mut_timers) {
                clearTimeout(id);
              }
            });

            return {
              update: () => {
                const value = parent.getSnapshot();

                if (value === undefined || !ctx.emitted(parent)) {
                  return;
                }

                const id = setTimeout(() => {
                  mut_timers.delete(id);

                  ctx.emit(value);
                }, milliseconds);

                mut_timers.add(id);
              },
              // Not done while a value is still due.
              settled: () => parent.settled && mut_timers.size === 0,
            };
          });

      const messages = source<string>();

      const delayed = messages.pipe(delay(100));

      const mut_seen: string[] = [];

      delayed.subscribe((m) => {
        mut_seen.push(m);
      });

      messages.emit('a');

      messages.emit('b');

      assert.deepStrictEqual(mut_seen, []);

      await vi.advanceTimersByTimeAsync(100);

      assert.deepStrictEqual(mut_seen, ['a', 'b']);

      // embed-sample-code-ignore-below
    } finally {
      vi.useRealTimers();
    }
  });
}
