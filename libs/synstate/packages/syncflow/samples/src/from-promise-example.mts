/* eslint-disable unicorn/prefer-top-level-await */
import { fromPromise } from 'syncflow';
import { Result } from 'ts-data-forge';
// embed-sample-code-ignore-above

const data$ = fromPromise(fetch('/api/data').then((r) => r.json()));

data$.subscribe((result) => {
  if (Result.isOk(result)) {
    console.log('Data:', result.value);
  } else {
    console.error('Error:', result.value);
  }
});
