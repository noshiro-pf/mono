import { derive, source } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(derive, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  price$     100         120
    //  quantity$        2            3
    //  total$           200   240    360
    //
    //  Explanation:
    //  - derive waits for every parent to have a value
    //  - Then calls the projection with their latest values whenever one emits

    const price$ = source<number>();

    const quantity$ = source<number>();

    const total$ = derive(
      [price$, quantity$],
      (price, quantity) => price * quantity,
    );

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const totalHistory: number[] = [];

    total$.subscribe((total) => {
      totalHistory.push(total);
    });

    price$.next(100); // nothing yet: quantity$ has no value

    quantity$.next(2); // 200

    price$.next(120); // 240

    quantity$.next(3); // 360

    assert.deepStrictEqual(totalHistory, [200, 240, 360]);

    // embed-sample-code-ignore-below
  });
}
