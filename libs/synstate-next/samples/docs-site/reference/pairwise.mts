import { createState, pairwise } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('pairwise', () => {
    // embed-sample-code-ignore-above
    const [page, setPage] = createState(1);

    const mut_moves: string[] = [];

    page.pipe(pairwise()).subscribe(([from, to]) => {
      mut_moves.push(`${from} -> ${to}`);
    });

    setPage(2);

    setPage(5);

    assert.deepStrictEqual(mut_moves, ['1 -> 2', '2 -> 5']);

    // embed-sample-code-ignore-below
  });
}
