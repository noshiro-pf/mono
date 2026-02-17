import { debounceTime, source } from 'synstate';
// embed-sample-code-ignore-above

const input$ = source<string>();

const debounced$ = input$.pipe(debounceTime(300));

debounced$.subscribe((value) => {
  console.log(value);
});

input$.next('h');

input$.next('he');

input$.next('hel');

input$.next('hello');
// After 300ms of silence, logs: hello
