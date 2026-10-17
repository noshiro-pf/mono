import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { settingsFilePath } from './settings-file-path.mjs';

const dir = path.resolve('/tmp/repo-settings/environments');

/** `'rejected'` when the name was refused, the resolved path when it was not. */
const outcomeOf = (name: string): string => {
  const result = Result.fromThrowable(() => settingsFilePath(dir, name));

  return Result.isErr(result) ? 'rejected' : result.value;
};

describe(settingsFilePath, () => {
  test('names a file directly under the directory it was given', () => {
    assert.strictEqual(
      settingsFilePath(dir, 'release'),
      path.join(dir, 'release.json'),
    );
  });

  test('keeps the characters a name is allowed to carry', () => {
    assert.strictEqual(
      settingsFilePath(dir, 'main-no-bypass'),
      path.join(dir, 'main-no-bypass.json'),
    );

    assert.strictEqual(
      settingsFilePath(dir, 'Production (US East)'),
      path.join(dir, 'Production (US East).json'),
    );
  });

  test('rejects a name that would resolve above the directory', () => {
    assert.strictEqual(outcomeOf('../release'), 'rejected');

    assert.strictEqual(outcomeOf('../../../../tmp/elsewhere'), 'rejected');
  });

  test('rejects a name carrying a separator, rather than nesting it', () => {
    assert.strictEqual(outcomeOf('production/us-east'), 'rejected');

    assert.strictEqual(outcomeOf(String.raw`production\us-east`), 'rejected');
  });

  test('rejects the names that are not file names at all', () => {
    assert.strictEqual(outcomeOf(''), 'rejected');

    assert.strictEqual(outcomeOf('.'), 'rejected');

    assert.strictEqual(outcomeOf('..'), 'rejected');

    assert.strictEqual(outcomeOf('release\u{0}'), 'rejected');
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
