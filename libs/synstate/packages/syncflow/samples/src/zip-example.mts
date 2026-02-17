import { fromArray, zip } from 'syncflow';
// embed-sample-code-ignore-above

const letters$ = fromArray(['a', 'b', 'c']);

const numbers$ = fromArray([1, 2, 3]);

const zipped$ = zip([letters$, numbers$]);

zipped$.subscribe(([letter, num]) => {
  console.log(letter, num);
});
// logs: a 1, b 2, c 3
