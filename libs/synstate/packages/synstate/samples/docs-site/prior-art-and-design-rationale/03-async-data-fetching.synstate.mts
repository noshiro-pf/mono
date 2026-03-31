/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import { fromAbortablePromise, just, source, switchMap } from 'synstate';
import { Result } from 'ts-data-forge';

type UserData = Readonly<{ name: string }>;

const auth$ = source<Readonly<{ id: string }> | null>({ id: '1' });

const fetchUser = (_id: string, _signal: AbortSignal): Promise<UserData> =>
  Promise.resolve({ name: 'Alice' });

const guestData: UserData = { name: 'Guest' } as const;

// embed-sample-code-ignore-above

const userData$ = auth$.pipe(
  switchMap((auth) =>
    auth
      ? fromAbortablePromise((signal) => fetchUser(auth.id, signal))
      : just(Result.ok(guestData)),
  ),
);

// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('async data fetching (synstate)', () => {
    assert.strictEqual(userData$.kind, 'async child');
  });
}
