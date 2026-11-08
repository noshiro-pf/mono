import { createValueEmitter, zip } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('zip', () => {
    // embed-sample-code-ignore-above
    const [questions, ask] = createValueEmitter<string>();

    const [answers, answer] = createValueEmitter<number>();

    const mut_pairs: string[] = [];

    zip([questions, answers]).subscribe(([q, a]) => {
      mut_pairs.push(`${q} = ${a}`);
    });

    ask('1 + 1');

    ask('2 + 2');

    answer(2);

    answer(4);

    assert.deepStrictEqual(mut_pairs, ['1 + 1 = 2', '2 + 2 = 4']);

    // embed-sample-code-ignore-below
  });
}
