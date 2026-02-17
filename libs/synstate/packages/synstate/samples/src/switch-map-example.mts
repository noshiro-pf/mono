/* eslint-disable @typescript-eslint/require-await */
import { fromPromise, source, switchMap } from 'synstate';
// embed-sample-code-ignore-above

const searchQuery$ = source<string>();

const results$ = searchQuery$.pipe(
  switchMap((query) => fromPromise(fetchResults(query))),
);

results$.subscribe((results) => {
  console.log(results);
});
// Only the latest search results are emitted, previous searches are cancelled

const fetchResults = async (_query: string): Promise<readonly unknown[]> => [];
