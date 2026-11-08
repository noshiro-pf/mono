import {
  createState,
  fromPromise,
  just,
  switchMap,
  type Observable,
} from 'synstate-next';
import { Result } from 'ts-std-forge';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('switchMap', async () => {
    vi.useFakeTimers();

    try {
      // A user request that answers after `delay` ms.
      const fetchUser = async (
        id: number,
        delay: number,
      ): Promise<Readonly<{ id: number; name: string }>> =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ id, name: `user ${id}` });
          }, delay);
        });

      // embed-sample-code-ignore-above
      type User = Readonly<{ id: number; name: string }>;

      const [selectedId, setSelectedId] = createState<number | undefined>(
        undefined,
      );

      // `fetchUser(id, ms)` stands for a request: it resolves to the user after
      // `ms` milliseconds.
      const user: Observable<Result<User | undefined, unknown>> =
        selectedId.pipe(
          switchMap((id): Observable<Result<User | undefined, unknown>> =>
            // A branch with nothing to wait for is `just(...)`.
            id === undefined
              ? just(Result.ok(undefined))
              : fromPromise(fetchUser(id, id === 1 ? 300 : 100)),
          ),
        );

      const mut_names: (string | undefined)[] = [];

      user.subscribe((result) => {
        if (Result.isOk(result)) {
          mut_names.push(result.value?.name);
        }
      });

      setSelectedId(1);

      // The answer for user 1 comes after the one for user 2 and is dropped:
      // `switchMap` follows only the latest request.
      setSelectedId(2);

      await vi.advanceTimersByTimeAsync(500);

      assert.deepStrictEqual(mut_names, [undefined, 'user 2']);

      // embed-sample-code-ignore-below
    } finally {
      vi.useRealTimers();
    }
  });
}
