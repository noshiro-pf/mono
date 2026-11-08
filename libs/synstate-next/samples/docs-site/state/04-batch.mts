import { batch, createState, derive } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('batch', () => {
    // embed-sample-code-ignore-above
    const [first, setFirst] = createState('Ada');

    const [last, setLast] = createState('Lovelace');

    const fullName = derive([first, last], (f, l) => `${f} ${l}`);

    const mut_seen: string[] = [];

    fullName.subscribe((name) => {
      mut_seen.push(name);
    });

    // Two writes, two updates.
    setFirst('Grace');

    setLast('Hopper');

    // Two writes, one update.
    batch(() => {
      setFirst('Alan');

      setLast('Turing');
    });

    assert.deepStrictEqual(mut_seen, [
      'Ada Lovelace',
      'Grace Lovelace',
      'Grace Hopper',
      'Alan Turing',
    ]);

    // embed-sample-code-ignore-below
  });
}
