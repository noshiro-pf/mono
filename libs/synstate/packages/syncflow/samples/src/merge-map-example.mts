/* eslint-disable @typescript-eslint/require-await */
import { fromPromise, mergeMap, source } from 'syncflow';
// embed-sample-code-ignore-above

const ids$ = source<number>();

const users$ = ids$.pipe(mergeMap((id) => fromPromise(fetchUser(id))));

users$.subscribe((user) => {
  console.log(user);
});
// All requests run in parallel, results merged as they arrive

const fetchUser = async (id: number): Promise<unknown> => ({ id });
