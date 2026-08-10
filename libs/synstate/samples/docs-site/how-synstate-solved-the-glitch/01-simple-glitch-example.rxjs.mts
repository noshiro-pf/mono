import {
  combineLatest,
  interval,
  lastValueFrom,
  map,
  take,
  toArray,
} from 'rxjs';

/* embed-sample-code-ignore-this-line */ if (import.meta.vitest !== undefined) {
  /* embed-sample-code-ignore-this-line */ test('simple-glitch-example (RxJS)', async () => {
    const counterObservable = interval(100);
    // 0, 1, 2, 3, ...

    const multipliedBy10 = counterObservable.pipe(map((count) => count * 10));
    // 0, 10, 20, 30, ...

    const multipliedBy1000 = counterObservable.pipe(
      map((count) => count * 1000),
    );
    // 0, 1000, 2000, 3000, ...

    const sum = combineLatest([multipliedBy10, multipliedBy1000]).pipe(
      map(([a, b]) => a + b),
    );
    // 0, 10, 1010, 20, 2020, 30, 3030, ...

    const result = await lastValueFrom(sum.pipe(take(7), toArray()));

    assert.deepStrictEqual(result, [0, 10, 1010, 1020, 2020, 2030, 3030]);

    // embed-sample-code-ignore-below

    // In RxJS, when counterObservable emits a new value,
    // combineLatest (which subscribes to multipliedBy10 first) updates
    // that slot before multipliedBy1000 has recalculated.
    // This causes glitches — inconsistent intermediate states:
    //
    //   counter: 0 → multipliedBy10: 0,   multipliedBy1000: 0,    sum: 0+0 = 0       ✓
    //   counter: 1 → multipliedBy10: 10,  multipliedBy1000: 0,    sum: 10+0 = 10     ✗ glitch
    //                multipliedBy10: 10,  multipliedBy1000: 1000, sum: 10+1000 = 1010 ✓
    //   counter: 2 → multipliedBy10: 20,  multipliedBy1000: 1000, sum: 20+1000 = 1020 ✗ glitch
    //                multipliedBy10: 20,  multipliedBy1000: 2000, sum: 20+2000 = 2020 ✓
    //   counter: 3 → multipliedBy10: 30,  multipliedBy1000: 2000, sum: 30+2000 = 2030 ✗ glitch
    //                multipliedBy10: 30,  multipliedBy1000: 3000, sum: 30+3000 = 3030 ✓
  });
}
