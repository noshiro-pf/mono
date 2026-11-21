import {
  isNaiveForm,
  isSubject,
  libraryOf,
  packageOf,
  scenarios,
} from './scenarios.mjs';

describe(isSubject, () => {
  test("takes synstate's rows in every form", () => {
    assert.isTrue(isSubject('synstate'));

    assert.isTrue(isSubject('synstate (naive derive)'));
  });

  test('leaves out other libraries and names that only start alike', () => {
    assert.isFalse(isSubject('synstate2'));

    assert.isFalse(isSubject('RxJS'));

    assert.isFalse(isSubject('RxJS (naive, no distinctUntilChanged)'));
  });
});

describe(libraryOf, () => {
  test('drops the form a row is written in', () => {
    assert.strictEqual(libraryOf('RxJS (switchMap)'), 'RxJS');

    assert.strictEqual(
      libraryOf('RxJS (naive, no distinctUntilChanged)'),
      'RxJS',
    );

    assert.strictEqual(libraryOf('synstate (naive derive)'), 'synstate');

    assert.strictEqual(libraryOf('Preact Signals'), 'Preact Signals');
  });
});

describe(isNaiveForm, () => {
  test('takes the rows whose form starts with naive', () => {
    assert.isTrue(isNaiveForm('synstate (naive derive)'));

    assert.isTrue(isNaiveForm('RxJS (naive, no distinctUntilChanged)'));
  });

  test('leaves out the other forms and rows with none', () => {
    assert.isFalse(isNaiveForm('RxJS (switchMap)'));

    assert.isFalse(isNaiveForm('synstate'));
  });
});

describe('scenarios', () => {
  test('measures synstate in every scenario', () => {
    assert.deepStrictEqual(
      scenarios
        .filter(({ entries }) =>
          entries.every(({ label }) => !isSubject(label)),
        )
        .map(({ id }) => id),
      [],
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
