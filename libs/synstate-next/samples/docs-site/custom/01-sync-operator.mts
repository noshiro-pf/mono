import {
  createDerived,
  createState,
  type DropInitialValueOperator,
  type Observable,
} from 'synstate-next';
import { Optional } from 'ts-std-forge';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('a sync operator', () => {
    // embed-sample-code-ignore-above
    // Passes on the values that are not `undefined`.
    const defined =
      <A,>(): DropInitialValueOperator<A | undefined, A> =>
      (source: Observable<A | undefined>): Observable<A> =>
        createDerived<A>([source], (ctx) => () => {
          const value = source.getSnapshot();

          if (Optional.isSome(value) && value.value !== undefined) {
            ctx.set(value.value);
          }
        });

    const [selected, setSelected] = createState<string | undefined>(undefined);

    const lastSelected = selected.pipe(defined());

    assert.isTrue(Optional.isNone(lastSelected.getSnapshot()));

    setSelected('a');

    setSelected(undefined);

    assert.deepStrictEqual(lastSelected.getSnapshot(), Optional.some('a'));

    // embed-sample-code-ignore-below
  });
}
