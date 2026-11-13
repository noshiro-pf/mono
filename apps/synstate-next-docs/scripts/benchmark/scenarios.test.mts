import {
  isNaiveForm,
  isPredecessor,
  isSubject,
  libraryOf,
  packageOf,
  predecessorOf,
  scenarios,
} from './scenarios.mjs';

describe(predecessorOf, () => {
  test("names synstate's row in the same form", () => {
    assert.strictEqual(predecessorOf('synstate-next'), 'synstate');

    assert.strictEqual(
      predecessorOf('synstate-next (naive derive)'),
      'synstate (naive derive)',
    );
  });

  test("refuses a row that is not synstate-next's", () => {
    assert.throws(() => predecessorOf('synstate'), /not one of synstate-next/u);

    assert.throws(
      () => predecessorOf('RxJS (switchMap)'),
      /not one of synstate-next/u,
    );

    assert.throws(
      () => predecessorOf('synstate-next2'),
      /not one of synstate-next/u,
    );
  });
});

describe(isSubject, () => {
  test("takes synstate-next's rows in every form", () => {
    assert.isTrue(isSubject('synstate-next'));

    assert.isTrue(isSubject('synstate-next (naive derive)'));
  });

  test('leaves out synstate, other libraries and names that only start alike', () => {
    assert.isFalse(isSubject('synstate'));

    assert.isFalse(isSubject('synstate (naive derive)'));

    assert.isFalse(isSubject('synstate-next2'));

    assert.isFalse(isSubject('RxJS'));

    assert.isFalse(isSubject('RxJS (naive, no distinctUntilChanged)'));
  });
});

describe(isPredecessor, () => {
  test("takes synstate's rows in every form", () => {
    assert.isTrue(isPredecessor('synstate'));

    assert.isTrue(isPredecessor('synstate (naive derive)'));
  });

  test('leaves out synstate-next and other libraries', () => {
    assert.isFalse(isPredecessor('synstate-next'));

    assert.isFalse(isPredecessor('synstate-next (naive derive)'));

    assert.isFalse(isPredecessor('RxJS (switchMap)'));
  });
});

describe(libraryOf, () => {
  test('drops the form a row is written in', () => {
    assert.strictEqual(libraryOf('RxJS (switchMap)'), 'RxJS');

    assert.strictEqual(
      libraryOf('RxJS (naive, no distinctUntilChanged)'),
      'RxJS',
    );

    assert.strictEqual(
      libraryOf('synstate-next (naive derive)'),
      'synstate-next',
    );

    assert.strictEqual(libraryOf('Preact Signals'), 'Preact Signals');
  });
});

describe(isNaiveForm, () => {
  test('takes the rows whose form starts with naive', () => {
    assert.isTrue(isNaiveForm('synstate-next (naive derive)'));

    assert.isTrue(isNaiveForm('RxJS (naive, no distinctUntilChanged)'));
  });

  test('leaves out the other forms and rows with none', () => {
    assert.isFalse(isNaiveForm('RxJS (switchMap)'));

    assert.isFalse(isNaiveForm('synstate-next'));
  });
});

/** Each scenario's rows that `pick` takes, sorted. */
const rowsOf = (pick: (labels: readonly string[]) => readonly string[]) =>
  scenarios.map(({ id, entries }) => ({
    id,
    rows: pick(entries.map(({ label }) => label)).toSorted(),
  }));

describe('scenarios', () => {
  test('measures synstate-next in every scenario', () => {
    assert.deepStrictEqual(
      scenarios
        .filter(({ entries }) =>
          entries.every(({ label }) => !isSubject(label)),
        )
        .map(({ id }) => id),
      [],
    );
  });

  test("pairs each synstate-next row with synstate's in the same form, both ways", () => {
    assert.deepStrictEqual(
      rowsOf((labels) => labels.filter(isPredecessor)),
      rowsOf((labels) => labels.filter(isSubject).map(predecessorOf)),
    );
  });

  test('names every other row by a library listed in packageOf', () => {
    const unknown = scenarios.flatMap(({ entries }) =>
      entries
        .map(({ label }) => label)
        .filter(
          (label) =>
            !isSubject(label) && packageOf[libraryOf(label)] === undefined,
        ),
    );

    assert.deepStrictEqual(unknown, []);
  });
});
