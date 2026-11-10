import {
  createDerived,
  createValueEmitter,
  type Observable,
} from 'synstate-next';
import { Optional } from 'ts-std-forge';

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
        const a = first.getSnapshot();

        const b = second.getSnapshot();

        // `emitted` tells which parent emitted in this update.
        if (Optional.isSome(a) && ctx.emitted(first)) {
          ctx.set({ from: 'left', value: a.value });
        } else if (Optional.isSome(b) && ctx.emitted(second)) {
          ctx.set({ from: 'right', value: b.value });
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
