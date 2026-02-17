import { combine, source } from 'synstate';
// embed-sample-code-ignore-above

const name$ = source<string>();

const age$ = source<number>();

const user$ = combine([name$, age$]);

user$.subscribe(([name_, age]) => {
  console.log({ name: name_, age });
});

name$.next('Alice');

age$.next(25); // logs: { name: 'Alice', age: 25 }

name$.next('Bob'); // logs: { name: 'Bob', age: 25 }
