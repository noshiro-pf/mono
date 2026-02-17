import { filter, source } from 'synstate';
// embed-sample-code-ignore-above

const num$ = source<number>();

const even$ = num$.pipe(filter((x) => x % 2 === 0));

even$.subscribe((x) => {
  console.log(x);
});

num$.next(1); // nothing logged

num$.next(2); // logs: 2
