import { sh } from 'pr-merge-queue';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    // Every branch name and path the commands hand to git is quoted for a
    // POSIX shell, a single quote included.
    assert.strictEqual(sh("it's"), String.raw`'it'\''s'`);

    // embed-sample-code-ignore-below
  });
}
