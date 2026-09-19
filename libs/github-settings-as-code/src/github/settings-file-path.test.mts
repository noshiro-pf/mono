import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { settingsFilePath } from './settings-file-path.mjs';

const dir = path.resolve('/tmp/repo-settings/environments/bk');

/** `'rejected'` when the name was refused, the resolved path when it was not. */
const outcomeOf = (name: string): string => {
  const result = Result.fromThrowable(() => settingsFilePath(dir, name));

  return Result.isErr(result) ? 'rejected' : result.value;
};

describe(settingsFilePath, () => {
  test('names a file directly under the directory it was given', () => {
    assert.deepStrictEqual(
      settingsFilePath(dir, 'release'),
      path.join(dir, 'release.json'),
    );
  });

  test('keeps the characters a name is allowed to carry', () => {
    assert.deepStrictEqual(
      settingsFilePath(dir, 'main-no-bypass'),
      path.join(dir, 'main-no-bypass.json'),
    );

    assert.deepStrictEqual(
      settingsFilePath(dir, 'Production (US East)'),
      path.join(dir, 'Production (US East).json'),
    );
  });

  test('rejects a name that would resolve above the directory', () => {
    assert.deepStrictEqual(outcomeOf('../release'), 'rejected');

    assert.deepStrictEqual(outcomeOf('../../../../tmp/elsewhere'), 'rejected');
  });

  test('rejects a name carrying a separator, rather than nesting it', () => {
    assert.deepStrictEqual(outcomeOf('production/us-east'), 'rejected');

    assert.deepStrictEqual(
      outcomeOf(String.raw`production\us-east`),
      'rejected',
    );
  });

  test('rejects the names that are not file names at all', () => {
    assert.deepStrictEqual(outcomeOf(''), 'rejected');

    assert.deepStrictEqual(outcomeOf('.'), 'rejected');

    assert.deepStrictEqual(outcomeOf('..'), 'rejected');

    assert.deepStrictEqual(outcomeOf('release\u{0}'), 'rejected');
  });

  test('says which name it refused', () => {
    const result = Result.fromThrowable(() =>
      settingsFilePath(dir, '../release'),
    );

    assert.isTrue(Result.isErr(result));

    if (Result.isErr(result)) {
      assert.isTrue(result.value.message.includes('../release'));
    }
  });
});
