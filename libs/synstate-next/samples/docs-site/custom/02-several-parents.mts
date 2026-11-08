import {
  createDerived,
  createValueEmitter,
  type Observable,
} from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('an operator with several parents', () => {
    // embed-sample-code-ignore-above
    type Tagged<A, B> = Readonly<
      { from: 'left'; value: A } | { from: 'right'; value: B }
    >;

    // Like `merge`, but says which parent the value came from.
    const mergeTagged = <A, B>(
      first: Observable<A>,
      second: Observable<B>,
    ): Observable<Tagged<A, B>> =>
      createDerived<Tagged<A, B>>([first, second], (ctx) => () => {
        const a = first.peek();

        const b = second.peek();

        // `emitted` tells which parent emitted in this update.
        if (a !== undefined && ctx.emitted(first)) {
          ctx.set({ from: 'left', value: a });
        } else if (b !== undefined && ctx.emitted(second)) {
          ctx.set({ from: 'right', value: b });
        }
      });

    const [left, emitLeft] = createValueEmitter<number>();

    const [right, emitRight] = createValueEmitter<string>();

    const mut_seen: Tagged<number, string>[] = [];

    mergeTagged(left, right).subscribe((tagged) => {
      mut_seen.push(tagged);
    });

    emitLeft(1);

    emitRight('a');

    assert.deepStrictEqual(mut_seen, [
      { from: 'left', value: 1 },
      { from: 'right', value: 'a' },
    ]);

    // embed-sample-code-ignore-below
  });
}
