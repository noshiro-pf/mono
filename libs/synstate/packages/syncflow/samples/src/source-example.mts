import { source } from 'syncflow';
// embed-sample-code-ignore-above

const count$ = source<number>();

count$.subscribe((value) => {
  console.log(value);
});

count$.next(1); // logs: 1

count$.next(2); // logs: 2
