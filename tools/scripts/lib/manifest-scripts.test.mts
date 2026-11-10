import { matchScriptNames, readScripts } from './manifest-scripts.mjs';

describe('matchScriptNames', () => {
  const names = [
    'check:md',
    'check:prose',
    'check:prose:one',
    'check:prose:two',
  ] as const;

  test('takes a literal name', () => {
    assert.deepStrictEqual(matchScriptNames('check:md', names), ['check:md']);
  });

  test('takes a name that no script defines as nothing', () => {
    assert.deepStrictEqual(matchScriptNames('check:absent', names), []);
  });

  test('expands the regular expression pnpm reads between slashes', () => {
    assert.deepStrictEqual(matchScriptNames('/check:prose:.*/', names), [
      'check:prose:one',
      'check:prose:two',
    ]);
  });

  test('expands an npm-run-all glob', () => {
    assert.deepStrictEqual(matchScriptNames('check:prose:*', names), [
      'check:prose:one',
      'check:prose:two',
    ]);
  });
});

describe('readScripts', () => {
  test('keeps the string-valued scripts only', () => {
    assert.deepStrictEqual(
      readScripts({ scripts: { a: 'pnpm run b', c: 1 } }),
      { a: 'pnpm run b' },
    );
  });

  test('reads a manifest with no scripts as none', () => {
    assert.deepStrictEqual(readScripts({}), {});

    assert.deepStrictEqual(readScripts({ scripts: [] }), {});

    assert.deepStrictEqual(readScripts('not a manifest'), {});
  });
});
