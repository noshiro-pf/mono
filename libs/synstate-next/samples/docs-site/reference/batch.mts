import { batch, createState, derive } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('batch', () => {
    // embed-sample-code-ignore-above
    const [first, setFirst] = createState('Ada');

    const [last, setLast] = createState('Lovelace');

    const mut_seen: string[] = [];

    derive([first, last], (f, l) => `${f} ${l}`).subscribe((name) => {
      mut_seen.push(name);
    });

    batch(() => {
      setFirst('Grace');

      setLast('Hopper');
    });

    // One update for both writes: no "Grace Lovelace" in between.
    assert.deepStrictEqual(mut_seen, ['Ada Lovelace', 'Grace Hopper']);

    // embed-sample-code-ignore-below
  });
}
