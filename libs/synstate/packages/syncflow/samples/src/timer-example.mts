import { timer } from 'syncflow';
// embed-sample-code-ignore-above

const delayed$ = timer(1000);

delayed$.subscribe(() => {
  console.log('1 second passed');
});
// After 1 second, logs: 1 second passed
