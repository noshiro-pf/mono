import { skipIfNoChange, source } from 'synstate';
// embed-sample-code-ignore-above

const num$ = source<number>();

const distinct$ = num$.pipe(skipIfNoChange());

distinct$.subscribe((x) => {
  console.log(x);
});

num$.next(1); // logs: 1

num$.next(1); // nothing logged

num$.next(2); // logs: 2
