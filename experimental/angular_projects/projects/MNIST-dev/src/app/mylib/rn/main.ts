import { debounce, filter, map, scan } from './internal/operators';
import { combine, interval, manual, merge } from './RN';

// fv1.addChild
// fv1.curr
// fv1.latestFire
// fv1.priority
// fv1.id

// const array: number[] = [];
// [ 2, 14, 15, 25, 21, 40, 31, 45, 26, 22, 70, 45, 85, 59, 47, 56, 75, 53, 70, 33 ]
// .forEach( e => addAsHeap( array, e ) );

// removeAsHeap( array );
// console.log( array );

const testid: string = 'complete-check4';
console.log('testid = ', testid);

switch (testid) {
  case 'complete-check4': {
    const _ = interval(1000, true);
    const a = _.map((e) => 100 * e);
    const b = interval(500, true);
    const c = combine(a, b);
    a.subscribe(
      console.log,
      () => {},
      (e) => console.log('a complete', e)
    );
    b.subscribe(
      console.log,
      () => {},
      (e) => console.log('b complete', e)
    );
    c.subscribe(
      console.log,
      () => {},
      (e) => console.log('c complete', e)
    );
    setTimeout(() => {
      _.stop();
    }, 3000);
    setTimeout(() => {
      b.stop();
    }, 5000);
    break;
  }

  case 'complete-check3': {
    const a = interval(1000, true).map((e) => 100 * e);
    const b = interval(500, true);
    const c = combine(a, b);
    a.subscribe(
      console.log,
      () => {},
      (e) => console.log('a complete', e)
    );
    b.subscribe(
      console.log,
      () => {},
      (e) => console.log('b complete', e)
    );
    c.subscribe(
      console.log,
      () => {},
      (e) => console.log('c complete', e)
    );
    setTimeout(() => {
      b.stop();
    }, 3000);
    break;
  }

  case 'complete-check2': {
    const a = interval(1000, true).map((e) => 100 * e);
    const b = interval(500, true);
    const c = combine(a, b);
    const sbs1 = c.subscribe(console.log);
    const sbs2 = a.subscribe(console.log);
    setTimeout(() => {
      sbs1.unsubscribe();
    }, 5000);
    setTimeout(() => {
      sbs2.unsubscribe();
    }, 3000);
    break;
  }

  case 'complete-check1': {
    const a = interval(1000, true);
    const b = a.mapTo(1);
    const sbs = b.subscribe(console.log);
    setTimeout(() => {
      sbs.unsubscribe();
    }, 3000);
    break;
  }

  case 'flatMap': {
    const a = interval(2000, true);
    const b = a.flatMap((e) =>
      interval(700, true)
        .map((x) => [e, e * (x + 1)])
        .take(4)
    );
    b.subscribe(console.log);
    break;
  }

  case 'switchMap': {
    const a = interval(1000, true);
    const b = a.switchMap((e) => interval(300, true).map((x) => e * x));
    b.subscribe(console.log);
    break;
  }

  case 'withTimestamp': {
    const values = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9];
    const a = interval(1000);
    const b = interval(300);
    const c = a
      .map((_, i) => values[i])
      .takeWhile((_, i) => i < values.length)
      .withTimestamp();
    a.start();
    b.start();
    c.subscribe(console.log);
    break;
  }

  case 'withLatest': {
    const values = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9];
    const a = interval(1000);
    const b = interval(300);
    const c = a
      .map((_, i) => values[i])
      .takeWhile((_, i) => i < values.length)
      .withLatest(b);
    a.start();
    b.start();
    c.subscribe(console.log);
    break;
  }

  case 'take': {
    const values = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9];
    const a = interval(1000);
    const b = a.map((_, i) => values[i]).take(5);
    b.subscribe(console.log);
    a.start();
    break;
  }

  case 'skipWhile': {
    const values = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9];
    const a = interval(1000);
    const b = a.map((_, i) => values[i]).skipWhile(0, (_, i) => i < 3);
    b.subscribe(console.log);
    a.start();
    break;
  }

  case 'skipUnchanged': {
    const values = [7, 7, 7, 9, 3, 3, 2, 3, 8, 8, 4, 6, 2, 6, 4];
    const a = interval(1000);
    const b = a
      .map((_, i) => values[i])
      .takeWhile((_, i) => i < values.length)
      .skipUnchanged();
    b.subscribe(console.log);
    a.start();
    break;
  }

  case 'skipAlreadyAppeared': {
    const values = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9];
    const a = interval(1000);
    const b = a
      .map((_, i) => values[i])
      .takeWhile((_, i) => i < values.length)
      .skipAlreadyAppeared();
    b.subscribe(console.log);
    a.start();
    break;
  }

  case 'skip': {
    const a = interval(1000);
    const b = a.skip(999, 3);
    console.log(b.value);
    b.subscribe(console.log);
    break;
  }

  case 'pluck': {
    const a = interval(1000);
    const b = a
      .pairwise()
      .map((e) => ({ prev: e[0], curr: e[1] }))
      .pluck('curr');
    b.subscribe(console.log);
    break;
  }

  case 'pairwise': {
    const a = interval(1000);
    const b = a.pairwise();
    b.subscribe(console.log);
    a.start();
    break;
  }

  case 'mapTo': {
    const a = interval(1000);
    const b = a.mapTo(0);
    b.subscribe(console.log);
    a.start();
    break;
  }

  case 'merge': {
    const a = interval(1000, false);
    const b = interval(1000, false);
    const c = b.map((e) => 100 * e);
    const d = merge(a, c);
    a.start();
    setTimeout(() => {
      b.start();
    }, 500);
    d.subscribe((e) => console.log(e));
    break;
  }

  case 'fib': {
    const seq = interval(1000);
    const fib = seq.scan<number>(1, (prev, curr) => curr + prev);
    fib.subscribe((e) => console.log(e));
    seq.start();
    break;
  }

  case 'scan': {
    const a = interval(1000);
    const b = a.pipe(
      scan([] as number[], (prev, curr) => {
        prev.push(curr);
        return prev;
      })
    );
    a.subscribe((e) => console.log('a', e));
    b.subscribe((e) => console.log('b', e));
    // a.start();
    break;
  }

  case 'debounce3': {
    const a = interval(100);
    const b = a.pipe(filter(0, (e) => e % 10 < 5));
    const c = b.pipe(debounce(300));
    b.subscribe((e) => console.log('b', e));
    c.subscribe((e) => console.log('c', e));
    // a.start();
    break;
  }

  case 'debounce2': {
    const a = manual(0);
    const b = a.pipe(debounce(275));
    setTimeout(() => {
      a.emit(50);
    }, 50);
    setTimeout(() => {
      a.emit(750);
    }, 750);
    setTimeout(() => {
      a.emit(950);
    }, 950);
    a.subscribe((e) => console.log('a', e));
    b.subscribe((e) => console.log('b', e));
    break;
  }

  case 'debounce': {
    const a = manual(0);
    const b = a.pipe(debounce(1000));
    const c = a.debounce(1000);
    a.subscribe((e) => console.log('a', e));
    b.subscribe((e) => console.log('b', e));
    c.subscribe((e) => console.log('c', e));
    a.emit(1);
    break;
  }

  case 'combine': {
    const a = interval(1000);
    const b = a.map((e) => 100 * e);
    const b2 = a.pipe(map((e) => 100 * e));
    const c1 = combine(a, b).map(([x, y]) => x + y);
    const c2 = combine(a, b2).pipe(map(([x, y]) => x + y));
    c1.subscribe(
      (e) => console.log('c1', e),
      undefined,
      (e) => console.log('end', e)
    );
    c2.subscribe((e) => console.log('c2', e));
    a.start();
    setTimeout(() => {
      a.stop();
    }, 5000);
    break;
  }

  case 'interval': {
    const a = interval(1000, false);
    a.start();
    a.subscribe(console.log, undefined, (e) => console.log('end', e));
    setTimeout(() => {
      a.stop();
    }, 5000);
    break;
  }

  case 'manual': {
    const rn = manual(0);
    rn.subscribe(console.log);
    rn.emit(1);
    break;
  }
}
