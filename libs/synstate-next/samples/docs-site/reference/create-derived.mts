import {
  createDerived,
  createState,
  type DropInitialValueOperator,
  type Observable,
} from 'synstate-next';

// Passes on every `n`-th value of the source.
const everyNth =
  <A,>(n: number): DropInitialValueOperator<A, A> =>
  (source: Observable<A>): Observable<A> =>
    createDerived<A>([source], (ctx) => {
      let mut_count = 0;

      return () => {
        const value = source.getSnapshot();

        if (value === undefined || !ctx.emitted(source)) {
          return;
        }

        mut_count += 1;

        if (mut_count !== n) {
          return;
        }

        mut_count = 0;

        ctx.set(value);
      };
    });

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('create-derived', () => {
    // embed-sample-code-ignore-above
    const [count, setCount] = createState(0);

    const mut_seen: number[] = [];

    count.pipe(everyNth(2)).subscribe((c) => {
      mut_seen.push(c);
    });

    setCount(1);

    setCount(2);

    setCount(3);

    setCount(4);

    assert.deepStrictEqual(mut_seen, [2, 4]);

    // embed-sample-code-ignore-below
  });
}
