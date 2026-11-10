import {
  readChoice,
  readFirstName,
  readFlag,
  readInt,
  readNames,
  searchOf,
  writeChoice,
  writeFlag,
  writeNames,
} from './codec.mjs';

const ALL = ['a', 'b', 'c'] as const;

describe(searchOf, () => {
  test('writes nothing for no parameter', () => {
    assert.strictEqual(searchOf(new URLSearchParams()), '');
  });

  test('leaves a slash unescaped', () => {
    assert.strictEqual(
      searchOf(new URLSearchParams({ repo: 'owner/name' })),
      '?repo=owner/name',
    );
  });
});

describe(readFirstName, () => {
  test('is the first known name as written, past unknown ones and keys', () => {
    assert.strictEqual(
      readFirstName(new URLSearchParams('x=zzz&x=c.a'), 'x', ALL),
      'c',
    );
  });

  test('is none for an empty or unknown value', () => {
    assert.isUndefined(readFirstName(new URLSearchParams('x='), 'x', ALL));

    assert.isUndefined(readFirstName(new URLSearchParams('x=zzz'), 'x', ALL));

    assert.isUndefined(readFirstName(new URLSearchParams(''), 'x', ALL));
  });
});

describe(readNames, () => {
  test('reads a joined list in the order of all, once each', () => {
    assert.deepStrictEqual(
      readNames(new URLSearchParams('x=c.a.a.zzz'), 'x', ALL),
      ['a', 'c'],
    );
  });

  test('reads a repeated key', () => {
    assert.deepStrictEqual(
      readNames(new URLSearchParams('x=b&x=a'), 'x', ALL),
      ['a', 'b'],
    );
  });

  test('round-trips through writeNames', () => {
    const params = new URLSearchParams();

    writeNames(params, 'x', ['a', 'c']);

    assert.strictEqual(params.toString(), 'x=a.c');

    writeNames(params, 'x', []);

    assert.isFalse(params.has('x'));
  });
});

describe(readFlag, () => {
  test('is on only for 1', () => {
    assert.isTrue(readFlag(new URLSearchParams('f=1'), 'f'));

    assert.isFalse(readFlag(new URLSearchParams('f=true'), 'f'));

    assert.isFalse(readFlag(new URLSearchParams(), 'f'));
  });

  test('writes off as no key', () => {
    const params = new URLSearchParams('f=1');

    writeFlag(params, 'f', false);

    assert.isFalse(params.has('f'));
  });
});

describe(readChoice, () => {
  test('falls back for an unknown value', () => {
    assert.strictEqual(
      readChoice(new URLSearchParams('s=zzz'), 's', ALL, 'a'),
      'a',
    );

    assert.strictEqual(
      readChoice(new URLSearchParams('s=b'), 's', ALL, 'a'),
      'b',
    );
  });

  test('writes the default as no key', () => {
    const params = new URLSearchParams('s=b');

    writeChoice(params, 's', 'a', 'a');

    assert.isFalse(params.has('s'));
  });
});

describe(readInt, () => {
  test('clamps', () => {
    assert.strictEqual(readInt(new URLSearchParams('n=500'), 'n', 0, 100), 100);

    assert.strictEqual(readInt(new URLSearchParams('n=-5'), 'n', 0, 100), 0);
  });

  test('refuses what is not a whole number', () => {
    assert.isUndefined(readInt(new URLSearchParams('n=1.5'), 'n', 0, 100));

    assert.isUndefined(readInt(new URLSearchParams('n=x'), 'n', 0, 100));

    assert.isUndefined(readInt(new URLSearchParams(), 'n', 0, 100));
  });
});
