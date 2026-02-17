import { mapWithIndex, source } from 'synstate';
// embed-sample-code-ignore-above

const num$ = source<number>();

const indexed$ = num$.pipe(mapWithIndex((x, i) => `${i}: ${x}`));

indexed$.subscribe((s) => {
  console.log(s);
});

num$.next(10); // logs: 0: 10

num$.next(20); // logs: 1: 20
