import { pairwise, source } from 'synstate';
// embed-sample-code-ignore-above

const num$ = source<number>();

const pairs$ = num$.pipe(pairwise());

pairs$.subscribe(([prev, curr]) => {
  console.log(prev, curr);
});

num$.next(1); // nothing logged

num$.next(2); // logs: 1, 2

num$.next(3); // logs: 2, 3
