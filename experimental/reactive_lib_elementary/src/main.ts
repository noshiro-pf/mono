// import { Observable } from './Observable';

// const A = new Observable<number>();
// A.subscribe(x => console.log('Aの値：', x));

// A.update(1);
// A.update(3);
// A.update(6);

// import { merge } from './merge';
import { combineLatest } from './combineLatest';
import { interval } from './interval';

// interval(1000)
//   .map(x => x * 2)
//   .map(x => x + 1)
//   .subscribe(console.log);

// interval(1000)
//   .filter(x => x % 2 === 0)
//   .subscribe(console.log);

// interval(100)
//   .filter(x => x % 10 <= 5)
//   .debounceTime(200)
//   .subscribe(console.log);

// merge(
//   interval(1000).map(x => x * 10),
//   interval(1200)
// ).subscribe(console.log);

combineLatest(
  interval(1000).filter((x) => x % 2 === 0),
  interval(1000).filter((x) => x % 2 === 1)
).subscribe(console.log);
