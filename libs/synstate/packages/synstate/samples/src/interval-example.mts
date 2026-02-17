import { interval } from 'synstate';
// embed-sample-code-ignore-above

const tick$ = interval(1000);

tick$.subscribe((count) => {
  console.log(count);
});
// logs: 0, 1, 2, 3, ... every second
