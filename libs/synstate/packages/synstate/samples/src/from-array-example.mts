import { fromArray } from 'synstate';
// embed-sample-code-ignore-above

const nums$ = fromArray([1, 2, 3]);

nums$.subscribe((x) => {
  console.log(x);
});
// logs: 1, 2, 3
