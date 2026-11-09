import {
  compareWithReference,
  filesOf,
} from './check-synstate-hooks-copies.mjs';

describe(compareWithReference, () => {
  test('accepts identical files and the departures listed', () => {
    assert.deepStrictEqual(
      compareWithReference(
        new Map<string, string>([
          ['src/a.mts', 'a'],
          ['src/hook.mts', 'with useSyncExternalStore'],
          ['src/shim.mts', 'useInsertionEffect'],
        ]),
        new Map<string, string>([
          ['src/a.mts', 'a'],
          ['src/hook.mts', 'with useState'],
          ['src/own.mts', 'x'],
        ]),
        {
          'src/hook.mts': { kind: 'differs', reason: 'no store hook' },
          'src/shim.mts': { kind: 'reference only', reason: 'needs none' },
          'src/own.mts': { kind: 'copy only', reason: 'its own' },
        },
      ),
      [],
    );
  });

  test('reports a shared file whose contents differ', () => {
    assert.deepStrictEqual(
      compareWithReference(
        new Map<string, string>([['src/a.mts', 'fixed']]),
        new Map<string, string>([['src/a.mts', 'not fixed']]),
        {},
      ),
      ['src/a.mts: contents differ'],
    );
  });

  test('reports a file only one package has', () => {
    assert.deepStrictEqual(
      compareWithReference(
        new Map<string, string>([['test/new.test.mts', 'x']]),
        new Map<string, string>([['src/b.mts', 'y']]),
        {},
      ),
      [
        'src/b.mts: not in the reference',
        'test/new.test.mts: only in the reference',
      ],
    );
  });

  test('reports a listed departure the files no longer show', () => {
    assert.deepStrictEqual(
      compareWithReference(
        new Map<string, string>([
          ['src/same.mts', 's'],
          ['src/hook.mts', 'h'],
        ]),
        new Map<string, string>([['src/same.mts', 's']]),
        {
          'src/same.mts': { kind: 'differs', reason: 'stale' },
          // Deleted from the copy, though it was listed as differing.
          'src/hook.mts': { kind: 'differs', reason: 'store hook' },
          'src/gone.mts': { kind: 'reference only', reason: 'deleted' },
        },
      ),
      [
        'src/gone.mts: listed as "reference only", but in neither package',
        'src/hook.mts: listed as "differs", but only in the reference',
        'src/same.mts: listed as "differs", but both packages have it, identical',
      ],
    );
  });
});

describe(filesOf, () => {
  test("lists a package's files by their path inside it, once each, and no other package's", () => {
    assert.deepStrictEqual(
      filesOf('libs/synstate-react-hooks', [
        'libs/synstate-react-hooks/src/a.mts',
        'libs/synstate-react-hooks-compat/src/a.mts',
        'libs/synstate-react-hooks/test/a.test.mts',
        'libs/synstate-react-hooks/src/a.mts',
      ]),
      ['src/a.mts', 'test/a.test.mts'],
    );
  });
});
