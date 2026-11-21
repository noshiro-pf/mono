/**
 * Ported from synstate 9's `duplicate-copies.test.mts`. synstate 9 let two
 * copies of the package build one graph; synstate refuses it (DESIGN.md), and
 * this is where the refusal is checked.
 */
import type * as SynstateModule from 'synstate';

describe('two copies of synstate in one program', () => {
  test('each load is a distinct copy', async () => {
    const copyA = await loadCopy();

    const copyB = await loadCopy();

    assert.notStrictEqual(copyA.state, copyB.state);
  });

  test('an observable of one copy is not one of the other', async () => {
    const copyA = await loadCopy();

    const copyB = await loadCopy();

    assert.isFalse(copyB.isObservable(copyA.state(0)));
  });

  test('combining observables of two copies throws, naming the cause', async () => {
    const copyA = await loadCopy();

    const copyB = await loadCopy();

    const a = copyA.state(1);

    const b = copyB.state(2);

    assert.throws(
      () => copyA.derive([a, b], (...values) => values),
      TypeError,
      'another copy of synstate',
    );

    assert.throws(
      () => a.pipe(copyB.map((x) => x + 1)),
      TypeError,
      'another copy of synstate',
    );
  });
});

// Each call loads a new module graph, standing for one more copy of the package
// in the same program, as a bundle that resolves two installations has.
const loadCopy = async (): Promise<typeof SynstateModule> => {
  vi.resetModules();

  return import('synstate');
};
