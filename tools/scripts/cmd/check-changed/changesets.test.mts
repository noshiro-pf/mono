import dedent from 'dedent';
import { findMissingChangesets, isChangesetFile } from './changesets.mjs';

describe('findMissingChangesets', () => {
  const released = [
    { name: 'ts-data-forge', dir: 'libs/ts-data-forge' },
    { name: 'split-view-extension', dir: 'apps/split-view-extension' },
  ] as const;

  test('names a released package whose src/ changed with no changeset', () => {
    assert.deepStrictEqual(
      findMissingChangesets({
        changedFiles: [
          'libs/ts-data-forge/src/array.mts',
          'apps/split-view-extension/src/app.tsx',
        ],
        released,
        changesets: [],
      }),
      ['split-view-extension', 'ts-data-forge'],
    );
  });

  test('a changeset that names the package covers it', () => {
    assert.deepStrictEqual(
      findMissingChangesets({
        changedFiles: [
          'libs/ts-data-forge/src/array.mts',
          '.changeset/brave-cats.md',
        ],
        released,
        changesets: [
          {
            file: '.changeset/brave-cats.md',
            content: dedent`
              ---
              'ts-data-forge': patch
              ---

              Fix it.
            `,
          },
        ],
      }),
      [],
    );
  });

  test('changes outside src/ and in other packages need none', () => {
    assert.deepStrictEqual(
      findMissingChangesets({
        changedFiles: [
          'libs/ts-data-forge/README.md',
          'libs/ts-data-forge/test/array.test.mts',
          'libs/ts-data-forge/src/array.test.mts',
          'apps/profile/src/index.mts',
        ],
        released,
        changesets: [],
      }),
      [],
    );
  });
});

describe('isChangesetFile', () => {
  test.each([
    ['.changeset/brave-cats.md', true],
    ['.changeset/README.md', false],
    ['.changeset/config.json', false],
    ['libs/x/.changeset/a.md', false],
  ] as const)('%s → %s', (file, expected) => {
    assert.strictEqual(isChangesetFile(file), expected);
  });
});
