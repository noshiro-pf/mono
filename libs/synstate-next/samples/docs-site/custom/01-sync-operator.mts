import {
  createDerived,
  createState,
  type Observable,
  type Operator,
} from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('a sync operator', () => {
    // embed-sample-code-ignore-above
    // Passes on the values that are not `undefined`.
    const defined =
      <A,>(): Operator<A | undefined, A, 'drop'> =>
      (source: Observable<A | undefined>): Observable<A> =>
        createDerived<A>([source], (ctx) => () => {
          const value = source.getSnapshot();

          if (value !== undefined) {
            ctx.set(value);
          }
        });

    const [selected, setSelected] = createState<string | undefined>(undefined);

    const lastSelected = selected.pipe(defined());

    assert.isFalse(lastSelected.hasValue);

    setSelected('a');

    setSelected(undefined);

    assert.strictEqual(lastSelected.getSnapshot(), 'a');

    // embed-sample-code-ignore-below
  });
}
