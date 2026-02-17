import { of } from 'synstate';
// embed-sample-code-ignore-above

const num$ = of(42);

num$.subscribe((x) => {
  console.log(x);
}); // logs: 42
