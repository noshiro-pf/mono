import { scan, source } from 'synstate';
// embed-sample-code-ignore-above

const num$ = source<number>();

const sum$ = num$.pipe(scan((acc, curr) => acc + curr, 0));

sum$.subscribe((x) => {
  console.log(x);
});

num$.next(1); // logs: 1

num$.next(2); // logs: 3

num$.next(3); // logs: 6
