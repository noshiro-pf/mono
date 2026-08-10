import { collectToArray, combine, counter, map, take } from 'synstate';

/* embed-sample-code-ignore-this-line */ if (import.meta.vitest !== undefined) {
  /* embed-sample-code-ignore-this-line */ test('simple-glitch-example', async () => {
    const counterObservable = counter(1000 /* ms */);
    // 0, 1, 2, 3, ...

    const multipliedBy10 = counterObservable.pipe(map((count) => count * 10));
    // 0, 10, 20, 30, ...

    const multipliedBy1000 = counterObservable.pipe(
      map((count) => count * 1000),
    );
    // 0, 1000, 2000, 3000, ...

    const sum = combine([multipliedBy10, multipliedBy1000]).pipe(
      map(([a, b]) => a + b),
    );
    // 0, 1010, 2020, 3030, ...

    const resultPromise = collectToArray(sum.pipe(take(5)));

    counterObservable.start();

    const result = await resultPromise;

    assert.deepStrictEqual(result, [0, 1010, 2020, 3030, 4040]);

    // embed-sample-code-ignore-below
  });
}
