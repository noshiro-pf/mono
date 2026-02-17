import { source, withInitialValue } from 'synstate';
// embed-sample-code-ignore-above

const num$ = source<number>();

const initialized$ = num$.pipe(withInitialValue(0));

initialized$.subscribe((x) => {
  console.log(x);
}); // immediately logs: 0

num$.next(1); // logs: 1
