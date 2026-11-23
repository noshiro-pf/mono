import { KEPT_REPORT_KEYS, stackFoldsKey } from './settings-db.mjs';

describe('KEPT_REPORT_KEYS', () => {
  test('covers every report earlier builds kept, of any repository', () => {
    for (const key of [
      'report:noshiro-pf/mono',
      'report:example-org/hello',
      'report:a/b',
    ]) {
      assert.isTrue(inRange(key));
    }
  });

  test('leaves the settings the page still keeps', () => {
    for (const key of [
      'header-folded',
      'report',
      'reports',
      'repo:x/y',
      stackFoldsKey({ owner: 'noshiro-pf', repo: 'mono' }),
    ]) {
      assert.isFalse(inRange(key));
    }
  });
});

describe(stackFoldsKey, () => {
  test('is one key per repository, whatever the case it was named in', () => {
    assert.strictEqual(
      stackFoldsKey({ owner: 'Noshiro-PF', repo: 'Mono' }),
      'stack-folds:noshiro-pf/mono',
    );

    assert.notStrictEqual(
      stackFoldsKey({ owner: 'noshiro-pf', repo: 'mono' }),
      stackFoldsKey({ owner: 'noshiro-pf', repo: 'other' }),
    );
  });
});

// IndexedDB orders string keys by code unit, as `<` does.
const inRange = (key: string): boolean => {
  const [lower, upper] = KEPT_REPORT_KEYS;

  return lower <= key && key <= upper;
};
